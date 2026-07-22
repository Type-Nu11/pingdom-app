import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Button from '../../../shared/components/Button';
import StatusBadge from '../../../shared/components/StatusBadge';
import {
  formatCurrency,
  formatDistance,
  formatLocalDateTime,
} from '../../../shared/i18n/formatters';

type PlaceDetailScreenProps = {
  placeId: string;
  notificationTitle?: string;
  notificationBody?: string;
  onBack: () => void;
  onCheckIn: () => void;
  onCoupon: () => void;
};

const PlaceDetailScreen = ({
  placeId,
  notificationTitle,
  notificationBody,
  onBack,
  onCheckIn,
  onCoupon,
}: PlaceDetailScreenProps) => {
  const { i18n, t } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.title}>
          {t('experience.placeDetail.title')}
        </Text>
        <Text style={styles.description}>{`ID ${placeId}`}</Text>
        <View style={styles.statusRow}>
          <StatusBadge label={t('experience.placeDetail.open')} tone="success" />
          <Text style={styles.meta}>
            {t('experience.placeDetail.distance', { distance: formatDistance(850, language) })}
          </Text>
        </View>
        <Text style={styles.meta}>
          {t('experience.placeDetail.checked', {
            date: formatLocalDateTime(Date.now() - 15 * 60 * 1000, language),
          })}
        </Text>
        <Text style={styles.meta}>
          {t('experience.placeDetail.couponPrice', {
            price: formatCurrency(5000, 'KRW', language),
          })}
        </Text>
        {notificationTitle ? <Text style={styles.notificationTitle}>{notificationTitle}</Text> : null}
        {notificationBody ? <Text style={styles.notificationBody}>{notificationBody}</Text> : null}
        <View style={styles.actions}>
          <Button label={t('experience.placeDetail.checkIn')} onPress={onCheckIn} />
          <Button
            label={t('experience.placeDetail.coupon')}
            labelStyle={styles.secondaryButtonText}
            onPress={onCoupon}
            style={styles.secondaryButton}
          />
          <Button
            label={t('experience.common.back')}
            labelStyle={styles.tertiaryButtonText}
            onPress={onBack}
            style={styles.tertiaryButton}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  actions: { gap: 12, marginTop: 8 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, gap: 12, maxWidth: 640, padding: 24, width: '100%' },
  container: { alignItems: 'center', backgroundColor: '#F6F8FB', flexGrow: 1, justifyContent: 'center', padding: 24 },
  description: { color: '#555555', fontSize: 16, lineHeight: 24 },
  meta: { color: '#475467', flexShrink: 1, fontSize: 15, lineHeight: 22 },
  notificationBody: { color: '#1E1E1E', fontSize: 15, lineHeight: 22 },
  notificationTitle: { color: '#2D6CDF', fontSize: 18, fontWeight: '700', lineHeight: 25 },
  secondaryButton: { backgroundColor: '#FFF0F4', borderColor: '#F52A62', borderWidth: 1 },
  secondaryButtonText: { color: '#B4234D' },
  statusRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tertiaryButton: { backgroundColor: '#EAECF0' },
  tertiaryButtonText: { color: '#344054' },
  title: { color: '#1E1E1E', fontSize: 24, fontWeight: '700', lineHeight: 32 },
});

export default PlaceDetailScreen;
