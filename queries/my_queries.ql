query MyQuery {
  oracleUpdates(limit: 1, orderBy: timestamp_DESC, where: {typeKey: {token_eq: KSM}, AND: {type_eq: ExchangeRate}}) {
    timestamp
    type
    typeKey {
      ... on NativeToken {
        __typename
        token
      }
      ... on ForeignAsset {
        __typename
        asset
      }
    }
    updateValue
  }
}

select user_parachain_address as para_user,
substring(currency_symbol from 2) as currency,
sum(amount_deposited_usdt)/1e3 - sum(amount_withdrawn_usdt)/1e3 as deposit_net_usd,
sum(amount_deposited_btc) - sum(amount_withdrawn_btc) as deposit_net_btc
from deposit D
where type='collateral'
group by user_parachain_address, currency_symbol
having sum(amount_deposited_btc) - sum(amount_withdrawn_btc)>0
order by 3 desc


with A as (
    select user_parachain_address as para_user,
    substring(currency_symbol from 2) as currency,
    (sum(coalesce(amount_deposited_usdt, 0)) - sum(coalesce(amount_withdrawn_usdt, 0))) as deposit_net_usd,
    (sum(coalesce(amount_deposited_btc, 0)) - sum(coalesce(amount_withdrawn_btc, 0))) as deposit_net_btc
    from deposit D
    where type='collateral'
    group by user_parachain_address, currency_symbol
    --having sum(amount_deposited_btc) - sum(amount_withdrawn_btc)!=0
), B as (
    select user_parachain_address as para_user,
    currency_symbol as currency,
    (sum(coalesce(amount_borrowed_usdt, 0))/1e3 - sum(coalesce(amount_repaid_usdt, 0))) as borrowed_net_usd,
    (sum(coalesce(amount_borrowed_btc, 0)) - sum(coalesce(amount_repaid_btc, 0))) as borrowed_net_btc
    from loan L
    group by user_parachain_address, currency_symbol
    --having sum(amount_borrowed_usdt)/1e3 - sum(amount_repaid_usdt)!=0
), C as (
    select * from 
    A 
    full outer join B using(para_user, currency)
)
select para_user,
sum(deposit_net_usd) as deposits,
sum(borrowed_net_usd) as loans,
(sum(deposit_net_usd) / sum(borrowed_net_usd)) as health_ratio 
from C
group by para_user
order by 4
--where para_user='a3cvbSffuU4ezwVoSwBc89sMNeCXgUXa1bsVUD3KG526eKHc5'