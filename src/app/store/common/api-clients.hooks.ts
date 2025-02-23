import { useAtomValue } from 'jotai/utils';
import { apiClientState } from '@app/store/common/api-clients';

export function useApi() {
  return useAtomValue(apiClientState);
}

export type Api = ReturnType<typeof useApi>;
