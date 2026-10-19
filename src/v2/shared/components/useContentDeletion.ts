import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDialog } from './AppDialogProvider';

export function useContentDeletion(remove: () => Promise<unknown>, onDeleted?: () => void, identity?: string | number) {
  const { t } = useTranslation();
  const dialog = useAppDialog();
  const locked = useRef(false);
  const generation = useRef(0);
  const mounted = useRef(true);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    mounted.current = true; generation.current += 1; locked.current = false; setBusy(false);
    return () => { mounted.current = false; generation.current += 1; };
  }, [identity]);
  const confirm = () => {
    if (locked.current) return;
    const token = generation.current;
    dialog.show(t('editContent.deleteConfirm'), t('editContent.deleteDescription'), [
      { text: t('editContent.cancel'), style: 'cancel' },
      { text: t('contentActions.delete'), style: 'destructive', onPress: () => {
        if (locked.current || generation.current !== token) return;
        locked.current = true; setBusy(true);
        void remove().then(() => {
          if (mounted.current && generation.current === token) { dialog.toast(t('editContent.deleted')); onDeleted?.(); }
        }).catch(() => { if (mounted.current && generation.current === token) dialog.toast(t('editContent.operationFailed')); })
          .finally(() => { if (generation.current === token) { locked.current = false; if (mounted.current) setBusy(false); } });
      } },
    ]);
  };
  return { confirm, busy };
}
