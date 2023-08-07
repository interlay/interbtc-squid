import { ForeignAsset as LibForeignAsset } from "@interlay/interbtc-api";
import { cacheForeignAssets, getForeignAsset, symbolFromCurrency, testHelpers } from "./_utils";
import { ForeignAsset, NativeToken, Token } from "../model";

// mocking getForeignAsset and getForeignAssets in the lib (interBtcApi)
const libGetForeignAssetsMock = jest.fn();
const libGetForeignAssetMock = jest.fn();
const mockInterBtcApi = {
    assetRegistry: {
        getForeignAssets: () => libGetForeignAssetsMock(),
        getForeignAsset: (id: number) => libGetForeignAssetMock(id)
    }
};

// "default" good result mock implementation, should be set inside tests, too (will be reset between tests)
const getInterBtcApiMock = jest.fn().mockImplementation(() => Promise.resolve(mockInterBtcApi));
jest.mock("./utils/interBtcApi", () => {
    const originalModule = jest.requireActual("./utils/interBtcApi");

    return {
        __esModule: true,
        ...originalModule,
        getInterBtcApi: () => getInterBtcApiMock()
    }
});

describe("_utils", () => {
    // fake asset to play with
    const fakeAsset = {
        foreignAsset: {
            id: 42,
            coingeckoId: "foo"
        },
        name: "FooCoin",
        ticker:"FOO",
        decimals: 7
    };

    afterAll(() => {
        jest.resetAllMocks();
    });

    describe("getForeignAsset", () => {
        beforeEach(() => {
            // clean out cache
            testHelpers.getForeignAssetsCache().clear();
        });

        afterEach(() => {
            libGetForeignAssetMock.mockReset();
            getInterBtcApiMock.mockReset();
        });

        it("should fetch value from cache first", async () => {
            libGetForeignAssetMock.mockImplementation(() => Promise.resolve(fakeAsset));
            getInterBtcApiMock.mockImplementation(() => Promise.resolve(mockInterBtcApi));

            // relies on cache to have been passed as reference
            testHelpers.getForeignAssetsCache().set(fakeAsset.foreignAsset.id, fakeAsset);

            const actualAsset = await getForeignAsset(fakeAsset.foreignAsset.id);
            expect(actualAsset).toBe(fakeAsset);
            expect(getInterBtcApiMock).not.toHaveBeenCalled();
            expect(libGetForeignAssetMock).not.toHaveBeenCalled();
        });

        it("should fetch from lib and add to cache", async () => {
            libGetForeignAssetMock.mockImplementation(() => Promise.resolve(fakeAsset));
            getInterBtcApiMock.mockImplementation(() => Promise.resolve(mockInterBtcApi));

            // clean out cache
            testHelpers.getForeignAssetsCache().clear();

            const actualAsset = await getForeignAsset(fakeAsset.foreignAsset.id);
            expect(getInterBtcApiMock).toHaveBeenCalledTimes(1);
            expect(libGetForeignAssetMock).toHaveBeenCalledTimes(1);

            expect(actualAsset).toBe(fakeAsset);

            const cacheNow = testHelpers.getForeignAssetsCache();
            expect(cacheNow.size).toBe(1);
            expect(cacheNow.has(fakeAsset.foreignAsset.id)).toBe(true);
        });

        it("should reject if getInterBtcApi rejects", async () => {
            getInterBtcApiMock.mockImplementation(() => Promise.reject(Error("soz lol")));

            await expect(getForeignAsset(fakeAsset.foreignAsset.id)).rejects.toThrow("soz lol");
            expect(getInterBtcApiMock).toHaveBeenCalledTimes(1);
            expect(libGetForeignAssetMock).not.toHaveBeenCalled();
        });

        it("should reject if assetRegistry.getForeignAssets rejects", async () => {
            getInterBtcApiMock.mockImplementation(() => Promise.resolve(mockInterBtcApi));
            libGetForeignAssetMock.mockImplementation(() => Promise.reject(Error("computer says no")));

            await expect(getForeignAsset(fakeAsset.foreignAsset.id)).rejects.toThrow("computer says no");
            expect(getInterBtcApiMock).toHaveBeenCalledTimes(1);
            expect(libGetForeignAssetMock).toHaveBeenCalledTimes(1);
        });
    });

    describe("cacheForeignAssets", () => {
        afterEach(() => {
            libGetForeignAssetsMock.mockReset();
            getInterBtcApiMock.mockReset();
        });

        it("should get all foreign assets from lib as expected", async () => {
            const fakeAssets = [fakeAsset];
            libGetForeignAssetsMock.mockImplementation(() => Promise.resolve(fakeAssets));
            getInterBtcApiMock.mockImplementation(() => Promise.resolve(mockInterBtcApi));
    
            await cacheForeignAssets();
            const actualCache = testHelpers.getForeignAssetsCache();
    
            expect(getInterBtcApiMock).toHaveBeenCalledTimes(1);
            expect(libGetForeignAssetsMock).toHaveBeenCalledTimes(1);
            expect(actualCache.has(fakeAsset.foreignAsset.id)).toBe(true);
            expect(actualCache.get(fakeAsset.foreignAsset.id)).toBe(fakeAsset);
        });

        it("should reject if getInterBtcApi rejects", async () => {
            getInterBtcApiMock.mockImplementation(() => Promise.reject(Error("nope")));

            await expect(cacheForeignAssets()).rejects.toThrow("nope");
            expect(getInterBtcApiMock).toHaveBeenCalledTimes(1);
            expect(libGetForeignAssetsMock).not.toHaveBeenCalled();
        });

        it("should reject if assetRegistry.getForeignAssets rejects", async () => {
            libGetForeignAssetsMock.mockImplementation(() => Promise.reject(Error("no assets for you")));
            getInterBtcApiMock.mockImplementation(() => Promise.resolve(mockInterBtcApi));

            await expect(cacheForeignAssets()).rejects.toThrow("no assets for you");
            expect(getInterBtcApiMock).toHaveBeenCalledTimes(1);
            expect(libGetForeignAssetsMock).toHaveBeenCalledTimes(1);
        });

        it("should set usdt asset id if found", async () => {
            const oldUsdtAssetId = testHelpers.getUsdtAssetId() | 0;

            const fakeUsdtAsset = {
                foreignAsset: {
                    id: oldUsdtAssetId + 13,
                    coingeckoId: "usdt"
                },
                name: "Tether USD",
                ticker:"USDT",
                decimals: 6
            };
            const fakeAssets = [
                fakeAsset,
                fakeUsdtAsset,
            ];

            libGetForeignAssetsMock.mockImplementation(() => Promise.resolve(fakeAssets));
            getInterBtcApiMock.mockImplementation(() => Promise.resolve(mockInterBtcApi));

            await cacheForeignAssets();

            const newUsdtAssetId = testHelpers.getUsdtAssetId();
            expect(newUsdtAssetId).toBe(fakeUsdtAsset.foreignAsset.id);
        });

        it("should not set usdt asset id if not found", async () => {
            const oldUsdtAssetId = testHelpers.getUsdtAssetId();

            const fakeAssets = [
                fakeAsset,
            ];

            libGetForeignAssetsMock.mockImplementation(() => Promise.resolve(fakeAssets));
            getInterBtcApiMock.mockImplementation(() => Promise.resolve(mockInterBtcApi));

            await cacheForeignAssets();

            const newUsdtAssetId = testHelpers.getUsdtAssetId();
            expect(newUsdtAssetId).toBe(oldUsdtAssetId);
        });
    });

    describe("symbolFromCurrency", () => {
        it("should return token name for native token", async () => {
            const testNativeToken = new NativeToken({token: Token.KINT});
            const actualSymbol = await symbolFromCurrency(testNativeToken);

            expect(actualSymbol).toBe(Token.KINT);
        });

        it("should return ticker for foreign asset", async () => {
            const testAssetId = fakeAsset.foreignAsset.id;
            // prepare cache for lookup
            testHelpers.getForeignAssetsCache().set(testAssetId, fakeAsset);
            
            const testForeignAsset = new ForeignAsset({asset: testAssetId});
            const actualSymbol = await symbolFromCurrency(testForeignAsset);
            expect(actualSymbol).toBe(fakeAsset.ticker);
        });

        it("should return unknown for unhandled currency type", async () => {
            const badTestCurrency = {
                isTypeOf: "definitely not a valid type"
            };

            const actualSymbol = await symbolFromCurrency(badTestCurrency as any);
            expect(actualSymbol).toBe("UNKNOWN");
        });

    });
});