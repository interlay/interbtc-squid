query MyQuery {
  deposits(orderBy: timestamp_DESC, where: {amountDeposited_isNull: true}) {
    amountDeposited
    amountDepositedBtc
    amountDepositedUsdt
    symbol
    timestamp
    userParachainAddress
    comment
    amountWithdrawn
    amountWithdrawnBtc
    amountWithdrawnUsdt
  }
}


query MyQuery {
  loanMarkets {
    supplyCap
    borrowCap
    state
    token {
      ... on NativeToken {
        __typename
        token
      }
      ... on ForeignAsset {
        __typename
        asset
      }
    }
  }
}

query MyQuery {
  loans {
    amountBorrowedUsdt
    timestamp
    userParachainAddress
    token {
      ... on NativeToken {
        __typename
        token
      }
      ... on ForeignAsset {
        __typename
        asset
      }
    }
  }
}

query MyQuery {
  loans {
    amountBorrowedUsdt
    timestamp
    userParachainAddress
    token {
      ... on NativeToken {
        __typename
        token
      }
      ... on ForeignAsset {
        __typename
        asset
      }
    }
  }
}


