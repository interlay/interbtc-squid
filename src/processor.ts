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
    issuePeriodChange,
    redeemPeriodChange,
    registerVault,
    requestIssue,
    requestRedeem,
    requestRefund,
    setInitialPeriods,
    storeMainChainHeader,
    updateActiveBlock,
    updateVaultActivity,
} from "./mappings";
import { tokensTransfer } from "./mappings/event/transfer";
import { deposit, withdraw } from "./mappings/event/escrow";

const processor = new SubstrateProcessor(
    "interbtc" // "interbtc_status" schema will be created in the database
);

const archive = process.env.ARCHIVE_ENDPOINT;
assert(!!archive);
const chain = process.env.CHAIN_ENDPOINT;
assert(!!chain);
processor.setDataSource({ archive, chain });
processor.setTypesBundle("indexer/typesBundle.json");

const processFrom = Number(process.env.PROCESS_FROM) || 0;
processor.setBlockRange({ from: processFrom });

processor.addEventHandler(
    "btcRelay.StoreMainChainHeader",
    storeMainChainHeader
);
processor.addEventHandler("escrow.Deposit", deposit);
processor.addEventHandler("escrow.Withdraw", withdraw);
processor.addEventHandler("issue.CancelIssue", cancelIssue);
processor.addEventHandler("issue.ExecuteIssue", executeIssue);
processor.addEventHandler("issue.RequestIssue", requestIssue);
processor.addEventHandler("issue.IssuePeriodChange", issuePeriodChange);
processor.addEventHandler("oracle.FeedValues", feedValues);
processor.addEventHandler("redeem.CancelRedeem", cancelRedeem);
processor.addEventHandler("redeem.ExecuteRedeem", executeRedeem);
processor.addEventHandler("redeem.RequestRedeem", requestRedeem);
processor.addEventHandler("redeem.RedeemPeriodChange", redeemPeriodChange);
processor.addEventHandler("refund.ExecuteRefund", executeRefund);
processor.addEventHandler("refund.RequestRefund", requestRefund);
processor.addEventHandler("security.UpdateActiveBlock", updateActiveBlock);
processor.addEventHandler("tokens.Transfer", tokensTransfer);
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

processor.addPostHook(
    { range: { from: processFrom, to: processFrom } },
    setInitialPeriods
);
processor.addPostHook(findAndUpdateExpiredRequests);

processor.run();
