import { SubstrateBlock, toHex } from "@subsquid/substrate-processor";
import { LessThanOrEqual } from "typeorm";
import {
    CumulativeVolume,
    CumulativeVolumePerCurrencyPair, LendToken,
    Redeem,
    RedeemCancellation,
    RedeemExecution,
    RedeemPeriod,
    RedeemRequest,
    RedeemStatus,
    RelayedBlock,
    VolumeType
} from "../../model";
import { Ctx, EventItem } from "../../processor";
import {
    LoansNewMarketEvent,
    LoansActivatedMarketEvent,
    LoansUpdatedMarketEvent,

} from "../../types/events";
import { CurrencyId_Token as CurrencyId_Token_V6 } from "../../types/v6";
import { CurrencyId_Token as CurrencyId_Token_V10 } from "../../types/v10";
import { CurrencyId_Token as CurrencyId_Token_V15 } from "../../types/v15";
import { CurrencyId as CurrencyId_V17 } from "../../types/v17";
import { CurrencyId as CurrencyId_V1020000 } from "../../types/v1020000";
import { address, currencyId, legacyCurrencyId } from "../encoding";
import {
    updateCumulativeVolumes,
    updateCumulativeVolumesForCurrencyPair,
} from "../utils/cumulativeVolumes";
import EntityBuffer from "../utils/entityBuffer";
import { blockToHeight } from "../utils/heights";
import { getCurrentRedeemPeriod } from "../utils/requestPeriods";
import { getVaultId, getVaultIdLegacy } from "../_utils";
import { LoanMarket } from "../../model/generated/loanMarket.model";

export async function newMarket(
    ctx: Ctx,
    block: SubstrateBlock,
    item: EventItem,
    entityBuffer: EntityBuffer
): Promise<void> {
    const rawEvent = new LoansNewMarketEvent(ctx, item.event);
    let [currency_id, market] = rawEvent.asV1020000;
    const currency = currencyId.encode(currency_id);
    const lendToken = currencyId.encode(market.lendTokenId);
    const height = await blockToHeight(ctx, block.height, "NewMarket");
    const timestamp = new Date(block.timestamp);

    const borrowCap = market.borrowCap


    const my_market = new LoanMarket({
        id: `Market created at ${timestamp}`,
        token: currency,
        height: height,
        timestamp: timestamp,
        borrowCap: market.borrowCap,
        supplyCap: market.supplyCap,
        closeFactor: market.closeFactor,
        reserveFactor: market.reserveFactor,
        collateralFactor: market.collateralFactor,
        liquidateIncentive: market.liquidateIncentive,
        liquidationThreshold: market.liquidationThreshold,
        liquidateIncentiveReservedFactor: market.liquidateIncentiveReservedFactor
    });
    // console.log(JSON.stringify(my_market));
    await entityBuffer.pushEntity(LoanMarket.name, my_market);
}

