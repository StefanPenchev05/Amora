import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Screen from '../../src/components/layout/Screen';
import AppHeader from '../../src/components/layout/AppHeader';
import Card from '../../src/components/ui/Card';
import IconCircleButton from '../../src/components/ui/IconCircleButton';
import { lightTheme } from '../../src/styles/theme';
import { withOpacity } from '../../src/components/form/color';
import { relationshipService, type RelationshipStatusResponse } from '../../src/services/api/relationship';

import { authService } from '../../src/services/api/auth';
import { eventService, type Event } from '../../src/services/api/events';
import { memoryService, type Memory } from '../../src/services/api/memories';

export default function DashboardScreen() {
  const router = useRouter();
  const theme = lightTheme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [userName, setUserName] = useState<string>('');
  const [loadingUser, setLoadingUser] = useState(true);

  const [events, setEvents] = useState<Event[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [relationship, setRelationship] = useState<RelationshipStatusResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadUser = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (cancelled) return;

        const displayName =
          [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.username || '';
        setUserName(displayName);
      } finally {
        if (!cancelled) setLoadingUser(false);
      }
    };

    loadUser();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rel = await relationshipService.getStatus();
        if (!cancelled) setRelationship(rel);
      } catch {
        // Non-blocking: dashboard still works without relationship.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadDashboardData = async () => {
      try {
        const [eventsRes, memoriesRes] = await Promise.all([
          eventService.getAll(),
          memoryService.getAll(),
        ]);

        if (cancelled) return;

        const now = new Date();
        const upcomingEvents = eventsRes
          .filter((e) => {
            const dt = new Date(e.event_date);
            return !Number.isNaN(dt.getTime()) && dt >= now;
          })
          .sort((a, b) => a.event_date.localeCompare(b.event_date));
        const sortedMemories = [...memoriesRes].sort((a, b) => b.memory_date.localeCompare(a.memory_date));

        setEvents(upcomingEvents.slice(0, 3));
        setMemories(sortedMemories.slice(0, 6));
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    };

    loadDashboardData();
    return () => {
      cancelled = true;
    };
  }, []);

  const formatShortDateTime = (iso: string): string => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;

    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfTomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const startOfDayAfterTomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2);

    let dayLabel = date.toLocaleDateString();
    if (date >= startOfToday && date < startOfTomorrow) {
      dayLabel = 'Today';
    } else if (date >= startOfTomorrow && date < startOfDayAfterTomorrow) {
      dayLabel = 'Tomorrow';
    }

    const timeLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${dayLabel} · ${timeLabel}`;
  };

  const formatShortDate = (iso: string): string => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleDateString();
  };

  const renderEvents = () => {
    if (loadingData) {
      return (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      );
    }

    if (events.length === 0) {
      return <Text style={styles.emptyText}>No upcoming events yet.</Text>;
    }

    return events.map((event, idx) => (
      <TouchableOpacity
        key={event.id}
        style={[styles.listRow, idx === 0 && styles.listRowFirst]}
        onPress={() => router.push('/(app)/calendar')}
      >
        <View style={styles.listIcon}>
          <Ionicons name="calendar" size={18} color={theme.colors.primary} />
        </View>
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle} numberOfLines={1}>
            {event.title}
          </Text>
          <Text style={styles.eventDate}>{formatShortDateTime(event.event_date)}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
      </TouchableOpacity>
    ));
  };

  const partnerConnected = relationship?.status === 'active';
  const partnerName = relationship?.partner?.full_name || relationship?.partner?.username || 'Partner';
  const stats = relationship?.stats;
  const daysConnected = relationship?.days_connected;

  const actions = useMemo(
    () => [
      {
        key: 'calendar',
        title: 'Calendar',
        route: '/(app)/calendar',
        icon: 'calendar' as const,
        bg: withOpacity(theme.colors.primary, 0.06),
        iconBg: withOpacity(theme.colors.primary, 0.08),
      },
      {
        key: 'mood',
        title: 'Mood',
        route: '/(app)/mood',
        icon: 'happy' as const,
        bg: withOpacity(theme.colors.accent, 0.08),
        iconBg: withOpacity(theme.colors.accent, 0.12),
      },
      {
        key: 'notes',
        title: 'Notes',
        route: '/(app)/notes',
        icon: 'heart' as const,
        bg: withOpacity(theme.colors.primary, 0.04),
        iconBg: withOpacity(theme.colors.primary, 0.06),
      },
      {
        key: 'memories',
        title: 'Memories',
        route: '/(app)/memories',
        icon: 'images' as const,
        bg: withOpacity(theme.colors.secondary, 0.05),
        iconBg: withOpacity(theme.colors.secondary, 0.08),
      },
      {
        key: 'expenses',
        title: 'Expenses',
        route: '/(app)/expenses',
        icon: 'wallet' as const,
        bg: withOpacity(theme.colors.accent, 0.06),
        iconBg: withOpacity(theme.colors.accent, 0.1),
      },
    ],
    [router, theme.colors.accent, theme.colors.primary, theme.colors.secondary],
  );

  const renderMemories = () => {
    if (loadingData) {
      return (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading memories...</Text>
        </View>
      );
    }

    if (memories.length === 0) {
      return <Text style={styles.emptyText}>No memories yet.</Text>;
    }

    return memories.map((memory) => (
      <TouchableOpacity
        key={memory.id}
        style={styles.memoryCard}
        onPress={() => router.push('/(app)/memories')}
      >
        <Text style={styles.memoryEmoji}>💖</Text>
        <Text style={styles.memoryTitle} numberOfLines={1}>
          {memory.title}
        </Text>
        <Text style={styles.memoryDate}>{formatShortDate(memory.memory_date)}</Text>
      </TouchableOpacity>
    ));
  };

  let headerTitle = 'Dashboard';
  if (!loadingUser && userName) {
    headerTitle = `Hi, ${userName}`;
  }

  return (
    <Screen
      scroll
      theme={theme}
      contentStyle={styles.screenContent}
    >
      <AppHeader
        title={headerTitle}
        subtitle="Plan, track and remember — together"
        right={
          <IconCircleButton
            icon="person"
            onPress={() => router.push('/(app)/profile')}
            theme={theme}
          />
        }
        theme={theme}
      />

      {relationship?.status === 'active' ? null : (
        <Card theme={theme} style={styles.card}>
          <View style={styles.partnerRow}>
            <View style={styles.partnerIcon}>
              <Ionicons name="people" size={18} color={theme.colors.primary} />
            </View>
            <View style={styles.partnerText}>
              <Text style={styles.partnerTitle}>Connect your partner</Text>
              <Text style={styles.partnerSub}>Invite them to unlock shared moods, memories and planning.</Text>
            </View>
          </View>

          <View style={styles.partnerCtas}>
            <TouchableOpacity
              style={styles.primaryCta}
              onPress={() => router.push('/(app)/partner')}
            >
              <Text style={styles.primaryCtaText}>Invite / Enter code</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryCta}
              onPress={() => router.push('/(app)/partner')}
            >
              <Text style={styles.secondaryCtaText}>Learn more</Text>
            </TouchableOpacity>
          </View>
        </Card>
      )}

      <Card theme={theme} style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <Text style={styles.sectionHint}>Swipe</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickActionsRow}
        >
          {actions.map((a) => (
            <Pressable
              key={a.key}
              onPress={() => router.push(a.route)}
              style={({ pressed }) => [
                styles.quickActionItem,
                pressed && styles.actionPressed,
              ]}
            >
              <View style={[styles.quickActionCircle, { backgroundColor: a.iconBg, borderColor: withOpacity(theme.colors.border, 0.9) }]}>
                <Ionicons name={a.icon} size={22} color={theme.colors.primary} />
              </View>
              <Text style={styles.quickActionTitle} numberOfLines={1}>
                {a.title}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </Card>

      <Card theme={theme} style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>At a glance</Text>
          <TouchableOpacity onPress={() => router.push('/(app)/calendar')}>
            <Text style={styles.link}>Open</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.glanceGrid}>
          <Pressable
            onPress={() => router.push('/(app)/calendar')}
            style={({ pressed }) => [styles.glanceTile, pressed && styles.actionPressed]}
          >
            <View style={styles.glanceIcon}>
              <Ionicons name="time" size={18} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.glanceTitle}>Next up</Text>
              <Text style={styles.glanceSub} numberOfLines={1}>
                {events[0] ? `${events[0].title} · ${formatShortDateTime(events[0].event_date)}` : 'No upcoming events'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </Pressable>

          <Pressable
            onPress={() => router.push('/(app)/memories')}
            style={({ pressed }) => [styles.glanceTile, pressed && styles.actionPressed]}
          >
            <View style={styles.glanceIcon}>
              <Ionicons name="sparkles" size={18} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.glanceTitle}>Capture a memory</Text>
              <Text style={styles.glanceSub} numberOfLines={1}>
                Add a small moment you loved today
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </Pressable>
        </View>
      </Card>

      {partnerConnected && stats ? (
        <Card theme={theme} style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Together</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/partner')}>
              <Text style={styles.link}>{partnerName}</Text>
            </TouchableOpacity>
          </View>

          {typeof daysConnected === 'number' ? (
            <Text style={styles.togetherMeta}>Connected {daysConnected} day{daysConnected === 1 ? '' : 's'}</Text>
          ) : null}

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.togetherRow}>
            <View style={styles.statChip}>
              <Text style={styles.statValue}>{stats.moods_last_7_days}</Text>
              <Text style={styles.statLabel}>Moods (7d)</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statValue}>{stats.events_next_7_days}</Text>
              <Text style={styles.statLabel}>Events (7d)</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statValue}>{stats.notes_total}</Text>
              <Text style={styles.statLabel}>Notes</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statValue}>{stats.memories_total}</Text>
              <Text style={styles.statLabel}>Memories</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statValue}>{stats.expenses_unsettled_count}</Text>
              <Text style={styles.statLabel}>Unsettled</Text>
            </View>
          </ScrollView>
        </Card>
      ) : null}

      <Card theme={theme} style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <TouchableOpacity onPress={() => router.push('/(app)/calendar')}>
            <Text style={styles.link}>View all</Text>
          </TouchableOpacity>
        </View>
        <View>{renderEvents()}</View>
      </Card>

      <Card theme={theme} style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Memories</Text>
          <TouchableOpacity onPress={() => router.push('/(app)/memories')}>
            <Text style={styles.link}>View all</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.memoriesGrid}>{renderMemories()}</View>
      </Card>
    </Screen>
  );
}

const createStyles = (theme: typeof lightTheme) =>
  StyleSheet.create({
    screenContent: {
      paddingTop: theme.spacing[4],
    },
    card: {
      marginTop: theme.spacing[3],
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing[3],
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.textPrimary,
    },
    sectionHint: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.textMuted,
    },
    link: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.primary,
    },
    quickActionsRow: {
      paddingTop: theme.spacing[2],
      paddingBottom: theme.spacing[1],
      paddingRight: theme.spacing[2],
      gap: theme.spacing[3],
    },
    quickActionItem: {
      width: 88,
      alignItems: 'center',
    },
    quickActionCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      backgroundColor: theme.colors.surface,
      ...theme.shadow.xs,
    },
    quickActionTitle: {
      marginTop: theme.spacing[2],
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.textPrimary,
    },
    actionPressed: {
      opacity: 0.92,
      transform: [{ scale: 0.99 }],
    },
    // (keeping other dashboard styles unchanged)
    loadingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing[3],
    },
    loadingText: {
      marginLeft: theme.spacing[3],
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.textMuted,
    },
    emptyText: {
      paddingVertical: theme.spacing[3],
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textMuted,
    },
    listRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing[3],
      borderTopWidth: 1,
      borderColor: theme.colors.border,
    },
    listRowFirst: {
      borderTopWidth: 0,
    },
    listIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginRight: theme.spacing[3],
    },
    eventInfo: {
      flex: 1,
    },
    eventTitle: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.textPrimary,
    },
    eventDate: {
      marginTop: 2,
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textMuted,
    },
    memoriesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },

    glanceGrid: {
      gap: theme.spacing[3],
    },
    glanceTile: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing[4],
      gap: theme.spacing[3],
    },
    glanceIcon: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: withOpacity(theme.colors.primary, 0.08),
    },
    glanceTitle: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.textPrimary,
    },
    glanceSub: {
      marginTop: 2,
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textMuted,
    },

    togetherMeta: {
      marginTop: -theme.spacing[2],
      marginBottom: theme.spacing[3],
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textMuted,
    },
    togetherRow: {
      paddingRight: theme.spacing[2],
      gap: theme.spacing[3],
    },
    statChip: {
      minWidth: 120,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
      padding: theme.spacing[4],
    },
    statValue: {
      fontSize: theme.typography.fontSize.xl,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.textPrimary,
    },
    statLabel: {
      marginTop: 4,
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.textMuted,
    },
    memoryCard: {
      width: '48%',
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.background,
      padding: theme.spacing[4],
      marginBottom: theme.spacing[3],
    },
    memoryEmoji: {
      fontSize: 22,
      marginBottom: theme.spacing[2],
    },
    memoryTitle: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.textPrimary,
    },
    memoryDate: {
      marginTop: 4,
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textMuted,
    },

    partnerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: theme.spacing[4],
    },
    partnerIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: withOpacity(theme.colors.primary, 0.08),
      marginRight: theme.spacing[3],
      marginTop: 2,
    },
    partnerText: { flex: 1 },
    partnerTitle: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.textPrimary,
    },
    partnerSub: {
      marginTop: 4,
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textMuted,
    },
    partnerCtas: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    primaryCta: {
      flex: 1,
      height: 44,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing[3],
    },
    primaryCtaText: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.onPrimary,
    },
    secondaryCta: {
      width: 120,
      height: 44,
      borderRadius: theme.radius.lg,
      backgroundColor: withOpacity(theme.colors.primary, 0.1),
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryCtaText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.primary,
    },
  });
