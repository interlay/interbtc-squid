import { BigDecimal } from '@subsquid/big-decimal';
import { Arg, Args, ArgsType, Field, Int, ObjectType, Query, Resolver } from 'type-graphql';
import { type EntityManager, Between } from 'typeorm';
import { PoolType, PooledAmount, PooledToken, Swap, Token, fromJsonPooledToken } from '../../model';
import { inferGeneralPoolId } from '../../mappings/utils/pools';
import { isEqual } from 'lodash';
import { convertAmountToHuman, tickerFromCurrency } from '../../mappings/_utils';
import { IsOptional } from 'class-validator';

@ObjectType()
export class DexAmount {
    constructor(props?: Partial<DexAmount>) {
        Object.assign(this, props)
    }

    @Field(() => String, {nullable: false})
    ticker!: string;

    @Field(() => BigInt, {nullable: false})
    amount!: bigint;

    @Field(() => BigDecimal, {nullable: false})
    amountHuman!: BigDecimal;
}

@ObjectType()
export class DexTradingVolumesByPool {
    constructor(props?: Partial<DexTradingVolumesByPool>) {
        Object.assign(this, props)
    }

    @Field(() => String, {nullable: false})
    poolId!: string;
  
    @Field(() => String, {nullable: false})
    poolType!: string;

    @Field(() => Date, {nullable: false})
    startDate!: Date;

    @Field(() => Date, {nullable: false})
    endDate!: Date;

    @Field(() => [DexAmount], {nullable: false})
    volumesIn!: DexAmount[];

    @Field(() => [DexAmount], {nullable: false})
    volumesOut!: DexAmount[];
}

type TokenWithAmounts = {
    token: PooledToken,
    in: bigint,
    out: bigint,
}

type DexVolumeSums = {
    token1: TokenWithAmounts,
    token2: TokenWithAmounts,
};

// in/out volumes for token1/token2 respectively
type DexPoolVolumesPair = { in: [DexAmount, DexAmount], out: [DexAmount, DexAmount] };

const buildTokenInOutVolumes = async (
    tokenAmounts: TokenWithAmounts
): Promise<{in: DexAmount, out: DexAmount}> => {
    const { token, in: amountIn, out: amountOut } = tokenAmounts;
    const ticker = await tickerFromCurrency(token);

    const [ amountHumanIn, amountHumanOut ] = await Promise.all([
        convertAmountToHuman(token, amountIn),
        convertAmountToHuman(token, amountOut)
    ]);

    return {
        in: new DexAmount({
            ticker,
            amount: amountIn,
            amountHuman: amountHumanIn
        }),
        out: new DexAmount({
            ticker,
            amount: amountOut,
            amountHuman: amountHumanOut
        })
    };
}

const buildNewDexVolumesPair = async (
    sums: DexVolumeSums
): Promise<DexPoolVolumesPair> => {
    const [
        {in: t1In, out: t1Out},
        {in: t2In, out: t2Out}
    ] = await Promise.all([
        buildTokenInOutVolumes(sums.token1),
        buildTokenInOutVolumes(sums.token2)
    ]);

    return { in: [t1In, t2In],  out: [t1Out, t2Out] };
}

const queryEntityManagerForDexGeneralSwaps = async (
    tx: () => Promise<EntityManager>,
    poolId: string,
    startDate: Date,
    endDate: Date
): Promise<Swap[]> => {
    const manager = await tx();

    return await manager.getRepository(Swap)
        .findBy({
            poolType: PoolType.Standard,
            poolId,
            timestamp: Between(startDate, endDate)
        });
};

// assumes all swaps are between two specific tokens (ie. not a multi-ccy pool, just swap pairs)
const accumulateDexVolumeSums = (
    token1: PooledToken,
    token2: PooledToken,
    swaps: Swap[],
): DexVolumeSums => {
    const isToken1 = (token: PooledToken) => isEqual(token1, token);

    const startingValue: DexVolumeSums = {
        token1: {
            token: token1,
            in: 0n,
            out: 0n,
        },
        token2: {
            token: token2,
            in: 0n,
            out: 0n,
        },
    };

    return swaps.reduce((acc, swapEntity) => {
        const tokenIn = swapEntity.from.token;
        const amountIn = swapEntity.from.amount;
        const amountOut = swapEntity.to.amount;

        if(isToken1(tokenIn)) {
            acc.token1.in += amountIn;
            acc.token2.out += amountOut;
        } else {
            acc.token2.in += amountIn;
            acc.token1.out += amountOut;
        }

        return acc;
    }, startingValue);
}

/**
 * Testhelper export for better testing/mocking, use at your own risk
 */
export const testHelpers = {
    accumulateTokenPairInOutAmounts: accumulateDexVolumeSums,
    queryEntityManagerForDexGeneralSwaps,
    buildVolumesInOut: buildNewDexVolumesPair,
};

// input structure that's compatible with the fromJsonPooledToken method
type PooledTokenInputFields = {
    isTypeOf: string,
    token?: string,
    asset?: number,
    lendTokenId?: number,
    poolId?: number,
}

@ArgsType()
class DexVolumesByPoolArgs {
    @Field(() => Date, {
        nullable: true,
        description: "(optional) startDate in iso 8061 format. Defaults to 1 week before endDate."
    })
    @IsOptional()
    startDate?: Date;

    @Field(() => Date, {
        nullable: true,
        description: "(optional) endDate in ISO 8061 format. Defaults to current date/time."
    })
    @IsOptional()
    endDate?: Date;

    @Field(() => String, {
        nullable: true,
        description: "(optional) native token identifier (if the first currency of the pair is a native token.)"
    })
    @IsOptional()
    token1?: string;

    @Field(() => Int, {
        nullable: true,
        description: "(optional) asset id value (if the first currency of the pair is a foreign asset.)"
    })
    @IsOptional()
    assetId1?: number;

    @Field(() => Int, {
        nullable: true,
        description: "(optional) lend token id value (if the first currency of the pair is a lend token.)"
    })
    @IsOptional()
    lendTokenId1?: number;

    @Field(() => Int, {
        nullable: true,
        description: "(optional) stable pool id value (if the first currency of the pair is a stable pool.)"
    })
    @IsOptional()
    poolId1?: number;

    // helper to identify which token type the optional inputs represent
    private _findType(input: Partial<PooledTokenInputFields>): string | undefined {
        return (input.token != null) ? "NativeToken"
        : (input.asset != null) ? "ForeignAsset"
        : (input.lendTokenId != null) ? "LendToken"
        : (input.poolId != null) ? "StableLpToken"
        : undefined
    }

    get token1Json(): PooledTokenInputFields {
        const input: Partial<PooledTokenInputFields> = {
            token: this.token1,
            asset: this.assetId1,
            lendTokenId: this.lendTokenId1,
            poolId: this.poolId1
        };
        const type = this._findType(input);

        if(type === undefined) {
            throw Error("Unable to detect token/currency type for the given parameters, " 
                + "please make sure that one of the fields (token1, assetId1, lendTokenId1, poolId1) is set");
        }

        return {
            isTypeOf: type,
            ...input
        };
    }

    @Field(() => String, {
        nullable: true,
        description: "(optional) native token identifier (if the second currency of the pair is a native token.)"
    })
    @IsOptional()
    token2?: string;

    @Field(() => Int, {
        nullable: true,
        description: "(optional) asset id value (if the second currency of the pair is a foreign asset.)"
    })
    @IsOptional()
    assetId2?: number;

    @Field(() => Int, {
        nullable: true,
        description: "(optional) lend token id value (if the second currency of the pair is a lend token.)"
    })
    @IsOptional()
    lendTokenId2?: number;

    @Field(() => Int, {
        nullable: true,
        description: "(optional) stable pool id value (if the second currency of the pair is a stable pool.)"
    })
    @IsOptional()
    poolId2?: number;

    get token2Json(): PooledTokenInputFields {
        const input: Partial<PooledTokenInputFields> = {
            token: this.token2,
            asset: this.assetId2,
            lendTokenId: this.lendTokenId2,
            poolId: this.poolId2
        };

        const type = this._findType(input);

        if(type === undefined) {
            throw Error("Unable to detect token/currency type for the given parameters, " 
                + "please make sure that one of the fields (token2, assetId2, lendTokenId2, poolId2) is set");
        }

        return {
            isTypeOf: type,
            ...input
        };
    }
}

@Resolver()
export class DexVolumesResolver {
  constructor(private tx: () => Promise<EntityManager>) {}

  @Query(() => DexTradingVolumesByPool, {
    description: "Fetch trading volumes for a general dex by currency pairs, start and end date.\n"
        + "Needs exactly one of token1, assetId1, lendTokenId1, or poolId1 defined for the first currency in the pairing.\n"
        + "Needs exactly one of token2, assetId2, lendTokenId2, or poolId2 defined for the second currency in the pairing.\n"
  })
  async getGeneralDexTradingVolumesByPool(
    @Args()
    { startDate, endDate, token1Json, token2Json }: DexVolumesByPoolArgs,
  ): Promise<DexTradingVolumesByPool> {

    // convert from input to internal & output type
    const currency1 = fromJsonPooledToken(token1Json);
    const currency2 = fromJsonPooledToken(token2Json);

    const generalPoolId = inferGeneralPoolId(currency1, currency2);

    // default to now if not set
    if (!endDate) {
        endDate = new Date();
    }

    // default to end date minus 7 days if not set
    if (!startDate) {
        // clone end date
        startDate = new Date(endDate);
        // mutate start date
        startDate.setDate(startDate.getDate() - 7);
    }

    const swapsList = await queryEntityManagerForDexGeneralSwaps(
        this.tx,
        generalPoolId,
        startDate,
        endDate,
    );

    const sums = accumulateDexVolumeSums(currency1, currency2, swapsList);
    const volumes = await buildNewDexVolumesPair(sums);

    const dexTradingVolumes = new DexTradingVolumesByPool({
        poolId: generalPoolId,
        poolType: PoolType.Standard,
        startDate,
        endDate,
        volumesIn: volumes.in,
        volumesOut: volumes.out,
    });

    return dexTradingVolumes;
  }
}