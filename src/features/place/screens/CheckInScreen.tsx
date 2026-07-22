import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import AccessibilityStatus from '../../../shared/components/AccessibilityStatus';
import Button from '../../../shared/components/Button';
import StatusBadge from '../../../shared/components/StatusBadge';

type CheckInScreenProps = { onBack: () => void; placeId: number };

const CheckInScreen = ({ onBack, placeId }: CheckInScreenProps) => {
  const { t } = useTranslation();
  const [complete, setComplete] = useState(false);
  const completeMessage = `${t('experience.checkIn.title')} ${t('experience.placeDetail.open')}`;

  return (
    <ScrollView contentContainerStyle={styles.container} contentInsetAdjustmentBehavior="automatic">
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.title}>{t('experience.checkIn.title')}</Text>
        <Text style={styles.description}>{t('experience.checkIn.description')}</Text>
        <Text style={styles.placeId}>{`ID ${placeId}`}</Text>
        <StatusBadge
          label={complete ? completeMessage : t('experience.checkIn.status')}
          tone={complete ? 'success' : 'warning'}
        />
        {complete ? <AccessibilityStatus message={completeMessage} /> : null}
        {!complete ? (
          <Button label={t('experience.checkIn.action')} onPress={() => setComplete(true)} />
        ) : null}
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
  placeId: { color: '#667085', fontSize: 14, lineHeight: 20 },
  title: { color: '#101828', fontSize: 24, fontWeight: '700', lineHeight: 32 },
});

export default CheckInScreen;
