import React, { useEffect, useRef, useState } from 'react';
import Barcode from '@aramir/react-native-barcode';
import styled from 'styled-components/native';

const BAR_HEIGHT = 68;
const BAR_WIDTH = 2;

type CouponBarcodeProps = {
  /**
   * The coupon code exactly as the server issued it. It is encoded verbatim so a
   * scan produces the value `POST /merchant-owner/offers/coupons/redeem` accepts
   * — that endpoint requires the dashed UUID form, so it must not be reformatted.
   */
  code: string;
  /** Shown when the code cannot be encoded, so staff can still read it out. */
  unavailableLabel: string;
};

export default function CouponBarcode({ code, unavailableLabel }: CouponBarcodeProps) {
  // jsbarcode lays the bars out at their intrinsic width, so the plate measures
  // itself and caps the barcode instead of letting a long code overflow.
  const [availableWidth, setAvailableWidth] = useState(0);

  // The library reports an encode failure while it renders, so the failing code
  // is parked on a ref and promoted to state after commit — setting state during
  // another component's render is a React error. Tracking which code failed (not
  // a plain boolean) keeps the flag from sticking when the code changes.
  const [failedCode, setFailedCode] = useState<string | null>(null);
  const reportedCode = useRef<string | null>(null);
  const failed = failedCode === code;

  useEffect(() => {
    if (reportedCode.current !== null && reportedCode.current !== failedCode) {
      setFailedCode(reportedCode.current);
    }
  });

  return (
    <Plate
      onLayout={(event) => setAvailableWidth(event.nativeEvent.layout.width)}
      testID="v2-coupon-barcode"
    >
      {availableWidth > 0 && !failed ? (
        // The library's component does not forward a testID, so the wrapper
        // carries it.
        <BarSlot testID="v2-coupon-barcode-svg">
          <Barcode
            background="rgba(0,0,0,0)"
            format="CODE128"
            height={BAR_HEIGHT}
            maxWidth={availableWidth}
            onError={() => { reportedCode.current = code; }}
            value={code}
            width={BAR_WIDTH}
          />
        </BarSlot>
      ) : (
        <BarPlaceholder />
      )}
      <CodeText selectable testID="v2-coupon-barcode-code">{code.toUpperCase()}</CodeText>
      {failed ? <FallbackText>{unavailableLabel}</FallbackText> : null}
    </Plate>
  );
}

const Plate = styled.View`
  align-self: stretch;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md - 4}px;
  padding: 20px 20px 18px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.surface};
`;

const BarSlot = styled.View`
  align-items: center;
`;

// Holds the bars' height while the plate measures itself, so the ticket does not
// jump on the first layout pass.
const BarPlaceholder = styled.View`
  height: ${BAR_HEIGHT}px;
`;

const CodeText = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 1px;
  text-align: center;
`;

const FallbackText = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 12px;
  text-align: center;
`;
