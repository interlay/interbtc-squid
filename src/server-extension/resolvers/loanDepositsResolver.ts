import { Arg, Field, ObjectType, Query, Resolver } from 'type-graphql';
import type { EntityManager } from 'typeorm';
import { Deposit } from '../../model';
import { BigDecimal } from '@subsquid/big-decimal';

@ObjectType()
export class AccountLoanDeposits {
  @Field(() => String, { nullable: true })
  userParachainAddress!: string;

  @Field(() => String, {nullable: false})
  symbol!: string;

  @Field(() => BigInt, { nullable: false })
  sumDeposits!: bigint;

  @Field(() => BigDecimal, { nullable: false })
  sumDepositsBtc!: BigDecimal;
  
  @Field(() => BigDecimal, { nullable: false })
  sumDepositsUsdt!: BigDecimal;

  @Field(() => BigInt, { nullable: false })
  sumWithdrawals!: bigint;

  @Field(() => BigDecimal, { nullable: false })
  sumWithdrawalsBtc!: BigDecimal;

  @Field(() => BigDecimal, { nullable: false })
  sumWithdrawalsUsdt!: BigDecimal;

  constructor(props: Partial<AccountLoanDeposits>) {
    Object.assign(this, props);
  }
}

@Resolver()
export class AccountLoanDepositsResolver {
  constructor(private tx: () => Promise<EntityManager>) {}

  @Query(() => AccountLoanDeposits)
  async loanDepositsByAccountAndSymbol(
    @Arg('symbol', { nullable: false })
    symbol: string,
    @Arg('userParachainAddress', { nullable: false })
    userParachainAddress: string
  ): Promise<AccountLoanDeposits> {
    const manager = await this.tx();

    const depositWithdrawalsList = await manager.getRepository(Deposit)
        .findBy({
            type: "lending",
            symbol,
            userParachainAddress,
        });
    
    const sums = depositWithdrawalsList.reduce((acc, depositEntity) => {
        acc.sumDeposits += depositEntity.amountDeposited || 0n;
        if (depositEntity.amountDepositedBtc) {
            acc.sumDepositsBtc = acc.sumDepositsBtc.add(depositEntity.amountDepositedBtc);
        }
        if (depositEntity.amountDepositedUsdt) {
            acc.sumDepositsUsdt = acc.sumDepositsUsdt.add(depositEntity.amountDepositedUsdt);
        }

        acc.sumWithdrawals += depositEntity.amountWithdrawn || 0n;
        if (depositEntity.amountWithdrawnBtc) {
            acc.sumWithdrawalsBtc = acc.sumWithdrawalsBtc.add(depositEntity.amountWithdrawnBtc);
        }
        if (depositEntity.amountWithdrawnUsdt) {
            acc.sumWithdrawalsUsdt = acc.sumWithdrawalsUsdt.add(depositEntity.amountWithdrawnUsdt);
        }

        return acc;
    },
    {
        sumDeposits: 0n,
        sumDepositsBtc: BigDecimal(0),
        sumDepositsUsdt: BigDecimal(0),
        sumWithdrawals: 0n,
        sumWithdrawalsBtc: BigDecimal(0),
        sumWithdrawalsUsdt: BigDecimal(0),
    });

    return new AccountLoanDeposits({
        userParachainAddress,
        symbol,
        ...sums
    });
  }
}