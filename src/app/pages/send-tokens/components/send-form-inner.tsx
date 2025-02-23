import { Suspense, useCallback, useEffect } from 'react';
import { useFormikContext } from 'formik';
import { Box, Text, Button, Stack } from '@stacks/ui';

import { HIGH_FEE_AMOUNT_STX } from '@shared/constants';
import { useDrawers } from '@app/common/hooks/use-drawers';
import { useNextTxNonce } from '@app/common/hooks/account/use-next-tx-nonce';
import { useSelectedAsset } from '@app/common/hooks/use-selected-asset';
import { isEmpty } from '@app/common/utils';
import {
  getDefaultSimulatedFeeEstimations,
  getFeeEstimationsWithMaxValues,
  isTxSponsored,
  TransactionFormValues,
} from '@app/common/transactions/transaction-utils';
import { ErrorLabel } from '@app/components/error-label';
import { ShowEditNonceAction } from '@app/components/show-edit-nonce';
import { FeeRow } from '@app/components/fee-row/fee-row';
import { AssetSearch } from '@app/pages/send-tokens/components/asset-search/asset-search';
import { AmountField } from '@app/pages/send-tokens/components/amount-field';
import { useTransferableAssets } from '@app/store/assets/asset.hooks';
import { RecipientField } from '@app/pages/send-tokens/components/recipient-field';
import { MemoField } from '@app/pages/send-tokens/components/memo-field';
import { useFeeEstimationsQuery } from '@app/query/fees/fees.hooks';
import { useFeeEstimationsState } from '@app/store/transactions/fees.hooks';
import { SendFormSelectors } from '@tests/page-objects/send-form.selectors';
import {
  useEstimatedTransactionByteLengthState,
  useSerializedTransactionPayloadState,
  useUnsignedTxForSettingsState,
} from '@app/store/transactions/transaction.hooks';

import { SendFormMemoWarning } from './memo-warning';
import { useAnalytics } from '@app/common/hooks/analytics/use-analytics';

interface SendFormInnerProps {
  assetError: string | undefined;
}
export function SendFormInner(props: SendFormInnerProps) {
  const { assetError } = props;
  const { handleSubmit, values, setValues, errors, setFieldError, setFieldValue, validateForm } =
    useFormikContext<TransactionFormValues>();
  const { showHighFeeConfirmation, setShowHighFeeConfirmation } = useDrawers();
  const serializedTxPayload = useSerializedTransactionPayloadState();
  const estimatedTxByteLength = useEstimatedTransactionByteLengthState();
  const { data: feeEstimationsResp, isError } = useFeeEstimationsQuery(
    serializedTxPayload,
    estimatedTxByteLength
  );
  const [, setFeeEstimations] = useFeeEstimationsState();
  const { selectedAsset } = useSelectedAsset();
  const assets = useTransferableAssets();
  const analytics = useAnalytics();
  const [transaction] = useUnsignedTxForSettingsState();
  const isSponsored = transaction ? isTxSponsored(transaction) : false;

  useNextTxNonce();

  useEffect(() => {
    if (!values.fee && feeEstimationsResp) {
      if (
        (isError || !!feeEstimationsResp?.error || !feeEstimationsResp.estimations.length) &&
        estimatedTxByteLength
      ) {
        setFeeEstimations(getDefaultSimulatedFeeEstimations(estimatedTxByteLength));
        void analytics.track('use_fee_estimation_default_simulated');
      }
      if (feeEstimationsResp.estimations && feeEstimationsResp.estimations.length) {
        const feeEstimationsWithMaxValues = getFeeEstimationsWithMaxValues(
          feeEstimationsResp.estimations
        );
        setFeeEstimations(feeEstimationsWithMaxValues);
        void analytics.track('use_fee_estimation', {
          maxValues: feeEstimationsWithMaxValues,
          estimations: feeEstimationsResp.estimations,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estimatedTxByteLength, feeEstimationsResp, isError, setFeeEstimations, setFieldValue]);

  const onSubmit = useCallback(async () => {
    if (selectedAsset && values.amount && values.recipient && values.fee) {
      // We need to check for errors here before we show the high fee confirmation
      const formErrors = await validateForm();
      if (isEmpty(formErrors) && values.fee > HIGH_FEE_AMOUNT_STX) {
        return setShowHighFeeConfirmation(!showHighFeeConfirmation);
      }
      handleSubmit();
    }
  }, [
    handleSubmit,
    selectedAsset,
    setShowHighFeeConfirmation,
    showHighFeeConfirmation,
    validateForm,
    values.amount,
    values.fee,
    values.recipient,
  ]);

  const onItemSelect = useCallback(() => {
    if (assets.length === 1) return;
    setValues({ ...values, amount: '', fee: '' });
    setFieldError('amount', undefined);
  }, [assets.length, setValues, values, setFieldError]);

  const hasValues = values.amount && values.recipient !== '' && values.fee;

  const symbol = selectedAsset?.type === 'stx' ? 'STX' : selectedAsset?.meta?.symbol;

  return (
    <Stack spacing="loose" flexDirection="column" flexGrow={1} shouldWrapChildren>
      <AssetSearch onItemClick={onItemSelect} />
      <Suspense fallback={<></>}>
        <AmountField
          error={errors.amount}
          feeQueryError={!!feeEstimationsResp?.error}
          value={values.amount || 0}
        />
      </Suspense>
      <RecipientField error={errors.recipient} value={values.recipient} />
      {selectedAsset?.hasMemo && <MemoField value={values.memo} error={errors.memo} />}
      {selectedAsset?.hasMemo && symbol && <SendFormMemoWarning symbol={symbol} />}
      {feeEstimationsResp && <FeeRow fieldName="fee" isSponsored={isSponsored} />}
      <Box mt="auto">
        {assetError && (
          <ErrorLabel mb="base">
            <Text textStyle="caption">{assetError}</Text>
          </ErrorLabel>
        )}
        <Button
          type="submit"
          borderRadius="12px"
          width="100%"
          isDisabled={!hasValues}
          onClick={onSubmit}
          data-testid={SendFormSelectors.BtnPreviewSendTx}
        >
          Preview
        </Button>
      </Box>
      <ShowEditNonceAction />
    </Stack>
  );
}
