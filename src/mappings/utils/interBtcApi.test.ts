import { BitcoinNetwork } from "@interlay/interbtc-api";
import { getInterBtcApi, testHelpers } from "./interBtcApi";

const createInterBtcApiMock = jest.fn();
jest.mock("@interlay/interbtc-api", () => {
    const originalModule = jest.requireActual("@interlay/interbtc-api");

    return {
        __esModule: true,
        ...originalModule,
        createInterBtcApi: (endpoint: string, network: BitcoinNetwork) => createInterBtcApiMock(endpoint, network)
    }
});


describe("interBtcApi", () => {
    afterAll(() => {
        jest.resetAllMocks();
    });

    describe("getInterBtcApi", () => {
        const connectedFakeApi = {
            api: {
                isConnected: true
            }
        };

        const disconnectedFakeApi = {
            api: {
                isConnected: false
            }
        };

        afterEach(() => {
            createInterBtcApiMock.mockReset();
        });

        it("should create a new instance", async () => {
            createInterBtcApiMock.mockImplementation((_args) => Promise.resolve(connectedFakeApi));

            // reset to undefined
            testHelpers.unsafeSetInterBtcApi(undefined);

            const actualApi = await getInterBtcApi();

            expect(actualApi).toBe(connectedFakeApi);
            expect(actualApi.api.isConnected).toBe(true);
            expect(createInterBtcApiMock).toHaveBeenCalledTimes(1);
        });

        it("should return connected instance if possible", async () => {
            testHelpers.unsafeSetInterBtcApi(connectedFakeApi);

            const actualApi = await getInterBtcApi();

            expect(actualApi).toBe(connectedFakeApi);
            expect(actualApi.api.isConnected).toBe(true);
            expect(createInterBtcApiMock).not.toHaveBeenCalled();
        });

        it("should create new instance if existing one is disconnected", async () => {
            createInterBtcApiMock.mockImplementation((_args) => Promise.resolve(connectedFakeApi));

            testHelpers.unsafeSetInterBtcApi(disconnectedFakeApi);

            const actualApi = await getInterBtcApi();

            expect(actualApi).toBe(connectedFakeApi);
            expect(actualApi.api.isConnected).toBe(true);
            expect(createInterBtcApiMock).toHaveBeenCalledTimes(1);
        });
    });
});