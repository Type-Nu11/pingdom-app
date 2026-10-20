import styled from 'styled-components/native';
import GlassSurface from '../../presentation/components/GlassSurface';

export const TrackingTop = styled.View`
  position: absolute;
  left: 8px;
  right: 8px;
`;
export const GuidanceShadow = styled.View`border-radius: 28px;`;
export const Guidance = styled(GlassSurface)`border-radius: 28px; overflow: hidden;`;
export const Maneuver = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 16px;
  gap: 14px;
`;
export const ManeuverIcon = styled.View`
  width: 56px;
  height: 56px;
  border-radius: 28px;
  align-items: center;
  justify-content: center;
`;
export const GuidanceText = styled.View`flex: 1; min-width: 0px; gap: 2px;`;
export const Next = styled.View`padding: 10px 16px;`;
export const LocationSurface = styled(GlassSurface)`
  align-self: flex-end;
  margin-right: 4px;
  margin-top: 12px;
  border-radius: 22px;
`;
export const LocationButton = styled.Pressable`
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
`;
export const SheetPosition = styled.View`
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: 8px;
  border-top-left-radius: 36px;
  border-top-right-radius: 36px;
  border-bottom-left-radius: 48px;
  border-bottom-right-radius: 48px;
`;
export const Sheet = styled(GlassSurface)`
  flex-shrink: 1;
  border-top-left-radius: 36px;
  border-top-right-radius: 36px;
  border-bottom-left-radius: 48px;
  border-bottom-right-radius: 48px;
  overflow: hidden;
`;
export const SheetContent = styled.ScrollView.attrs<{ $bottomInset: number }>(({ $bottomInset }) => ({
  contentContainerStyle: {
    paddingTop: 8, paddingHorizontal: 16, paddingBottom: Math.max(24, $bottomInset), gap: 12,
  },
}))<{ $bottomInset: number }>``;
export const Grabber = styled.View`
  align-self: center;
  width: 56px;
  height: 5px;
  border-radius: 7px;
`;
export const SummaryRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;
export const Stats = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  flex-grow: 1;
  flex-shrink: 1;
  gap: 24px;
`;
export const Stat = styled.View`gap: 2px; flex-shrink: 1;`;
export const StopButton = styled.Pressable`
  min-width: 88px;
  min-height: 52px;
  padding: 12px 24px;
  border-radius: 26px;
  justify-content: center;
`;
export const Tags = styled.View`flex-direction: row; flex-wrap: wrap; gap: 6px;`;
export const Tag = styled.View`border-radius: 8px; padding: 4px 8px; flex-shrink: 1;`;
export const Recovery = styled.View`flex-direction: row; flex-wrap: wrap; gap: 8px;`;
export const RecoveryAction = styled.Pressable`
  min-height: 44px;
  padding: 8px 16px;
  border-radius: 22px;
  justify-content: center;
`;
