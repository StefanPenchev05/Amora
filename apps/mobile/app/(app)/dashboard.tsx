import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Screen from '../../src/components/layout/Screen';
import AppHeader from '../../src/components/layout/AppHeader';
import Card from '../../src/components/ui/Card';
import IconCircleButton from '../../src/components/ui/IconCircleButton';
import { lightTheme } from '../../src/styles/theme';

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
    const loadDashboardData = async () => {
      try {
        const [eventsRes, memoriesRes] = await Promise.all([
          eventService.getAll(),
          memoryService.getAll(),
        ]);

        if (cancelled) return;

        const sortedEvents = [...eventsRes].sort((a, b) => a.event_date.localeCompare(b.event_date));
        const sortedMemories = [...memoriesRes].sort((a, b) => b.memory_date.localeCompare(a.memory_date));

        setEvents(sortedEvents.slice(0, 3));
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
    return date.toLocaleString();
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

  return (
    <Screen scroll theme={theme}>
      <AppHeader
        title={loadingUser ? 'Dashboard' : userName ? `Hi, ${userName}` : 'Dashboard'}
        subtitle="Your space, beautifully organized"
        right={
          <IconCircleButton
            icon="person"
            onPress={() => router.push('/(app)/profile')}
            theme={theme}
          />
        }
        theme={theme}
      />

      <Card theme={theme}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.action} onPress={() => router.push('/(app)/calendar')}>
            <View style={styles.actionIcon}>
              <Ionicons name="calendar" size={18} color={theme.colors.primary} />
            </View>
            <Text style={styles.actionText}>Calendar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.action} onPress={() => router.push('/(app)/mood')}>
            <View style={styles.actionIcon}>
              <Ionicons name="happy" size={18} color={theme.colors.primary} />
            </View>
            <Text style={styles.actionText}>Mood</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.action} onPress={() => router.push('/(app)/notes')}>
            <View style={styles.actionIcon}>
              <Ionicons name="heart" size={18} color={theme.colors.primary} />
            </View>
            <Text style={styles.actionText}>Notes</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.action} onPress={() => router.push('/(app)/memories')}>
            <View style={styles.actionIcon}>
              <Ionicons name="images" size={18} color={theme.colors.primary} />
            </View>
            <Text style={styles.actionText}>Memories</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.action} onPress={() => router.push('/(app)/expenses')}>
            <View style={styles.actionIcon}>
              <Ionicons name="wallet" size={18} color={theme.colors.primary} />
            </View>
            <Text style={styles.actionText}>Expenses</Text>
          </TouchableOpacity>
        </View>
      </Card>

      <Card theme={theme}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <TouchableOpacity onPress={() => router.push('/(app)/calendar')}>
            <Text style={styles.link}>View all</Text>
          </TouchableOpacity>
        </View>
        <View>{renderEvents()}</View>
      </Card>

      <Card theme={theme}>
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
    link: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.primary,
    },
    quickActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginTop: theme.spacing[3],
    },
    action: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '48%',
      paddingVertical: theme.spacing[3],
      paddingHorizontal: theme.spacing[4],
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing[3],
    },
    actionIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginRight: theme.spacing[3],
    },
    actionText: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.textPrimary,
    },
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
    memoryCard: {
      width: '48%',
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
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
  });
