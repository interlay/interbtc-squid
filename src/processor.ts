import { SubstrateProcessor } from "@subsquid/substrate-processor";
import { TypeormDatabase } from "@subsquid/typeorm-store";
import { eventArgsData } from "./mappings/_utils";
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

const archive = process.env.ARCHIVE_ENDPOINT;
assert(!!archive);
const chain = process.env.CHAIN_ENDPOINT;
assert(!!chain);

const processFrom = Number(process.env.PROCESS_FROM) || 0;

const processor = new SubstrateProcessor(
    new TypeormDatabase({ stateSchema: "interbtc" })
)
    .setDataSource({ archive, chain })
    .setTypesBundle("indexer/typesBundle.json")
    .setBlockRange({ from: processFrom });

const eventArgsData: eventArgsData = {
    data: {
        event: { args: true },
    },
};

processor
    .addEventHandler(
        "BtcRelay.StoreMainChainHeader",
        eventArgsData,
        storeMainChainHeader
    )
    .addEventHandler("Escrow.Deposit", eventArgsData, deposit)
    .addEventHandler("Escrow.Withdraw", eventArgsData, withdraw)
    .addEventHandler("Issue.CancelIssue", eventArgsData, cancelIssue)
    .addEventHandler("Issue.ExecuteIssue", eventArgsData, executeIssue)
    .addEventHandler("Issue.RequestIssue", eventArgsData, requestIssue)
    .addEventHandler(
        "Issue.IssuePeriodChange",
        eventArgsData,
        issuePeriodChange
    )
    .addEventHandler("Oracle.FeedValues", eventArgsData, feedValues)
    .addEventHandler("Redeem.CancelRedeem", eventArgsData, cancelRedeem)
    .addEventHandler("Redeem.ExecuteRedeem", eventArgsData, executeRedeem)
    .addEventHandler("Redeem.RequestRedeem", eventArgsData, requestRedeem)
    .addEventHandler(
        "Redeem.RedeemPeriodChange",
        eventArgsData,
        redeemPeriodChange
    )
    .addEventHandler("Refund.ExecuteRefund", eventArgsData, executeRefund)
    .addEventHandler("Refund.RequestRefund", eventArgsData, requestRefund)
    .addEventHandler(
        "Security.UpdateActiveBlock",
        eventArgsData,
        updateActiveBlock
    )
    .addEventHandler("Tokens.Transfer", eventArgsData, tokensTransfer)
    .addEventHandler(
        "VaultRegistry.RegisterVault",
        eventArgsData,
        registerVault
    )
    .addEventHandler(
        "VaultRegistry.IncreaseLockedCollateral",
        eventArgsData,
        increaseLockedCollateral
    )
    .addEventHandler(
        "VaultRegistry.DecreaseLockedCollateral",
        eventArgsData,
        decreaseLockedCollateral
    );

processor.addCallHandler("Relay.store_block_header", updateVaultActivity);

processor
    .addPostHook(
        { range: { from: processFrom, to: processFrom } },
        setInitialPeriods
    )
    .addPostHook(findAndUpdateExpiredRequests);

processor.run();
