import { BitcoinNetwork, createInterBtcApi, InterBtcApi } from "@interlay/interbtc-api";

let interBtcApi: InterBtcApi | undefined = undefined;

export const getInterBtcApi = async (): Promise<InterBtcApi> => {
    if (interBtcApi === undefined || !interBtcApi.api.isConnected) {
        const PARACHAIN_ENDPOINT = process.env.CHAIN_ENDPOINT;
        const BITCOIN_NETWORK = process.env.BITCOIN_NETWORK as BitcoinNetwork;

        interBtcApi = await createInterBtcApi(PARACHAIN_ENDPOINT!, BITCOIN_NETWORK!);
    }
    return interBtcApi;
};

/**
 * Only exported for better testing, use at own risk
 */
export const testHelpers = { 
    unsafeSetInterBtcApi: (maybeApi: any) => {
        interBtcApi = maybeApi as InterBtcApi | undefined;
    }
}