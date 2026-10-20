import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import AccessibilityStatus from '../../../shared/components/AccessibilityStatus';
import Button from '../../../shared/components/Button';
import StatusBadge, { type StatusBadgeTone } from '../../../shared/components/StatusBadge';
import { classifyCheckInError, useLocationCheckIn } from '../hooks/useLocationCheckIn';

type CheckInScreenProps = { onBack: () => void; placeId: number };

const COLLAPSED_VISIT_COUNT = 3;

const CheckInScreen = ({ onBack, placeId }: CheckInScreenProps) => {
  const { i18n, t } = useTranslation();
  const [visitsExpanded, setVisitsExpanded] = useState(false);
  const workflow = useLocationCheckIn(placeId);
  const { location } = workflow;

  const status = useMemo((): { message: string; tone: StatusBadgeTone } => {
    if (workflow.successfulCheckIn) {
      return { message: t('experience.checkIn.success'), tone: 'success' };
    }
    if (workflow.checkInFailure) {
      return {
        message: t(`experience.checkIn.errors.${workflow.checkInFailure}`),
        tone: 'error',
      };
    }
    if (location.status === 'loading') {
      return { message: t('experience.checkIn.locationLoading'), tone: 'neutral' };
    }
    if (location.status === 'denied') {
      return { message: t('experience.checkIn.locationDenied'), tone: 'warning' };
    }
    if (location.status === 'failed') {
      return { message: t('experience.checkIn.locationFailed'), tone: 'error' };
    }
    return { message: t('experience.checkIn.status'), tone: 'warning' };
  }, [location.status, t, workflow.checkInFailure, workflow.successfulCheckIn]);

  const visibleCheckIns = visitsExpanded
    ? workflow.checkIns
    : workflow.checkIns.slice(0, COLLAPSED_VISIT_COUNT);
  const canSubmit = location.status === 'granted'
    && workflow.checkInFailure !== 'authentication'
    && workflow.checkInFailure !== 'duplicate';
  const shouldAnnounceStatus = Boolean(
    workflow.successfulCheckIn
    || workflow.checkInFailure
    || location.status === 'denied'
    || location.status === 'failed',
  );

  const listErrorMessage = workflow.listError
    ? t(`experience.checkIn.errors.${classifyCheckInError(workflow.listError)}`)
    : '';

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.title}>
          {t('experience.checkIn.title')}
        </Text>
        <Text style={styles.description}>{t('experience.checkIn.description')}</Text>
        <Text style={styles.placeId}>{t('experience.checkIn.selectedPlace', { placeId })}</Text>

        <StatusBadge label={status.message} tone={status.tone} />
        {shouldAnnounceStatus ? <AccessibilityStatus message={status.message} /> : null}

        {location.status === 'denied' ? (
          <Button
            label={location.canAskAgain
              ? t('experience.checkIn.retryLocation')
              : t('experience.checkIn.openSettings')}
            onPress={() => {
              if (location.canAskAgain) void location.refresh();
              else void Linking.openSettings();
            }}
          />
        ) : null}
        {location.status === 'failed' ? (
          <Button
            label={t('experience.checkIn.retryLocation')}
            onPress={() => void location.refresh()}
          />
        ) : null}
        {canSubmit ? (
          <Button
            label={workflow.checkInFailure === 'network'
              ? t('experience.checkIn.retryCheckIn')
              : t('experience.checkIn.action')}
            loading={workflow.isCheckingIn}
            loadingAnnouncement={t('experience.checkIn.submitting')}
            onPress={() => void workflow.submit()}
          />
        ) : null}

        <View style={styles.divider} />
        <View style={styles.visitsHeader}>
          <Text accessibilityRole="header" style={styles.visitsTitle}>
            {t('experience.checkIn.recentVisits')}
          </Text>
          {workflow.checkIns.length > COLLAPSED_VISIT_COUNT ? (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: visitsExpanded }}
              onPress={() => setVisitsExpanded((value) => !value)}
            >
              <Text style={styles.toggleText}>
                {t(visitsExpanded
                  ? 'experience.checkIn.collapseVisits'
                  : 'experience.checkIn.expandVisits')}
              </Text>
            </Pressable>
          ) : null}
        </View>

        {workflow.isListLoading ? (
          <View accessibilityLiveRegion="polite" style={styles.listState}>
            <ActivityIndicator color="#EC245B" />
            <Text style={styles.listStateText}>{t('experience.checkIn.visitsLoading')}</Text>
          </View>
        ) : workflow.isListError ? (
          <View accessibilityLiveRegion="polite" style={styles.listState}>
            <Text style={styles.errorText}>{listErrorMessage}</Text>
            <Button
              label={t('experience.checkIn.retryVisits')}
              onPress={() => void workflow.refetchCheckIns()}
              style={styles.inlineButton}
            />
          </View>
        ) : workflow.checkIns.length === 0 ? (
          <Text accessibilityLiveRegion="polite" style={styles.listStateText}>
            {t('experience.checkIn.visitsEmpty')}
          </Text>
        ) : (
          <View style={styles.visitList} testID="check-in-visit-list">
            {visibleCheckIns.map((checkIn) => (
              <View accessible key={checkIn.id} style={styles.visitRow}>
                <View style={styles.visitCopy}>
                  <Text style={styles.visitPlace}>
                    {t('experience.checkIn.visitPlace', { placeId: checkIn.placeId })}
                  </Text>
                  <Text style={styles.visitDate}>
                    {new Date(checkIn.observedAt).toLocaleString(i18n.language)}
                  </Text>
                </View>
                <Text style={styles.visitDistance}>
                  {t('experience.checkIn.visitDistance', {
                    distance: Math.round(checkIn.distanceMeters),
                  })}
                </Text>
              </View>
            ))}
          </View>
        )}

        {visitsExpanded && workflow.hasNextPage ? (
          <Button
            label={t('experience.checkIn.loadMoreVisits')}
            loading={workflow.isFetchingNextPage}
            onPress={() => void workflow.fetchNextPage()}
            style={styles.inlineButton}
          />
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    gap: 16,
    maxWidth: 640,
    padding: 24,
    width: '100%',
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#F6F8FB',
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  description: { color: '#475467', fontSize: 16, lineHeight: 24 },
  divider: { backgroundColor: '#EAECF0', height: 1 },
  errorText: { color: '#B42318', fontSize: 14, lineHeight: 20 },
  inlineButton: { alignSelf: 'flex-start', minHeight: 44 },
  listState: { alignItems: 'flex-start', gap: 12 },
  listStateText: { color: '#667085', fontSize: 14, lineHeight: 20 },
  placeId: { color: '#667085', fontSize: 14, lineHeight: 20 },
  title: { color: '#101828', fontSize: 24, fontWeight: '700', lineHeight: 32 },
  toggleText: { color: '#C1154F', fontSize: 14, fontWeight: '700' },
  visitCopy: { flex: 1, gap: 2 },
  visitDate: { color: '#667085', fontSize: 13, lineHeight: 18 },
  visitDistance: { color: '#475467', fontSize: 13, fontWeight: '600' },
  visitList: { gap: 10 },
  visitPlace: { color: '#101828', fontSize: 15, fontWeight: '700' },
  visitRow: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  visitsHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  visitsTitle: { color: '#101828', fontSize: 18, fontWeight: '700' },
});

export default CheckInScreen;
