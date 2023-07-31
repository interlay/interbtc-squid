import { Deposit } from "../../model";
import { AccountLoanDeposits, AccountLoanDepositsResolver } from "./loanDepositsResolver";
import { BigDecimal } from '@subsquid/big-decimal';

describe("AccountLoanDepositsResolver", () => {
    describe("loanDepositsByAccountAndSymbol", () => {
        let fakeDepositsWithdrawals: Deposit[] = [];
        const fakeRepository = {
            findBy: (_: never) => Promise.resolve(fakeDepositsWithdrawals)
        };
        const fakeManager = {
            getRepository: (_: never) => fakeRepository
        };
        const fakeTx = () => Promise.resolve(fakeManager);

        it("should return zero values if no deposits/withdrawals exist", async () => {
            fakeDepositsWithdrawals = [];
            const aldResolver = new AccountLoanDepositsResolver(fakeTx as any);

            const actualResult = await aldResolver.loanDepositsByAccountAndSymbol("foo", "bar");

            const expectedSums = new AccountLoanDeposits({
                symbol: "foo",
                userParachainAddress: "bar",
                sumDeposits: 0n,
                sumDepositsBtc: BigDecimal(0),
                sumDepositsUsdt: BigDecimal(0),
                sumWithdrawals: 0n,
                sumWithdrawalsBtc: BigDecimal(0),
                sumWithdrawalsUsdt: BigDecimal(0),
            });

            expect(actualResult).toMatchObject(expectedSums);
        });

        it("should return expected sums", async () => {
            fakeDepositsWithdrawals = [
                new Deposit({
                    amountDeposited: 42n,
                    amountDepositedBtc: 42.2,
                    amountDepositedUsdt: 42.3,
                }),
                new Deposit({
                    amountDeposited: 1n,
                    amountDepositedBtc: 1,
                    amountDepositedUsdt: 1,
                }),
                new Deposit({
                    amountWithdrawn: 1n,
                    amountWithdrawnBtc: 1.2,
                    amountWithdrawnUsdt: 1.3
                }),
                new Deposit({
                    amountWithdrawn: 1n,
                    amountWithdrawnBtc: 1,
                    amountWithdrawnUsdt: 1
                })
            ];
            
            const aldResolver = new AccountLoanDepositsResolver(fakeTx as any);
            const actualResult = await aldResolver.loanDepositsByAccountAndSymbol("foo", "bar");

            expect(actualResult).toMatchObject({
                sumDeposits: 42n + 1n,
                sumDepositsBtc: BigDecimal(42.2 + 1),
                sumDepositsUsdt: BigDecimal(42.3 + 1),
                sumWithdrawals: 1n + 1n,
                sumWithdrawalsBtc: BigDecimal(1.2 + 1),
                sumWithdrawalsUsdt: BigDecimal(1.3 + 1),
            });
        });
    });
})