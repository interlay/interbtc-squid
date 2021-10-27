export enum RedeemStatus {
  Completed = "Completed",
  Expired = "Expired",
  Reimbursed = "Reimbursed",
  Retried = "Retried",
  PendingWithBtcTxNotFound = "PendingWithBtcTxNotFound",
  PendingWithBtcTxNotIncluded = "PendingWithBtcTxNotIncluded",
  PendingWithTooFewConfirmations = "PendingWithTooFewConfirmations",
  PendingWithEnoughConfirmations = "PendingWithEnoughConfirmations",
}
