import { useAtom } from 'jotai';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import { transactionNetworkVersionState } from '@store/transactions';
import {
  accountAvailableStxBalanceState,
  accountsWithAddressState,
  currentAccountAvailableStxBalanceState,
  currentAccountBalancesUnanchoredState,
  currentAccountIndexState,
  currentAccountInfoState,
  currentAccountMempoolTransactionsState,
  currentAccountState,
  currentAccountStxAddressState,
  currentAccountTransactionsState,
  hasSwitchedAccountsState,
  refreshAccountDataState,
  transactionAccountIndexState,
} from '@store/accounts';

export function useAccountAvailableStxBalance(address: string) {
  return useAtomValue(accountAvailableStxBalanceState(address));
}

export function useCurrentAccountAvailableStxBalance() {
  return useAtomValue(currentAccountAvailableStxBalanceState);
}

function useAccountActivity() {
  return useAtomValue(currentAccountTransactionsState);
}

export function useAccountSingleTransaction(txid?: string) {
  const txs = useAccountActivity();
  if (!txid) return;
  return txs.find(tx => tx.tx_id === txid);
}

export function useCurrentAccountBalancesUnanchoredState() {
  return useAtomValue(currentAccountBalancesUnanchoredState);
}

export function useCurrentAccountMempoolTransactionsState() {
  return useAtomValue(currentAccountMempoolTransactionsState);
}

export function useAccounts() {
  return useAtomValue(accountsWithAddressState);
}

export function useCurrentAccountStxAddressState() {
  return useAtomValue(currentAccountStxAddressState);
}

export function useCurrentAccountInfo() {
  return useAtomValue(currentAccountInfoState);
}

export function useCurrentAccount() {
  return useAtomValue(currentAccountState);
}

export function useCurrentAccountIndex() {
  return useAtomValue(currentAccountIndexState);
}

export function useTransactionAccountIndex() {
  return useAtomValue(transactionAccountIndexState);
}

export function useTransactionNetworkVersion() {
  return useAtomValue(transactionNetworkVersionState);
}

export function useHasSwitchedAccounts() {
  return useAtom(hasSwitchedAccountsState);
}

export function useRefreshAccountData() {
  return useUpdateAtom(refreshAccountDataState);
}
