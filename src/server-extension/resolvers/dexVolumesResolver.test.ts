import { BigDecimal } from "@subsquid/big-decimal";
import { NativeToken, PooledAmount, Swap, Token } from "../../model";
import * as mapping_utils from "../../mappings/_utils";
import {
    testHelpers,
    DexVolumesResolver,
    DexVolumesByPoolArgs,
    DexAmount
} from "./dexVolumesResolver";

// tests for the custom resolver arguments class
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

describe("DexVolumesResolver", () => {
    const dotToken = new NativeToken({ token: Token.DOT });
    const ibtcToken = new NativeToken({ token: Token.IBTC });
    const dotAmount = 3800n;
    const ibtcAmount = 1n;

    let swapDOTinIBTCout: Swap;
    let swapIBTCinDOTout: Swap;

    beforeEach(() => {
        swapDOTinIBTCout = new Swap({
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
        swapIBTCinDOTout = Object.assign(new Swap(), swapDOTinIBTCout);
        const tmp = swapIBTCinDOTout.from;
        swapIBTCinDOTout.from = swapIBTCinDOTout.to;
        swapIBTCinDOTout.to = tmp;
    });

    describe("accumulateDexVolumeSums", () => {
        it("sums up in/out amounts as expected", () => {
            const actualSums = testHelpers.accumulateDexVolumeSums(
                dotToken,
                ibtcToken,
                [swapDOTinIBTCout, swapIBTCinDOTout]
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
                [swapDOTinIBTCout, swapDOTinIBTCout]
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
    
    describe("buildNewDexVolumesPair", () => {
        afterEach(() => {
            jest.resetAllMocks();
        });

        it("should convert from DexVolumeSums to DexPoolVolumePairs format as expected", async () => {
            // starts with something like [{token1in, token1out}, {token2in, token2out}]
            // and should convert to [{token1in, token2in}, {token1out, token2out}] with human amounts

            // mock tickerFromCurrency, return token string if it is a token, "FOO" otherwise
            jest.spyOn(mapping_utils, "tickerFromCurrency").mockImplementation((currency) => Promise.resolve((currency as any).token || "FOO"));
            // mock convertToHuman to simply return 0
            jest.spyOn(mapping_utils, "convertAmountToHuman").mockImplementation((_currency, amount) => Promise.resolve(BigDecimal(0)));

            const fakeDotAmounts = {
                token: dotToken,
                in: dotAmount + 42n,
                out: dotAmount
            };

            const fakeIbtcAmounts = {
                token: ibtcToken,
                in: ibtcAmount,
                out: ibtcAmount + 1n
            };

            const testInputSums = {
                token1: fakeDotAmounts,
                token2: fakeIbtcAmounts
            };

            const actualDexVolumesPair = await testHelpers.buildNewDexVolumesPair(testInputSums);

            // build expected output format from fake inputs manually
            const expectedIbtcIn = new DexAmount({
                ticker: ibtcToken.token,
                amount: fakeIbtcAmounts.in,
                amountHuman: BigDecimal(0) // mocked away
            });

            const expectedIbtcOut = new DexAmount({
                ticker: ibtcToken.token,
                amount: fakeIbtcAmounts.out,
                amountHuman: BigDecimal(0) // mocked away
            });

            const expectedDotIn = new DexAmount({
                ticker: dotToken.token,
                amount: fakeDotAmounts.in,
                amountHuman: BigDecimal(0) // mocked away
            });

            const expectedDotOut = new DexAmount({
                ticker: dotToken.token,
                amount: fakeDotAmounts.out,
                amountHuman: BigDecimal(0) // mocked away
            });

            expect(actualDexVolumesPair).toEqual({
                in: [expectedDotIn, expectedIbtcIn],
                out: [expectedDotOut, expectedIbtcOut]
            });
        });
    });
    
    // todo: add tests
    describe("getGeneralDexTradingVolumesByPool", () => {
        // helper method to create dummy tx manager method to feed into constructor
        const mockTxManager = (mockSwaps: Swap[]) => () => Promise.resolve({
            getRepository: () => ({
                findBy: () => { return mockSwaps; }
            })
        } as any);

        beforeEach(() => {
            // mock tickerFromCurrency, return token string if it is a token, "FOO" otherwise
            jest.spyOn(mapping_utils, "tickerFromCurrency").mockImplementation((currency) => Promise.resolve((currency as any).token || "FOO"));
            // mock convertToHuman to simply return original amount
            jest.spyOn(mapping_utils, "convertAmountToHuman").mockImplementation((_currency, amount) => Promise.resolve(BigDecimal(amount)));

        });

        afterEach(() => {
            jest.resetAllMocks();
        });

        it("should return volumes as expected", async () => {
            // mock so it only returns one swap, from DOT to IBTC
            const dexVolumeResolver = new DexVolumesResolver(mockTxManager([swapDOTinIBTCout]));

            const args = new DexVolumesByPoolArgs();
            args.token1 = "DOT";
            args.token2 = "IBTC";

            const actualVolumesByPool = await dexVolumeResolver.getGeneralDexTradingVolumesByPool(args);

            expect(actualVolumesByPool.poolId).toEqual("(DOT,IBTC)");
            expect(actualVolumesByPool.volumesIn.length).toEqual(2);
            expect(actualVolumesByPool.volumesOut.length).toEqual(2);

            // volumes in checks
            const volIn0 = actualVolumesByPool.volumesIn[0]
            // first volume in is for DOT (because it resolves before IBTC)
            expect(volIn0.ticker).toEqual("DOT");
            // first amount is the same as first swap (because no other swaps were added)
            expect(volIn0.amount).toEqual(swapDOTinIBTCout.from.amount);
            // second amount in is zero (no IBTC amount in for given swap)
            expect(actualVolumesByPool.volumesIn[1].amount).toEqual(0n);

            // volumes out checks
            const volOut1 = actualVolumesByPool.volumesOut[1]; // expect IBTC values here
            expect(volOut1.ticker).toEqual("IBTC");
            expect(volOut1.amount).toEqual(swapDOTinIBTCout.to.amount);
            // second out amount is zero, no DOT went out in given swap
            expect(actualVolumesByPool.volumesOut[0].amount).toEqual(0n);
        });

        it("should return zero volumes for each ticker in & out if no swaps found", async () => {
            // mock no swaps returned from tx manager
            const dexVolumeResolver = new DexVolumesResolver(mockTxManager([]));

            const args = new DexVolumesByPoolArgs();
            args.token1 = "DOT";
            args.token2 = "IBTC";

            const actualVolumesByPool = await dexVolumeResolver.getGeneralDexTradingVolumesByPool(args);

            expect(actualVolumesByPool.poolId).toEqual("(DOT,IBTC)");
            expect(actualVolumesByPool.volumesIn.length).toEqual(2);
            expect(actualVolumesByPool.volumesOut.length).toEqual(2);

            // collect just amounts from all volumes in and out
            const allAmounts = [...actualVolumesByPool.volumesIn, ...actualVolumesByPool.volumesOut].map((vol) => vol.amount);
            expect(allAmounts).toEqual([0n, 0n, 0n, 0n]);
        });

        it("should treat first and second token params interchangeably", async () => {
            // mock no swaps returned from tx manager
            const dexVolumeResolver = new DexVolumesResolver(mockTxManager([]));

            const args = new DexVolumesByPoolArgs();
            args.token1 = "DOT";
            args.token2 = "IBTC";

            const argsReversed = new DexVolumesByPoolArgs();
            // swap DOT/IBTC around
            argsReversed.token1 = args.token2;
            argsReversed.token2 = args.token1;
            
            const actualResults = await dexVolumeResolver.getGeneralDexTradingVolumesByPool(args);
            const actualResultsReversedArgs = await dexVolumeResolver.getGeneralDexTradingVolumesByPool(argsReversed);

            // it should show the same inferred pool id
            expect(actualResults.poolId).toEqual(actualResultsReversedArgs.poolId);

            // but it should respect the token argument order, ie. show first token used in args first in list of volumes
            expect(actualResults.volumesIn[0].ticker).toEqual(args.token1);
            expect(actualResults.volumesOut[0].ticker).toEqual(args.token1);
            expect(actualResultsReversedArgs.volumesIn[0].ticker).toEqual(argsReversed.token1);
            expect(actualResultsReversedArgs.volumesOut[0].ticker).toEqual(argsReversed.token1);
        });

        it("should default endDate to new Date() if not provided", async () => {
            // mock no swaps returned from tx manager
            const dexVolumeResolver = new DexVolumesResolver(mockTxManager([]));

            const args = new DexVolumesByPoolArgs();
            args.token1 = "DOT";
            args.token2 = "IBTC";

            const dateBeforeCall = new Date();
            const actualVolumesByPool = await dexVolumeResolver.getGeneralDexTradingVolumesByPool(args);
            
            // compare unix seconds, so can be equal
            expect(actualVolumesByPool.endDate.getTime()).toBeGreaterThanOrEqual(dateBeforeCall.getTime());
        });

        it("should keep endDate value if passed in", async () => {
            // mock no swaps returned from tx manager
            const dexVolumeResolver = new DexVolumesResolver(mockTxManager([]));

            const args = new DexVolumesByPoolArgs();
            args.token1 = "DOT";
            args.token2 = "IBTC";
            args.endDate = new Date("2023-01-01T00:00:00Z");

            const actualVolumesByPool = await dexVolumeResolver.getGeneralDexTradingVolumesByPool(args);
            
            expect(actualVolumesByPool.endDate.getTime()).toEqual(args.endDate.getTime());
        });

        it("should default startDate to 7 days before endDate", async () => {
            // mock no swaps returned from tx manager
            const dexVolumeResolver = new DexVolumesResolver(mockTxManager([]));

            const args = new DexVolumesByPoolArgs();
            args.token1 = "DOT";
            args.token2 = "IBTC";
            args.endDate = new Date("2023-01-08T00:00:00Z");

            const expectedStartDate = new Date("2023-01-01T00:00:00Z");
            const actualVolumesByPool = await dexVolumeResolver.getGeneralDexTradingVolumesByPool(args);
            
            // compare unix seconds, so can be equal
            expect(actualVolumesByPool.startDate.getTime()).toEqual(expectedStartDate.getTime());
        });

        it("should keep startDate value if passed in", async () => {
            // mock no swaps returned from tx manager
            const dexVolumeResolver = new DexVolumesResolver(mockTxManager([]));

            const args = new DexVolumesByPoolArgs();
            args.token1 = "DOT";
            args.token2 = "IBTC";
            args.startDate = new Date("2023-01-01T00:00:00Z");
            args.endDate = new Date("2023-01-08T00:00:00Z");

            const actualVolumesByPool = await dexVolumeResolver.getGeneralDexTradingVolumesByPool(args);
            
            expect(actualVolumesByPool.startDate.getTime()).toEqual(args.startDate.getTime());
        });

        it("should throw if no first or second currency/token is provided", async () => {
            // mock no swaps returned from tx manager
            const dexVolumeResolver = new DexVolumesResolver(mockTxManager([]));

            const argsNo1st = new DexVolumesByPoolArgs();
            argsNo1st.token2 = "IBTC";
            await expect(dexVolumeResolver.getGeneralDexTradingVolumesByPool(argsNo1st)).rejects.toThrow(Error);

            const argsNo2nd = new DexVolumesByPoolArgs();
            argsNo2nd.token1 = "DOT";
            await expect(dexVolumeResolver.getGeneralDexTradingVolumesByPool(argsNo2nd)).rejects.toThrow(Error);
        });
    });
});