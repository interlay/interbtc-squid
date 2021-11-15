import { EventContext, StoreContext } from "@subsquid/hydra-common";
import { OracleUpdate, Vault } from "../../generated/model";
import { blockToHeight } from "../_utils";
import {create} from "../../types/_registry";

type OracleValues = [
    {
        feeEstimation?: any,
        exchangeRate?: string
    },
    string
][]

export async function feedValues({
    store,
    event,
    block,
}: EventContext & StoreContext): Promise<void> {
    const oracleId = create('AccountId', event.params[0].value).toString();
    const values = JSON.parse(event.params[1].value as string) as OracleValues;
    console.log("AAAAAAAAAAAAAAAAAAAAAAAAA");
    console.log(JSON.stringify(values));
    // const height = blockToHeight({ store }, block.height, "FeedValues");
    // const updateEntities = updates.map((update) => {
    //     console.log(update);
    //     // const key =
    //     // new OracleUpdate({
    //     //     id: `${oracleId}${block.height}`
    //     // })
    //     return;
    // });
}
