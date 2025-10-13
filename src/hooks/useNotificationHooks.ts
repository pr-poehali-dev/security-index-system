import { useIncidentNotifications } from '@/hooks/useIncidentNotifications';
import { useAttestationNotifications } from '@/hooks/useAttestationNotifications';
import { useCatalogNotifications } from '@/hooks/useCatalogNotifications';

export function useNotificationHooks() {
  useIncidentNotifications();
  useAttestationNotifications();
  useCatalogNotifications();
}
