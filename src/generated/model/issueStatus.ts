export enum IssueStatus {
  Completed = "Completed",
  Cancelled = "Cancelled",
  RequestedRefund = "RequestedRefund",
  Expired = "Expired",
  PendingWithBtcTxNotFound = "PendingWithBtcTxNotFound",
  PendingWithBtcTxNotIncluded = "PendingWithBtcTxNotIncluded",
  PendingWithTooFewConfirmations = "PendingWithTooFewConfirmations",
  PendingWithEnoughConfirmations = "PendingWithEnoughConfirmations",
}
