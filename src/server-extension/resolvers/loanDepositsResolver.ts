import { Arg, Field, ObjectType, Query, Resolver } from 'type-graphql';
import type { EntityManager } from 'typeorm';
import { Currency, Deposit } from '../../model';

// Define custom GraphQL ObjectType of the query result
@ObjectType()
export class AccountLoanDeposits {
  @Field(() => String, { nullable: false })
  userParachainAddress!: string;

  @Field(() => String, {nullable: false})
  symbol!: string;

  @Field(() => BigInt, { nullable: false })
  sumDeposits!: bigint;

  @Field(() => BigInt, { nullable: false })
  sumDepositsBtc!: bigint;
  
  @Field(() => BigInt, { nullable: false })
  sumDepositsUsdt!: bigint;

  @Field(() => BigInt, { nullable: false })
  sumWithdrawals!: bigint;

  @Field(() => BigInt, { nullable: false })
  sumWithdrawalsBtc!: bigint;

  @Field(() => BigInt, { nullable: false })
  sumWithdrawalsUsdt!: bigint;

  constructor(props: Partial<AccountLoanDeposits>) {
    Object.assign(this, props);
  }
}

@Resolver()
export class AccountLoanDepositResolver {
  constructor(private tx: () => Promise<EntityManager>) {}

  @Query(() => AccountLoanDeposits)
  async totalLoanDeposits(
    @Arg('symbol', { nullable: false }) symbol: string,
    @Arg('userParachainAddress', { nullable: false }) userParachainAddress: string
  ): Promise<AccountLoanDeposits> {
    const manager = await this.tx();

    const depositWithdrawalsList = await manager.getRepository(Deposit)
        .findBy({
            symbol,
            userParachainAddress,
            type: "lending"
        });
    
    const sums = depositWithdrawalsList.reduce((acc, depositEntity) => {
        acc.sumDeposits += depositEntity.amountDeposited || 0n;
        acc.sumDepositsBtc += depositEntity.amountDepositedBtc ? BigInt(depositEntity.amountDepositedBtc) : 0n;
        acc.sumDepositsUsdt += depositEntity.amountDepositedUsdt ? BigInt(depositEntity.amountDepositedUsdt) : 0n;

        acc.sumWithdrawals += depositEntity.amountWithdrawn || 0n;
        acc.sumWithdrawalsBtc += depositEntity.amountWithdrawnBtc ? BigInt(depositEntity.amountWithdrawnBtc) : 0n;
        acc.sumWithdrawalsUsdt += depositEntity.amountWithdrawnUsdt ? BigInt(depositEntity.amountWithdrawnUsdt) : 0n;

        return acc;
    },
    {
        sumDeposits: 0n,
        sumDepositsBtc: 0n,
        sumDepositsUsdt: 0n,
        sumWithdrawals: 0n,
        sumWithdrawalsBtc: 0n,
        sumWithdrawalsUsdt: 0n,
    });

    return new AccountLoanDeposits({
        userParachainAddress,
        symbol,
        ...sums
    });
  }
}