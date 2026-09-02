import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'react-native-qrcode-svg';
import styled from 'styled-components/native';

const QR_SIZE = 196;
const QR_QUIET_ZONE = 12;

type CouponQrCodeProps = {
  /** The exact code returned by CouponResponse. No prefix or derived token is added. */
  code: string;
  /** Masked screen-reader label; the visible fallback remains selectable in full. */
  codeAccessibilityLabel: string;
  unavailableLabel: string;
};

export default function CouponQrCode({
  code,
  codeAccessibilityLabel,
  unavailableLabel,
}: CouponQrCodeProps) {
  const [failedCode, setFailedCode] = useState<string | null>(null);
  const reportedCode = useRef<string | null>(null);
  const failed = failedCode === code;

  // react-native-qrcode-svg invokes onError while calculating its render. Move
  // the state update past commit so React never updates this parent mid-render.
  useEffect(() => {
    if (reportedCode.current !== null && reportedCode.current !== failedCode) {
      setFailedCode(reportedCode.current);
    }
  });

  return (
    <Plate testID="v2-coupon-qr">
      {failed ? (
        <QrPlaceholder />
      ) : (
        <QrSlot
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <QRCode
            backgroundColor="#FFFFFF"
            color="#0C0C0D"
            ecl="M"
            onError={() => { reportedCode.current = code; }}
            quietZone={QR_QUIET_ZONE}
            size={QR_SIZE}
            testID="v2-coupon-qr-image"
            value={code}
          />
        </QrSlot>
      )}
      <CodeText
        accessibilityLabel={codeAccessibilityLabel}
        selectable
        testID="v2-coupon-qr-code"
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
  padding: 20px 12px 18px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.surface};
`;

const QrSlot = styled.View`
  width: ${QR_SIZE}px;
  height: ${QR_SIZE}px;
`;

const QrPlaceholder = styled.View`
  width: ${QR_SIZE}px;
  height: ${QR_SIZE}px;
`;

const CodeText = styled.Text`
  max-width: 100%;
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-align: center;
`;

const FallbackText = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 12px;
  text-align: center;
`;
