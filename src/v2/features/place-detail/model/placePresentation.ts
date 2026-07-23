import type { LiveStatus, TouristSupport } from './placeDetail.types';

export type StatusPresentation = {
  labelKey:
    | 'placeStatus.closed'
    | 'placeStatus.open'
    | 'placeStatus.temporarilyClosed'
    | 'placeStatus.unknown';
  tone: 'error' | 'neutral' | 'success' | 'warning';
};

export function getOperatingStatusPresentation(
  status: LiveStatus['operatingStatus'] | string,
): StatusPresentation {
  switch (status) {
    case 'OPERATING':
      return { labelKey: 'placeStatus.open', tone: 'success' };
    case 'TEMPORARILY_CLOSED':
      return { labelKey: 'placeStatus.temporarilyClosed', tone: 'warning' };
    case 'PERMANENTLY_CLOSED':
      return { labelKey: 'placeStatus.closed', tone: 'error' };
    case 'UNKNOWN':
    default:
      return { labelKey: 'placeStatus.unknown', tone: 'neutral' };
  }
}

export function getSupportLevelLabelKey(
  level: TouristSupport['englishMenu'] | string,
): 'placeSupport.available' | 'placeSupport.unavailable' | 'placeSupport.unknown' {
  switch (level) {
    case 'AVAILABLE':
      return 'placeSupport.available';
    case 'UNAVAILABLE':
      return 'placeSupport.unavailable';
    case 'UNKNOWN':
    default:
      return 'placeSupport.unknown';
  }
}

export function getTrustConfidenceLabelKey(
  confidence: string,
):
  | 'placeTrust.confidence.high'
  | 'placeTrust.confidence.low'
  | 'placeTrust.confidence.medium'
  | 'placeTrust.confidence.unknown' {
  switch (confidence) {
    case 'HIGH':
      return 'placeTrust.confidence.high';
    case 'MEDIUM':
      return 'placeTrust.confidence.medium';
    case 'LOW':
      return 'placeTrust.confidence.low';
    case 'UNKNOWN':
    default:
      return 'placeTrust.confidence.unknown';
  }
}
