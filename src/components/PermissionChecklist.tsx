import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { PermissionId, PermissionRequirement, PermissionStatus } from '@/src/types/court';
import { CourtButton } from '@/src/components/CourtButton';
import { StampBadge } from '@/src/components/StampBadge';
import { colors, radius, shadows } from '@/src/constants/theme';
import { PERMISSION_REQUIREMENTS } from '@/src/data/permissions';
import { NotificationService } from '@/src/services/notifications/NotificationService';
import { getScreenTimeService } from '@/src/services/screenTime/ScreenTimeServiceFactory';
import { useCourtStore } from '@/src/store/useCourtStore';

type PermissionChecklistProps = {
  compact?: boolean;
  limit?: number;
};

function visiblePermissions() {
  return PERMISSION_REQUIREMENTS.filter((item) => item.platform === 'all' || item.platform === 'ios');
}

function toneForStatus(status: PermissionStatus) {
  if (status === 'granted') return 'success';
  if (status === 'blocked' || status === 'missing') return 'danger';
  if (status === 'notAvailable') return 'muted';
  return 'gold';
}

function labelForStatus(status: PermissionStatus) {
  if (status === 'granted') return 'Ready';
  if (status === 'missing') return 'Missing';
  if (status === 'blocked') return 'Blocked';
  if (status === 'notAvailable') return 'N/A';
  return 'Check';
}

async function requestPermission(id: PermissionId) {
  if (id === 'notifications') {
    const result = await NotificationService.requestPermissions();
    return result.granted ? 'granted' : 'missing';
  }

  const service = getScreenTimeService();
  const result = id === 'screenTimeAuthorization' ? await service.requestPermissions() : await service.getPermissionStatus();
  return result.granted ? 'granted' : 'missing';
}

export function PermissionChecklist({ compact, limit }: PermissionChecklistProps) {
  const [activeId, setActiveId] = useState<PermissionId>();
  const statuses = useCourtStore((state) => state.profile.permissionStatuses);
  const setPermissionStatus = useCourtStore((state) => state.setPermissionStatus);
  const items = visiblePermissions().slice(0, limit);

  const handleRequest = async (permission: PermissionRequirement) => {
    setActiveId(permission.id);
    try {
      const status = await requestPermission(permission.id);
      setPermissionStatus(permission.id, status);
    } catch {
      setPermissionStatus(permission.id, 'missing');
    } finally {
      setActiveId(undefined);
    }
  };

  return (
    <View style={styles.list}>
      {items.map((permission) => {
        const status = statuses[permission.id] ?? 'unknown';
        return (
          <View key={permission.id} style={[styles.row, compact && styles.compactRow]}>
            <View style={styles.copy}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{permission.title}</Text>
                <StampBadge label={labelForStatus(status)} tone={toneForStatus(status)} />
              </View>
              <Text style={styles.description}>{permission.description}</Text>
              {!compact ? <Text style={styles.path}>{permission.settingsPath}</Text> : null}
            </View>
            {compact ? (
              <Pressable onPress={() => handleRequest(permission)} style={styles.iconButton}>
                <Text style={styles.iconText}>{status === 'granted' ? 'OK' : 'GO'}</Text>
              </Pressable>
            ) : (
              <CourtButton title={status === 'granted' ? 'Recheck' : 'Request'} variant="ghost" small loading={activeId === permission.id} onPress={() => handleRequest(permission)} />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
  row: {
    gap: 10,
    padding: 14,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderBottomColor: colors.depthEdge,
    ...shadows.soft,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copy: {
    flex: 1,
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    flex: 1,
    color: colors.label,
    fontSize: 15,
    fontWeight: '600',
  },
  description: {
    color: colors.labelSecondary,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '400',
  },
  path: {
    color: colors.blue,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
  },
  iconButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.blueLight,
    borderWidth: 1,
    borderColor: '#D5E0F8',
  },
  iconText: {
    color: colors.blueDark,
    fontSize: 12,
    fontWeight: '700',
  },
});
