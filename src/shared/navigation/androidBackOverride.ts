// Shared migration boundary: V2 owns the singleton while the remaining V1
// settings screen keeps its stable import path until that bridge is deleted.
export {
  registerAndroidBackOverride,
  runAndroidBackOverride,
  type AndroidBackOverride,
} from '../../v2/shared/navigation/androidBackOverride';
