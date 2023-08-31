import { BigDecimal } from "@subsquid/big-decimal";
import { NativeToken, PooledAmount, Swap, Token } from "../../model";
import {
    testHelpers,
    DexVolumesResolver,
    DexVolumesByPoolArgs
} from "./dexVolumesResolver";


describe("DexVolumes resolver helper functions", () => {
    describe("accumulateDexVolumeSums", () => {
        it("sums up in/out amounts as expected", () => {
            const dotToken = new NativeToken({ token: Token.DOT });
            const ibtcToken = new NativeToken({ token: Token.IBTC });

            const dotAmount = 3800n;
            const ibtcAmount = 1n;
    
            const swap1 = new Swap({
                from: new PooledAmount({
                    token: dotToken,
                    amount: dotAmount
                }),
                to: new PooledAmount({
                    token: ibtcToken,
                    amount: ibtcAmount,
                })
            });
    
            // clone and change around to/from
            const swap2 = Object.assign(new Swap(), swap1);
            const tmp = swap2.from;
            swap2.from = swap2.to;
            swap2.to = tmp;

            const actualSums = testHelpers.accumulateDexVolumeSums(
                dotToken,
                ibtcToken,
                [swap1, swap2]
            );

            expect(actualSums).toEqual({
                token1: {
                    token: dotToken,
                    in: dotAmount,
                    out: dotAmount // because we mirrored in/out trades
                },
                token2: {
                    token: ibtcToken,
                    in: ibtcAmount,
                    out: ibtcAmount // because we mirrored in/out swaps
                }
            });

            // if we use 2x swap1 (DOT in, IBTC out) expect sums to reflect that
            const actualSums2 = testHelpers.accumulateDexVolumeSums(
                dotToken,
                ibtcToken,
                [swap1, swap1]
            );
            
            expect(actualSums2).toEqual({
                token1: {
                    token: dotToken,
                    in: dotAmount * 2n, // we added 2x swap1 with DOT in
                    out: 0n
                },
                token2: {
                    token: ibtcToken,
                    in: 0n,
                    out: ibtcAmount * 2n // we added 2x swap1 with IBTC in
                }
            });
        });
    });

    // TODO
    describe.skip("buildNewDexVolumesPair", () => {});
});

describe("DexVolumesByPoolArgs", () => {
    describe("getTokenJson", () => {
        it("should resolve native tokens as expected", () => {
            const testTokensArgs = new DexVolumesByPoolArgs();
            const fakeToken1 = "FOO";
            const fakeToken2 = "BAR";
            const expectedType = "NativeToken";

            testTokensArgs.token1 = fakeToken1;
            testTokensArgs.token2 = fakeToken2;

            expect(testTokensArgs.token1Json).toEqual({
                isTypeOf: expectedType,
                token: fakeToken1
            });

            expect(testTokensArgs.token2Json).toEqual({
                isTypeOf: expectedType,
                token: fakeToken2
            });
        });

        it("should resolve foreign assets as expected", () => {
            const testAssetArgs = new DexVolumesByPoolArgs();
            const fakeAsset1 = 42;
            const fakeAsset2 = 1;
            const expectedType = "ForeignAsset";
            testAssetArgs.assetId1 = fakeAsset1;
            testAssetArgs.assetId2 = fakeAsset2;

            expect(testAssetArgs.token1Json).toEqual({
                isTypeOf: expectedType,
                asset: fakeAsset1
            });

            expect(testAssetArgs.token2Json).toEqual({
                isTypeOf: expectedType,
                asset: fakeAsset2
            });
        });

        it("should resolve lend tokens as expected", () => {
            const testLendTokensArgs = new DexVolumesByPoolArgs();
            const fakeLendToken1 = 2;
            const fakeLendToken2 = 7;
            const expectedType = "LendToken";
            testLendTokensArgs.lendTokenId1 = fakeLendToken1;
            testLendTokensArgs.lendTokenId2 = fakeLendToken2;

            expect(testLendTokensArgs.token1Json).toEqual({
                isTypeOf: expectedType,
                lendTokenId: fakeLendToken1
            });

            expect(testLendTokensArgs.token2Json).toEqual({
                isTypeOf: expectedType,
                lendTokenId: fakeLendToken2
            });
        });

        it("should throw if no token, foreign asset id, or lend token id is set", () => {
            const brokenArgs = new DexVolumesByPoolArgs();
            // no tokens, foreign asset ids, or lend token ids set

            expect(() => brokenArgs.token1Json).toThrow(Error);
            expect(() => brokenArgs.token2Json).toThrow(Error);
        });
    });
});

// todo: add tests
describe.skip("DexVolumesResolver", () => {
    describe("getGeneralDexTradingVolumesByPool", () => {
    });

});