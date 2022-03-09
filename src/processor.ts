import { SubstrateProcessor } from "@subsquid/substrate-processor";
import assert from "assert";
import {
    cancelIssue,
    cancelRedeem,
    decreaseLockedCollateral,
    executeIssue,
    executeRedeem,
    executeRefund,
    feedValues,
    findAndUpdateExpiredRequests,
    increaseLockedCollateral,
    registerVault,
    requestIssue,
    requestRedeem,
    requestRefund,
    storeMainChainHeader,
    updateActiveBlock,
    updateVaultActivity,
} from "./mappings";

const processor = new SubstrateProcessor(
    "interbtc" // "interbtc_status" schema will be created in the database
);

const archive = process.env.ARCHIVE_ENDPOINT;
assert(!!archive);
const chain = process.env.CHAIN_ENDPOINT;
assert(!!chain);
processor.setDataSource({ archive, chain });
processor.setTypesBundle("indexer/typesBundle.json");

processor.addEventHandler(
    "btcRelay.StoreMainChainHeader",
    storeMainChainHeader
);
processor.addEventHandler("issue.CancelIssue", cancelIssue);
processor.addEventHandler("issue.ExecuteIssue", executeIssue);
processor.addEventHandler("issue.RequestIssue", requestIssue);
processor.addEventHandler("oracle.FeedValues", feedValues);
processor.addEventHandler("redeem.CancelRedeem", cancelRedeem);
processor.addEventHandler("redeem.ExecuteRedeem", executeRedeem);
processor.addEventHandler("redeem.RequestRedeem", requestRedeem);
processor.addEventHandler("refund.ExecuteRefund", executeRefund);
processor.addEventHandler("refund.RequestRefund", requestRefund);
processor.addEventHandler("security.UpdateActiveBlock", updateActiveBlock);
processor.addEventHandler("vaultRegistry.RegisterVault", registerVault);
processor.addEventHandler(
    "vaultRegistry.IncreaseLockedCollateral",
    increaseLockedCollateral
);
processor.addEventHandler(
    "vaultRegistry.DecreaseLockedCollateral",
    decreaseLockedCollateral
);

processor.addExtrinsicHandler(
    "relay.store_block_header",
    {
        triggerEvents: ["system.ExtrinsicSuccess", "system.ExtrinsicFailure"],
    },
    updateVaultActivity
);

processor.addPostHook(findAndUpdateExpiredRequests);

processor.run();
