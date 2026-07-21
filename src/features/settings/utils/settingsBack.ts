export type SettingsBackAction = 'pop-page' | 'navigate-back';

export function getSettingsBackAction(pageCount: number): SettingsBackAction {
  return pageCount > 1 ? 'pop-page' : 'navigate-back';
}
