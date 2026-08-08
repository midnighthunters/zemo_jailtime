import { StyleSheet, Text, View } from 'react-native';
import { CourtButton } from '@/src/components/CourtButton';
import { CourtCard } from '@/src/components/CourtCard';
import { StampBadge } from '@/src/components/StampBadge';
import { colors, radius } from '@/src/constants/theme';
import type { CourtCase } from '@/src/types/court';
import { shortTime } from '@/src/utils/date';
import {
  caseFocusProgress,
  caseFocusRemainingSeconds,
  verdictLabel,
  verdictTone,
  verdictVariant,
} from '@/src/utils/docket';
import { formatMinutes } from '@/src/utils/format';

type CaseCardProps = {
  item: CourtCase;
  /** How many selections a jail verdict would shield. */
  protectedCount: number;
  /** True while a focus timer is serving this case. */
  serving?: boolean;
  onWarn: () => void;
  onJail: () => void;
  onDismiss: () => void;
  onStartFocus: () => void;
};

/**
 * One case on the docket. The badge carries the verdict and the actions change
 * with it, so the whole lifecycle reads from a single card.
 */
export function CaseCard({
  item,
  protectedCount,
  serving = false,
  onWarn,
  onJail,
  onDismiss,
  onStartFocus,
}: CaseCardProps) {
  const remainingSeconds = caseFocusRemainingSeconds(item);
  const progress = caseFocusProgress(item);
  const appsLabel = protectedCount === 1 ? 'your app' : `all ${protectedCount} of your apps`;

  return (
    <CourtCard variant={verdictVariant(item.verdict)}>
      <View style={styles.top}>
        <StampBadge label={verdictLabel(item.verdict)} tone={verdictTone(item.verdict)} />
        <Text style={styles.filedAt}>{shortTime(item.filedAt)}</Text>
      </View>

      <Text style={styles.title}>{item.title}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.law}>{item.lawName}</Text>
        <Text style={styles.source}>
          {item.source === 'deviceLimit' ? 'Detected by iOS' : 'Self-reported'}
        </Text>
      </View>
      <Text style={styles.evidence}>{item.evidenceLine}</Text>

      {item.verdict === 'hearing' ? (
        <>
          <Text style={styles.hint}>
            Decide the verdict. Jail locks {appsLabel} until you focus for{' '}
            {formatMinutes(item.requiredFocusMinutes)}.
          </Text>
          <View style={styles.actions}>
            <View style={styles.actionCell}>
              <CourtButton title="Issue Warning" variant="secondary" small onPress={onWarn} />
            </View>
            <View style={styles.actionCell}>
              <CourtButton title="Send to Jail" variant="destructive" small onPress={onJail} />
            </View>
          </View>
          <CourtButton title="Dismiss Case" variant="ghost" small onPress={onDismiss} />
        </>
      ) : null}

      {item.verdict === 'warning' ? (
        <>
          <Text style={styles.hint}>
            Your apps stay open. Break this law again and the court will not be as kind.
          </Text>
          <CourtButton title="Escalate to Jail" variant="destructive" small onPress={onJail} />
        </>
      ) : null}

      {item.verdict === 'jailed' ? (
        <>
          <View style={styles.progressBlock}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Focus time served</Text>
              <Text style={styles.progressValue}>{progress}%</Text>
            </View>
            <View
              accessibilityRole="progressbar"
              accessibilityValue={{ min: 0, max: 100, now: progress }}
              style={styles.track}
            >
              <View style={[styles.fill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressCopy}>
              {formatMinutes(Math.ceil(remainingSeconds / 60))} of focus left to release {appsLabel}.
            </Text>
          </View>
          <CourtButton
            title={serving ? 'View Focus Timer' : 'Start Focus Timer'}
            variant="primary"
            small
            onPress={onStartFocus}
          />
          <CourtButton title="Downgrade to Warning" variant="ghost" small onPress={onWarn} />
        </>
      ) : null}

      {item.verdict === 'served' ? (
        <Text style={styles.hint}>
          Released. You served {formatMinutes(item.requiredFocusMinutes)} of focus.
        </Text>
      ) : null}

      {item.verdict === 'dismissed' ? (
        <Text style={styles.hint}>Case dismissed. Nothing was locked.</Text>
      ) : null}
    </CourtCard>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  filedAt: {
    color: colors.labelTertiary,
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    color: colors.label,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginTop: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  law: {
    color: colors.blue,
    fontSize: 13,
    fontWeight: '600',
  },
  source: {
    color: colors.labelTertiary,
    fontSize: 12,
    fontWeight: '500',
  },
  evidence: {
    color: colors.labelSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    marginTop: 8,
  },
  hint: {
    color: colors.labelSecondary,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
    marginTop: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  actionCell: { flex: 1 },

  progressBlock: {
    marginTop: 14,
    marginBottom: 14,
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  progressLabel: {
    color: colors.labelSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  progressValue: {
    color: colors.label,
    fontSize: 13,
    fontWeight: '700',
  },
  track: {
    height: 8,
    borderRadius: radius.xs,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.blue,
  },
  progressCopy: {
    color: colors.labelSecondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
});
