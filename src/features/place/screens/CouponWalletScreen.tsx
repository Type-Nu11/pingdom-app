import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Button from '../../../shared/components/Button';
import StatusBadge from '../../../shared/components/StatusBadge';

type CouponWalletScreenProps = { onBack: () => void; onExplore: () => void };

const CouponWalletScreen = ({ onBack, onExplore }: CouponWalletScreenProps) => {
  const { t } = useTranslation();
  return (
    <ScrollView contentContainerStyle={styles.container} contentInsetAdjustmentBehavior="automatic">
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.title}>{t('experience.coupon.title')}</Text>
        <Text style={styles.description}>{t('experience.coupon.description')}</Text>
        <StatusBadge label={t('experience.coupon.status')} tone="neutral" />
        <Button label={t('experience.coupon.action')} onPress={onExplore} />
        <Button
          label={t('experience.common.back')}
          labelStyle={styles.backText}
          onPress={onBack}
          style={styles.backButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  backButton: { backgroundColor: '#EAECF0' },
  backText: { color: '#344054' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, gap: 16, maxWidth: 640, padding: 24, width: '100%' },
  container: { alignItems: 'center', backgroundColor: '#F6F8FB', flexGrow: 1, justifyContent: 'center', padding: 24 },
  description: { color: '#475467', fontSize: 16, lineHeight: 24 },
  title: { color: '#101828', fontSize: 24, fontWeight: '700', lineHeight: 32 },
});

export default CouponWalletScreen;
