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

