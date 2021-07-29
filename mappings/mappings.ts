import {  Account, HistoricalBalance } from '../generated/graphql-server/model'

// run 'NODE_URL=<RPC_ENDPOINT> EVENTS=<comma separated list of events> yarn codegen:mappings-types'
// to genenerate typescript classes for events, such as Balances.TransferEvent
import { Balances } from './generated/types'
import BN from 'bn.js'
import {
  DatabaseManager,
  EventContext,
  StoreContext,
} from '@subsquid/hydra-common'

async function getOrCreate<T>(
  e: { new (...args: any[]): T },
  id: string,
  store: DatabaseManager
): Promise<T> {
  let entity: T | undefined = await store.get<T>(e, {
    where: { id },
  })

  if (entity === undefined) {
    entity = new e() as T
    ;(<any>entity).id = id
  }
  return entity
}


export async function balancesTransfer({
  store,
  event,
  block,
  extrinsic,
}: EventContext & StoreContext) {
  const [from, to, value] = new Balances.TransferEvent(event).params
  
  
  const fromAcc = await getOrCreate<Account>(Account, from.toHex(), store)
  fromAcc.wallet = from.toHuman()

  const tip = extrinsic ? new BN(extrinsic.tip.toString(10)) : new BN(0)
  fromAcc.balance = fromAcc.balance || new BN(0)
  fromAcc.balance = fromAcc.balance.sub(value)
  fromAcc.balance = fromAcc.balance.sub(tip)

  await store.save<Account>(fromAcc)

  const toAcc = await getOrCreate<Account>(Account, to.toHex(), store)
  toAcc.wallet = to.toHuman()
  
  toAcc.balance = toAcc.balance || new BN(0)
  toAcc.balance = toAcc.balance.add(value)

  await store.save<Account>(toAcc)


  const hbFrom = new HistoricalBalance()
  hbFrom.account = fromAcc;
  hbFrom.balance = fromAcc.balance;
  hbFrom.timestamp = new BN(block.timestamp)

  await store.save<HistoricalBalance>(hbFrom)

  const hbTo = new HistoricalBalance()
  hbTo.account = toAcc;
  hbTo.balance = toAcc.balance;
  hbTo.timestamp = new BN(block.timestamp)

  await store.save<HistoricalBalance>(hbTo)

}

