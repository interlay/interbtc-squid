export enum IssueStatus {
  Completed = "Completed",
  Cancelled = "Cancelled",
  Expired = "Expired",
  PendingWithBtcTxNotFound = "PendingWithBtcTxNotFound",
  PendingWithBtcTxNotIncluded = "PendingWithBtcTxNotIncluded",
  PendingWithTooFewConfirmations = "PendingWithTooFewConfirmations",
  PendingWithEnoughConfirmations = "PendingWithEnoughConfirmations",
}
