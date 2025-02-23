import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import {
  assetItemState,
  assetsAnchoredState,
  fungibleTokensBaseState,
  stxTokenState,
  transferableAssetsState,
} from '@app/store/assets/tokens';
import { useCurrentNetwork } from '@app/common/hooks/use-current-network';
import type { Asset } from '@app/common/asset-types';
import { searchInputStore, selectedAssetIdState, selectedAssetStore } from './asset-search';

export const useAssets = () => {
  return useAtomValue(assetsAnchoredState);
};

export const useTransferableAssets = () => {
  return useAtomValue(transferableAssetsState);
};

export function useAssetItemState(asset: Asset) {
  const network = useCurrentNetwork();
  return useAtomValue(assetItemState([asset, network.url]));
}

export function useFungibleTokenBaseState() {
  return useAtomValue(fungibleTokensBaseState);
}

export function useStxTokenState() {
  return useAtomValue(stxTokenState);
}

export function useSelectedAssetState() {
  return useAtomValue(selectedAssetStore);
}

export function useUpdateSelectedAsset() {
  return useUpdateAtom(selectedAssetIdState);
}

export function useSearchInput() {
  return useAtomValue(searchInputStore);
}

export function useUpdateSearchInput() {
  return useUpdateAtom(searchInputStore);
}

export function useAssetByIdentifier(identifier: string) {
  const assets = useAtomValue(assetsAnchoredState);
  if (!identifier) return;
  const [contractId] = identifier.split('::');
  const [contractAddress, contractName] = contractId.split('.');
  return assets.find(
    asset =>
      asset.type === 'ft' &&
      asset.contractAddress === contractAddress &&
      asset.contractName === contractName
  );
}
