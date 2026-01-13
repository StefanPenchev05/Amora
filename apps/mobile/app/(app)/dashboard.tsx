import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';

import Screen from '../../src/components/layout/Screen';
import Card from '../../src/components/ui/Card';
import { lightTheme } from '../../src/styles/theme';
import { useTheme } from '../../src/providers/theme';
import { withOpacity } from '../../src/components/form/color';
import { relationshipService, type RelationshipStatusResponse } from '../../src/services/api/relationship';

import { authService } from '../../src/services/api/auth';
import { eventService, type Event } from '../../src/services/api/events';
import { memoryService, type Memory } from '../../src/services/api/memories';
import { moodService, type Mood } from '../../src/services/api/moods';

function useCurrentUserName() {
  const [userName, setUserName] = useState<string>('');
  const [loadingUser, setLoadingUser] = useState(true);

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

  return { userName, loadingUser };
}

function useCurrentLocationLabel() {
  const [locationLabel, setLocationLabel] = useState<string>('');
  const [locationStatus, setLocationStatus] = useState<'loading' | 'ready' | 'denied' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLocationStatus('loading');
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (cancelled) return;

        if (status !== Location.PermissionStatus.GRANTED) {
          setLocationStatus('denied');
          setLocationLabel('Location off');
          return;
        }

        const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (cancelled) return;

        const { latitude, longitude } = position.coords;
        const places = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (cancelled) return;

        const place = places?.[0];
        const city = place?.city || place?.subregion || place?.district || '';
        const region = place?.region || place?.country || '';
        const label = [city, region].filter(Boolean).join(', ');

        setLocationLabel(label || 'Current location');
        setLocationStatus('ready');
      } catch {
        if (cancelled) return;
        setLocationStatus('error');
        setLocationLabel('Current location');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { locationLabel, locationStatus };
}

function useRelationshipStatus() {
  const [relationship, setRelationship] = useState<RelationshipStatusResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rel = await relationshipService.getStatus();
        if (!cancelled) setRelationship(rel);
      } catch {
        // Non-blocking
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return relationship;
}

function useDashboardSummaryData() {
  const [events, setEvents] = useState<Event[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loadingData, setLoadingData] = useState(true);

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

  return { events, memories, loadingData };
}

function useRecentMoods() {
  const [moods, setMoods] = useState<Mood[]>([]);
  const [loadingMoods, setLoadingMoods] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const toYmd = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    (async () => {
      try {
        const end = new Date();
        const start = new Date(end);
        start.setDate(end.getDate() - 6);

        const res = await moodService.getAll(toYmd(start), toYmd(end));
        if (cancelled) return;

        const sorted = [...res].sort((a, b) => b.mood_date.localeCompare(a.mood_date));
        setMoods(sorted);
      } catch {
        if (!cancelled) setMoods([]);
      } finally {
        if (!cancelled) setLoadingMoods(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { moods, loadingMoods };
}

function formatShortDateTime(iso: string): string {
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
}

function formatShortDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString();
}

function formatNiceToday(): string {
  const d = new Date();
  const weekday = d.toLocaleDateString(undefined, { weekday: 'long' });
  const monthDay = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `${weekday} · ${monthDay}`;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function moodEmoji(level?: number): string {
  if (!level || Number.isNaN(level)) return '🙂';
  if (level <= 2) return '😔';
  if (level <= 4) return '😐';
  if (level <= 6) return '🙂';
  if (level <= 8) return '😄';
  return '🤩';
}

function moodLabel(level?: number): string {
  if (!level || Number.isNaN(level)) return 'Okay';
  if (level <= 2) return 'Rough';
  if (level <= 4) return 'Meh';
  if (level <= 6) return 'Okay';
  if (level <= 8) return 'Good';
  return 'Great';
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
}

export default function DashboardScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { userName, loadingUser } = useCurrentUserName();
  const { events, memories, loadingData } = useDashboardSummaryData();
  const { moods, loadingMoods } = useRecentMoods();
  const relationship = useRelationshipStatus();
  const { locationLabel, locationStatus } = useCurrentLocationLabel();

  const partnerConnected = relationship?.status === 'active';
  const partnerName = relationship?.partner?.full_name || relationship?.partner?.username || 'Partner';
  const stats = relationship?.stats;
  const daysConnected = relationship?.days_connected;

  const todayYmd = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const todaysMood = useMemo(() => {
    const match = moods.find((m) => (m.mood_date || '').slice(0, 10) === todayYmd);
    return match || null;
  }, [moods, todayYmd]);

  const lastMood = useMemo(() => (moods.length > 0 ? moods[0] : null), [moods]);

  const firstName = useMemo(() => (userName || '').trim().split(/\s+/)[0] || '', [userName]);
  const moodLevel = todaysMood?.level ?? lastMood?.level;
  const moodPillTitleText = todaysMood ? 'Today' : 'Mood';
  const moodPillSubText = useMemo(() => {
    if (loadingMoods) return 'Loading…';
    if (todaysMood) return moodLabel(todaysMood.level);
    return 'Check in';
  }, [loadingMoods, todaysMood]);

  return (
    <Screen
      scroll
      contentStyle={styles.screenContent}
    >
      <DashboardTopBar
        theme={theme}
        styles={styles}
        loadingUser={loadingUser}
        userName={userName}
        locationStatus={locationStatus}
        locationLabel={locationLabel}
        onPressProfile={() => router.push('/(app)/profile')}
        onPressNotifications={() => Alert.alert('Notifications', 'Coming soon')}
      />

      <DashboardHeroCard
        theme={theme}
        styles={styles}
        firstName={firstName}
        locationLabel={locationLabel}
        moodLevel={moodLevel}
        moodPillTitleText={moodPillTitleText}
        moodPillSubText={moodPillSubText}
        partnerConnected={partnerConnected}
        partnerName={partnerName}
        daysConnected={daysConnected}
        nextEventTitle={events[0]?.title}
        onPressMood={() => router.push('/(app)/mood')}
        onPressPartner={() => router.push('/(app)/partner')}
      />

      <PartnerConnectCard
        theme={theme}
        styles={styles}
        relationship={relationship}
        onPressPartner={() => router.push('/(app)/partner')}
      />

      <StartHereCard
        theme={theme}
        styles={styles}
        hasTodaysMood={Boolean(todaysMood)}
        onPressMood={() => router.push('/(app)/mood')}
        onPressCalendar={() => router.push('/(app)/calendar')}
        onPressMemories={() => router.push('/(app)/memories')}
        onPressNotes={() => router.push('/(app)/notes')}
      />

      <TogetherCard
        theme={theme}
        styles={styles}
        partnerConnected={partnerConnected}
        partnerName={partnerName}
        daysConnected={daysConnected}
        stats={stats}
        onPressPartner={() => router.push('/(app)/partner')}
      />

      <EventsCard
        theme={theme}
        styles={styles}
        loading={loadingData}
        events={events}
        onPressViewAll={() => router.push('/(app)/calendar')}
      />

      <MemoriesCard
        theme={theme}
        styles={styles}
        loading={loadingData}
        memories={memories}
        onPressViewAll={() => router.push('/(app)/memories')}
      />
    </Screen>
  );
}

const createStyles = (theme: typeof lightTheme) =>
  StyleSheet.create({
    screenContent: {
      paddingTop: theme.spacing[3],
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing[2],
      gap: theme.spacing[3],
    },
    avatarBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: withOpacity(theme.colors.border, 0.9),
      ...theme.shadow.xs,
    },
    avatarInitials: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.textPrimary,
    },
    bellBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: withOpacity(theme.colors.border, 0.9),
      ...theme.shadow.xs,
    },
    topBtnPressed: {
      opacity: 0.92,
      transform: [{ scale: 0.98 }],
    },
    topCenter: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing[2],
    },
    topLabel: {
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.textMuted,
    },
    topLocationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[1],
      marginTop: 2,
    },
    topLocation: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.textPrimary,
      maxWidth: '100%',
    },
    card: {
      marginTop: theme.spacing[3],
    },
    heroCard: {
      marginTop: theme.spacing[2],
      overflow: 'hidden',
    },
    heroRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing[3],
    },
    heroGreeting: {
      fontSize: theme.typography.fontSize.xl,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.textPrimary,
    },
    heroMeta: {
      marginTop: 6,
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.textMuted,
    },
    heroBottomRow: {
      marginTop: theme.spacing[4],
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[2],
    },
    heroChip: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing[1],
      paddingVertical: theme.spacing[2],
      paddingHorizontal: theme.spacing[2],
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: withOpacity(theme.colors.border, 0.9),
      backgroundColor: withOpacity(theme.colors.surface, 0.65),
    },
    heroChipText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.textPrimary,
      maxWidth: '86%',
    },
    moodPill: {
      width: 150,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[2],
      paddingVertical: theme.spacing[2],
      paddingHorizontal: theme.spacing[3],
      borderRadius: theme.radius.lg,
      backgroundColor: withOpacity(theme.colors.surface, 0.75),
      borderWidth: 1,
      borderColor: withOpacity(theme.colors.border, 0.9),
    },
    pillPressed: {
      opacity: 0.92,
      transform: [{ scale: 0.99 }],
    },
    moodEmoji: {
      fontSize: 22,
    },
    moodPillTitle: {
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.textMuted,
    },
    moodPillSub: {
      marginTop: 2,
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.textPrimary,
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
    emptyBlock: {
      paddingVertical: theme.spacing[3],
      gap: theme.spacing[2],
    },
    emptyTitle: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.textPrimary,
    },
    emptyText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textMuted,
    },
    emptyCta: {
      height: 44,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: theme.spacing[2],
      alignSelf: 'flex-start',
      paddingHorizontal: theme.spacing[4],
    },
    emptyCtaText: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.onPrimary,
    },
    emptyCtaSecondary: {
      height: 44,
      borderRadius: theme.radius.lg,
      backgroundColor: withOpacity(theme.colors.primary, 0.1),
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: theme.spacing[2],
      alignSelf: 'flex-start',
      paddingHorizontal: theme.spacing[4],
      borderWidth: 1,
      borderColor: withOpacity(theme.colors.border, 0.9),
    },
    emptyCtaSecondaryText: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.primary,
    },
    emptyCtaPressed: {
      opacity: 0.92,
      transform: [{ scale: 0.99 }],
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
    startGrid: {
      gap: theme.spacing[3],
    },
    startTile: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing[4],
      gap: theme.spacing[3],
    },
    startIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    startTitle: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.textPrimary,
    },
    startSub: {
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
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing[3],
    },
    statTile: {
      width: '48%',
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
      width: 190,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.background,
      padding: theme.spacing[4],
      borderWidth: 1,
      borderColor: theme.colors.border,
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
    memoriesWrap: {
      marginTop: -theme.spacing[1],
    },
    memoriesRow: {
      paddingTop: theme.spacing[2],
      paddingBottom: theme.spacing[1],
      paddingRight: theme.spacing[2],
      gap: theme.spacing[3],
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

type DashboardTheme = typeof lightTheme;
type DashboardStyles = ReturnType<typeof createStyles>;

function DashboardTopBar(props: {
  theme: DashboardTheme;
  styles: DashboardStyles;
  loadingUser: boolean;
  userName: string;
  locationStatus: 'loading' | 'ready' | 'denied' | 'error';
  locationLabel: string;
  onPressProfile: () => void;
  onPressNotifications: () => void;
}) {
  const { theme, styles, loadingUser, userName, locationStatus, locationLabel, onPressProfile, onPressNotifications } = props;

  return (
    <View style={styles.topBar}>
      <Pressable
        onPress={onPressProfile}
        style={({ pressed }) => [styles.avatarBtn, pressed && styles.topBtnPressed]}
      >
        {loadingUser ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : (
          <Text style={styles.avatarInitials}>{getInitials(userName || 'U')}</Text>
        )}
      </Pressable>

      <View style={styles.topCenter}>
        <Text style={styles.topLabel}>Current Location</Text>
        <View style={styles.topLocationRow}>
          <Ionicons name="location-outline" size={16} color={theme.colors.textMuted} />
          <Text style={styles.topLocation} numberOfLines={1}>
            {locationStatus === 'loading' ? 'Finding you…' : locationLabel}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={onPressNotifications}
        style={({ pressed }) => [styles.bellBtn, pressed && styles.topBtnPressed]}
      >
        <Ionicons name="notifications-outline" size={20} color={theme.colors.textPrimary} />
      </Pressable>
    </View>
  );
}

function DashboardHeroCard(props: {
  theme: DashboardTheme;
  styles: DashboardStyles;
  firstName: string;
  locationLabel: string;
  moodLevel: number | undefined;
  moodPillTitleText: string;
  moodPillSubText: string;
  partnerConnected: boolean;
  partnerName: string;
  daysConnected: number | undefined;
  nextEventTitle?: string;
  onPressMood: () => void;
  onPressPartner: () => void;
}) {
  const {
    theme,
    styles,
    firstName,
    locationLabel,
    moodLevel,
    moodPillTitleText,
    moodPillSubText,
    partnerConnected,
    partnerName,
    daysConnected,
    nextEventTitle,
    onPressMood,
    onPressPartner,
  } = props;

  const eventTitle = nextEventTitle || 'No plans yet';

  return (
    <Card theme={theme} style={styles.heroCard}>
      <LinearGradient
        colors={[
          withOpacity(theme.colors.primary, 0.18),
          withOpacity(theme.colors.secondary, 0.14),
          withOpacity(theme.colors.accent, 0.12),
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.heroRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroGreeting} numberOfLines={1}>
            {getGreeting()}{firstName ? `, ${firstName}` : ''}
          </Text>
          <Text style={styles.heroMeta} numberOfLines={1}>
            {formatNiceToday()}{locationLabel ? ` · ${locationLabel}` : ''}
          </Text>
        </View>

        <Pressable
          onPress={onPressMood}
          style={({ pressed }) => [styles.moodPill, pressed && styles.pillPressed]}
        >
          <Text style={styles.moodEmoji}>{moodEmoji(moodLevel)}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.moodPillTitle} numberOfLines={1}>
              {moodPillTitleText}
            </Text>
            <Text style={styles.moodPillSub} numberOfLines={1}>
              {moodPillSubText}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.heroBottomRow}>
        {partnerConnected ? (
          <View style={styles.heroChip}>
            <Ionicons name="heart" size={14} color={theme.colors.primary} />
            <Text style={styles.heroChipText} numberOfLines={1}>
              {partnerName}{typeof daysConnected === 'number' ? ` · ${daysConnected}d` : ''}
            </Text>
          </View>
        ) : (
          <Pressable
            onPress={onPressPartner}
            style={({ pressed }) => [styles.heroChip, pressed && styles.pillPressed]}
          >
            <Ionicons name="people" size={14} color={theme.colors.primary} />
            <Text style={styles.heroChipText}>Connect partner</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
          </Pressable>
        )}

        <View style={styles.heroChip}>
          <Ionicons name="calendar" size={14} color={theme.colors.primary} />
          <Text style={styles.heroChipText} numberOfLines={1}>
            {eventTitle}
          </Text>
        </View>
      </View>
    </Card>
  );
}

function PartnerConnectCard(props: {
  theme: DashboardTheme;
  styles: DashboardStyles;
  relationship: RelationshipStatusResponse | null;
  onPressPartner: () => void;
}) {
  const { theme, styles, relationship, onPressPartner } = props;
  if (relationship?.status === 'active') return null;

  return (
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
        <TouchableOpacity style={styles.primaryCta} onPress={onPressPartner}>
          <Text style={styles.primaryCtaText}>Invite / Enter code</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryCta} onPress={onPressPartner}>
          <Text style={styles.secondaryCtaText}>Learn more</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

function StartHereCard(props: {
  theme: DashboardTheme;
  styles: DashboardStyles;
  hasTodaysMood: boolean;
  onPressMood: () => void;
  onPressCalendar: () => void;
  onPressMemories: () => void;
  onPressNotes: () => void;
}) {
  const { theme, styles, hasTodaysMood, onPressMood, onPressCalendar, onPressMemories, onPressNotes } = props;

  return (
    <Card theme={theme} style={styles.card}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Start here</Text>
        <Text style={styles.sectionHint}>Today</Text>
      </View>

      <View style={styles.startGrid}>
        <Pressable onPress={onPressMood} style={({ pressed }) => [styles.startTile, pressed && styles.actionPressed]}>
          <View style={[styles.startIcon, { backgroundColor: withOpacity(theme.colors.accent, 0.12) }]}>
            <Ionicons name="happy" size={18} color={theme.colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.startTitle}>Mood check-in</Text>
            <Text style={styles.startSub} numberOfLines={1}>
              {hasTodaysMood ? 'Already checked in' : 'How are you feeling?'}
            </Text>
          </View>
        </Pressable>

        <Pressable onPress={onPressCalendar} style={({ pressed }) => [styles.startTile, pressed && styles.actionPressed]}>
          <View style={[styles.startIcon, { backgroundColor: withOpacity(theme.colors.primary, 0.12) }]}>
            <Ionicons name="calendar" size={18} color={theme.colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.startTitle}>Plan something</Text>
            <Text style={styles.startSub} numberOfLines={1}>
              Add an event for you two
            </Text>
          </View>
        </Pressable>

        <Pressable onPress={onPressMemories} style={({ pressed }) => [styles.startTile, pressed && styles.actionPressed]}>
          <View style={[styles.startIcon, { backgroundColor: withOpacity(theme.colors.secondary, 0.12) }]}>
            <Ionicons name="sparkles" size={18} color={theme.colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.startTitle}>Save a moment</Text>
            <Text style={styles.startSub} numberOfLines={1}>
              A photo, note, or memory
            </Text>
          </View>
        </Pressable>

        <Pressable onPress={onPressNotes} style={({ pressed }) => [styles.startTile, pressed && styles.actionPressed]}>
          <View style={[styles.startIcon, { backgroundColor: withOpacity(theme.colors.textMuted, 0.12) }]}>
            <Ionicons name="document-text" size={18} color={theme.colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.startTitle}>Write a note</Text>
            <Text style={styles.startSub} numberOfLines={1}>
              Keep something important
            </Text>
          </View>
        </Pressable>
      </View>
    </Card>
  );
}

function TogetherCard(props: {
  theme: DashboardTheme;
  styles: DashboardStyles;
  partnerConnected: boolean;
  partnerName: string;
  daysConnected: number | undefined;
  stats: RelationshipStatusResponse['stats'] | undefined;
  onPressPartner: () => void;
}) {
  const { theme, styles, partnerConnected, partnerName, daysConnected, stats, onPressPartner } = props;
  if (!partnerConnected || !stats) return null;

  return (
    <Card theme={theme} style={styles.card}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Together</Text>
        <TouchableOpacity onPress={onPressPartner}>
          <Text style={styles.link}>{partnerName}</Text>
        </TouchableOpacity>
      </View>

      {typeof daysConnected === 'number' ? (
        <Text style={styles.togetherMeta}>Connected {daysConnected} day{daysConnected === 1 ? '' : 's'}</Text>
      ) : null}

      <View style={styles.statsGrid}>
        <View style={styles.statTile}>
          <Text style={styles.statValue}>{stats.moods_last_7_days}</Text>
          <Text style={styles.statLabel}>Moods (7d)</Text>
        </View>
        <View style={styles.statTile}>
          <Text style={styles.statValue}>{stats.events_next_7_days}</Text>
          <Text style={styles.statLabel}>Events (7d)</Text>
        </View>
        <View style={styles.statTile}>
          <Text style={styles.statValue}>{stats.notes_total}</Text>
          <Text style={styles.statLabel}>Notes</Text>
        </View>
        <View style={styles.statTile}>
          <Text style={styles.statValue}>{stats.memories_total}</Text>
          <Text style={styles.statLabel}>Memories</Text>
        </View>
      </View>
    </Card>
  );
}

function EventsCard(props: {
  theme: DashboardTheme;
  styles: DashboardStyles;
  loading: boolean;
  events: Event[];
  onPressViewAll: () => void;
}) {
  const { theme, styles, loading, events, onPressViewAll } = props;

  let content: React.ReactNode;
  if (loading) {
    content = (
      <View style={styles.loadingRow}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  } else if (events.length === 0) {
    content = (
      <View style={styles.emptyBlock}>
        <Text style={styles.emptyTitle}>No upcoming events</Text>
        <Text style={styles.emptyText}>Add one thing to look forward to this week.</Text>
        <Pressable onPress={onPressViewAll} style={({ pressed }) => [styles.emptyCta, pressed && styles.emptyCtaPressed]}>
          <Ionicons name="add" size={18} color={theme.colors.onPrimary} />
          <Text style={styles.emptyCtaText}>Plan an event</Text>
        </Pressable>
      </View>
    );
  } else {
    content = events.map((event, idx) => (
      <TouchableOpacity
        key={event.id}
        style={[styles.listRow, idx === 0 && styles.listRowFirst]}
        onPress={onPressViewAll}
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
  }

  return (
    <Card theme={theme} style={styles.card}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Upcoming Events</Text>
        <TouchableOpacity onPress={onPressViewAll}>
          <Text style={styles.link}>View all</Text>
        </TouchableOpacity>
      </View>

      {content}
    </Card>
  );
}

function MemoriesCard(props: {
  theme: DashboardTheme;
  styles: DashboardStyles;
  loading: boolean;
  memories: Memory[];
  onPressViewAll: () => void;
}) {
  const { theme, styles, loading, memories, onPressViewAll } = props;

  let content: React.ReactNode;
  if (loading) {
    content = (
      <View style={styles.loadingRow}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading memories...</Text>
      </View>
    );
  } else if (memories.length === 0) {
    content = (
      <View style={styles.emptyBlock}>
        <Text style={styles.emptyTitle}>No memories yet</Text>
        <Text style={styles.emptyText}>Capture a small moment — it adds up.</Text>
        <Pressable
          onPress={onPressViewAll}
          style={({ pressed }) => [styles.emptyCtaSecondary, pressed && styles.emptyCtaPressed]}
        >
          <Ionicons name="sparkles" size={18} color={theme.colors.primary} />
          <Text style={styles.emptyCtaSecondaryText}>Add a memory</Text>
        </Pressable>
      </View>
    );
  } else {
    content = (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.memoriesRow}>
        {memories.map((memory) => (
          <TouchableOpacity key={memory.id} style={styles.memoryCard} onPress={onPressViewAll}>
            <Text style={styles.memoryEmoji}>💖</Text>
            <Text style={styles.memoryTitle} numberOfLines={2}>
              {memory.title}
            </Text>
            <Text style={styles.memoryDate}>{formatShortDate(memory.memory_date)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  }

  return (
    <Card theme={theme} style={styles.card}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Memories</Text>
        <TouchableOpacity onPress={onPressViewAll}>
          <Text style={styles.link}>View all</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.memoriesWrap}>
        {content}
      </View>
    </Card>
  );
}
