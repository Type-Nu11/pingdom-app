import React, { useEffect, useRef, useState } from 'react';
import Barcode from '@aramir/react-native-barcode';
import styled from 'styled-components/native';

const BAR_HEIGHT = 68;
const BAR_WIDTH = 2;

type CouponBarcodeProps = {
  /**
   * The coupon code exactly as the server issued it. The readable line below the
   * bars is the functional part — staff read it into
   * `POST /merchant-owner/offers/coupons/redeem`, whose `code` pattern requires
   * the dashed UUID form, so the dashes and segment lengths must survive. That
   * pattern accepts either case (`[0-9a-fA-F]`), so the line is upper-cased for
   * legibility while the bars encode the value verbatim.
   */
  code: string;
  /** Shown when the bars cannot be drawn. The readable code stays either way. */
  unavailableLabel: string;
  /**
   * Masked label for the readable code (e.g. "Coupon code ending in AFA6"). The
   * screen reader announces this instead of spelling the full code aloud; the
   * visible line still shows it in full for staff to read or the user to copy.
   */
  codeAccessibilityLabel: string;
};

/**
 * The bars are decorative: nothing scans them, so they are hidden from screen
 * readers and the readable code below carries the meaning.
 */
export default function CouponBarcode({
  code,
  unavailableLabel,
  codeAccessibilityLabel,
}: CouponBarcodeProps) {
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
        // The library's component does not forward a testID or accessibility
        // props, so the wrapper carries them.
        <BarSlot
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          testID="v2-coupon-barcode-svg"
        >
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
      <CodeText
        accessibilityLabel={codeAccessibilityLabel}
        selectable
        testID="v2-coupon-barcode-code"
      >
        {code.toUpperCase()}
      </CodeText>
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
