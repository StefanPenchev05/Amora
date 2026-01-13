import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Screen from '../../src/components/layout/Screen';
import AppHeader from '../../src/components/layout/AppHeader';
import Card from '../../src/components/ui/Card';
import { withOpacity } from '../../src/components/form/color';
import { lightTheme } from '../../src/styles/theme';
import { useTheme } from '../../src/providers/theme';
import { authService } from '../../src/services/api/auth';
import { relationshipService, type RelationshipStatusResponse } from '../../src/services/api/relationship';
import { eventService } from '../../src/services/api/events';
import { memoryService } from '../../src/services/api/memories';
import { noteService } from '../../src/services/api/notes';
import { expenseService } from '../../src/services/api/expenses';

type Theme = typeof lightTheme;

type ActionRowProps = {
  theme: Theme;
  styles: ReturnType<typeof createStyles>;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  tone?: 'primary' | 'secondary' | 'accent';
  showDivider?: boolean;
  danger?: boolean;
  showChevron?: boolean;
};

const ActionRow: React.FC<ActionRowProps> = ({
  theme,
  styles,
  icon,
  title,
  subtitle,
  onPress,
  tone = 'primary',
  showDivider,
  danger,
  showChevron = true,
}) => {
  let iconColor: string;
  let iconBg: string;

  if (danger) {
    iconColor = theme.colors.error;
    iconBg = withOpacity(theme.colors.error, 0.1);
  } else {
    switch (tone) {
      case 'secondary':
        iconColor = theme.colors.secondary;
        iconBg = withOpacity(theme.colors.secondary, 0.08);
        break;
      case 'accent':
        iconColor = theme.colors.accent;
        iconBg = withOpacity(theme.colors.accent, 0.12);
        break;
      default:
        iconColor = theme.colors.primary;
        iconBg = withOpacity(theme.colors.primary, 0.12);
        break;
    }
  }

  return (
    <>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.actionRow, pressed && styles.actionRowPressed]}>
        <View style={[styles.actionIcon, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
        <View style={styles.actionText}>
          <Text style={[styles.actionTitle, danger && { color: theme.colors.error }]}>{title}</Text>
          {subtitle ? <Text style={styles.actionSubtitle}>{subtitle}</Text> : null}
        </View>
        {showChevron ? <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} /> : null}
      </Pressable>
      {showDivider ? <View style={styles.actionDivider} /> : null}
    </>
  );
};

export default function ProfileScreen() {
  const router = useRouter();
  const { theme, isDark, setMode } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [stats, setStats] = useState({ memories: 0, events: 0, notes: 0, expenses: 0 });
  const [relationship, setRelationship] = useState<RelationshipStatusResponse | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (cancelled) return;

        const displayName =
          [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
          user?.username ||
          '';
        setUserName(displayName);
        setUserEmail(user?.email || '');

        const [events, memories, notes, expenses] = await Promise.all([
          eventService.getAll(),
          memoryService.getAll(),
          noteService.getAll(),
          expenseService.getAll(),
        ]);

        if (cancelled) return;
        setStats({
          events: events.length,
          memories: memories.length,
          notes: notes.length,
          expenses: expenses.length,
        });
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    };

    loadProfile();
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
        if (!cancelled) setRelationship(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
    return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
  };

  const partnerConnected = relationship?.status === 'active';
  const partnerName = relationship?.partner?.full_name || relationship?.partner?.username || 'Partner';

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        setNotificationsEnabled(parsed.notifications ?? true);
        setSoundEnabled(parsed.sound ?? true);

        // Back-compat migration: if older installs stored `darkMode`, map it to ThemeProvider.
        if (typeof parsed.darkMode === 'boolean') {
          setMode(parsed.darkMode ? 'dark' : 'light');
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (key: string, value: boolean) => {
    try {
      const currentSettings = await AsyncStorage.getItem('settings');
      const settings = currentSettings ? JSON.parse(currentSettings) : {};
      settings[key] = value;
      await AsyncStorage.setItem('settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleToggleNotifications = (value: boolean) => {
    setNotificationsEnabled(value);
    saveSettings('notifications', value);
  };

  const handleToggleDarkMode = (value: boolean) => {
    setMode(value ? 'dark' : 'light');
  };

  const handleToggleSound = (value: boolean) => {
    setSoundEnabled(value);
    saveSettings('sound', value);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await authService.logout();
          router.replace('/');
        },
      },
    ]);
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <AppHeader theme={theme} title="Profile" onBack={() => router.replace('/(app)/dashboard')} />

      <Card theme={theme} style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatarWrap}>
            <View style={styles.avatarRing}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials(userName || 'U')}</Text>
              </View>
            </View>

            <Pressable
              onPress={() => Alert.alert('Edit profile', 'Coming soon')}
              hitSlop={10}
              style={({ pressed }) => [styles.avatarEditBtn, pressed && styles.avatarEditBtnPressed]}
            >
              <Ionicons name="create" size={16} color={theme.colors.textPrimary} />
            </Pressable>
          </View>

          {loadingProfile ? (
            <ActivityIndicator color={theme.colors.primary} style={{ marginTop: theme.spacing[3] }} />
          ) : (
            <>
              <Text style={styles.userNameCentered} numberOfLines={1}>
                {userName || '—'}
              </Text>
              <Text style={styles.userEmailCentered} numberOfLines={1}>
                {userEmail || '—'}
              </Text>
            </>
          )}

          <View style={styles.badgeRowCentered}>
            {partnerConnected ? (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: withOpacity(theme.colors.primary, 0.08),
                    borderColor: withOpacity(theme.colors.primary, 0.18),
                  },
                ]}
              >
                <Ionicons name="people" size={14} color={theme.colors.primary} />
                <Text style={[styles.badgeText, { color: theme.colors.primary }]} numberOfLines={1}>
                  With {partnerName}
                </Text>
              </View>
            ) : (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: withOpacity(theme.colors.textMuted, 0.06),
                    borderColor: withOpacity(theme.colors.textMuted, 0.12),
                  },
                ]}
              >
                <Ionicons name="link" size={14} color={theme.colors.textMuted} />
                <Text style={[styles.badgeText, { color: theme.colors.textMuted }]}>
                  Not connected
                </Text>
              </View>
            )}

            {typeof relationship?.days_connected === 'number' ? (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: withOpacity(theme.colors.primary, 0.06),
                    borderColor: withOpacity(theme.colors.primary, 0.14),
                  },
                ]}
              >
                <Ionicons name="sparkles" size={14} color={theme.colors.primary} />
                <Text style={[styles.badgeText, { color: theme.colors.primary }]}>
                  {relationship.days_connected} day{relationship.days_connected === 1 ? '' : 's'}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.profileStatsRow}>
          <View style={styles.profileStatItem}>
            <Text style={styles.profileStatValue}>{stats.events}</Text>
            <Text style={styles.profileStatLabel}>Events</Text>
          </View>
          <View style={styles.profileStatDivider} />
          <View style={styles.profileStatItem}>
            <Text style={styles.profileStatValue}>{stats.memories}</Text>
            <Text style={styles.profileStatLabel}>Memories</Text>
          </View>
          <View style={styles.profileStatDivider} />
          <View style={styles.profileStatItem}>
            <Text style={styles.profileStatValue}>{stats.notes}</Text>
            <Text style={styles.profileStatLabel}>Notes</Text>
          </View>
        </View>
      </Card>

      <Card theme={theme} style={[styles.card, styles.listCard]}>
        <Pressable
          onPress={() => router.push('/(app)/partner')}
          style={({ pressed }) => [styles.primaryRow, pressed && styles.primaryRowPressed]}
        >
          <View style={[styles.primaryRowIcon, { backgroundColor: withOpacity(theme.colors.primary, 0.1) }]}>
            <Ionicons name={partnerConnected ? 'people' : 'gift'} size={18} color={theme.colors.primary} />
          </View>
          <View style={styles.primaryRowText}>
            <Text style={styles.primaryRowTitle}>
              {partnerConnected ? 'Partner connected' : 'Invite your partner'}
            </Text>
            <Text style={styles.primaryRowSubtitle}>
              {partnerConnected ? 'Manage invites & connection' : 'Share a link to connect and sync'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
        </Pressable>
      </Card>

      <View style={styles.quickTilesRow}>
        <Pressable
          onPress={() => router.push('/(app)/calendar')}
          style={({ pressed }) => [styles.quickTile, pressed && styles.quickTilePressed]}
        >
          <View style={[styles.quickTileIcon, { backgroundColor: withOpacity(theme.colors.primary, 0.1) }]}>
            <Ionicons name="calendar" size={18} color={theme.colors.primary} />
          </View>
          <Text style={styles.quickTileText}>Calendar</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/(app)/memories')}
          style={({ pressed }) => [styles.quickTile, pressed && styles.quickTilePressed]}
        >
          <View style={[styles.quickTileIcon, { backgroundColor: withOpacity(theme.colors.accent, 0.12) }]}>
            <Ionicons name="images" size={18} color={theme.colors.accent} />
          </View>
          <Text style={styles.quickTileText}>Memories</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/(app)/notes')}
          style={({ pressed }) => [styles.quickTile, pressed && styles.quickTilePressed]}
        >
          <View style={[styles.quickTileIcon, { backgroundColor: withOpacity(theme.colors.secondary, 0.1) }]}>
            <Ionicons name="document-text" size={18} color={theme.colors.secondary} />
          </View>
          <Text style={styles.quickTileText}>Notes</Text>
        </Pressable>
      </View>

      <Card theme={theme} style={[styles.card, styles.listCard]}>
        <Text style={styles.listSectionLabel}>Account</Text>
        <ActionRow
          theme={theme}
          styles={styles}
          icon="person"
          tone="primary"
          title="Personal information"
          subtitle="Name, email, profile"
          onPress={() => Alert.alert('Personal information', 'Coming soon')}
          showDivider
        />
        <ActionRow
          theme={theme}
          styles={styles}
          icon="heart"
          tone="accent"
          title="Partner"
          subtitle={partnerConnected ? 'Connection active' : 'Invite & connect'}
          onPress={() => router.push('/(app)/partner')}
          showDivider
        />
        <ActionRow
          theme={theme}
          styles={styles}
          icon="shield-checkmark"
          tone="secondary"
          title="Privacy"
          subtitle="Security & data"
          onPress={() => Alert.alert('Privacy', 'Coming soon')}
        />

        <Text style={[styles.listSectionLabel, { marginTop: theme.spacing[3] }]}>General</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: withOpacity(theme.colors.primary, 0.12) }]}>
              <Ionicons name="notifications" size={18} color={theme.colors.primary} />
            </View>
            <Text style={styles.settingText}>Notifications</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleToggleNotifications}
            trackColor={{ false: theme.colors.border, true: withOpacity(theme.colors.primary, 0.35) }}
            thumbColor={notificationsEnabled ? theme.colors.primary : theme.colors.surface}
            ios_backgroundColor={theme.colors.border}
          />
        </View>

        <View style={styles.dividerInset} />

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: withOpacity(theme.colors.secondary, 0.08) }]}>
              <Ionicons name="moon" size={18} color={theme.colors.secondary} />
            </View>
            <Text style={styles.settingText}>Dark mode</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={handleToggleDarkMode}
            trackColor={{ false: theme.colors.border, true: withOpacity(theme.colors.secondary, 0.18) }}
            thumbColor={isDark ? theme.colors.secondary : theme.colors.surface}
            ios_backgroundColor={theme.colors.border}
          />
        </View>

        <View style={styles.dividerInset} />

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: withOpacity(theme.colors.accent, 0.12) }]}>
              <Ionicons name="volume-high" size={18} color={theme.colors.accent} />
            </View>
            <Text style={styles.settingText}>Sound effects</Text>
          </View>
          <Switch
            value={soundEnabled}
            onValueChange={handleToggleSound}
            trackColor={{ false: theme.colors.border, true: withOpacity(theme.colors.accent, 0.25) }}
            thumbColor={soundEnabled ? theme.colors.accent : theme.colors.surface}
            ios_backgroundColor={theme.colors.border}
          />
        </View>

        <Text style={[styles.listSectionLabel, { marginTop: theme.spacing[3] }]}>Support</Text>
        <ActionRow
          theme={theme}
          styles={styles}
          icon="help-circle"
          tone="secondary"
          title="Help & support"
          subtitle="FAQ and contact"
          onPress={() => Alert.alert('Help & support', 'Coming soon')}
          showDivider
        />
        <ActionRow
          theme={theme}
          styles={styles}
          icon="document-text"
          tone="primary"
          title="Terms & policy"
          subtitle="Legal"
          onPress={() => Alert.alert('Terms & policy', 'Coming soon')}
        />

        <View style={styles.listSpacer} />

        <ActionRow
          theme={theme}
          styles={styles}
          icon="log-out-outline"
          title="Log out"
          subtitle="Sign out of this device"
          onPress={handleLogout}
          danger
          showChevron={false}
        />
      </Card>
    </Screen>
  );
}

const createStyles = (theme: typeof lightTheme) =>
  StyleSheet.create({
        content: {
          paddingTop: theme.spacing[4],
        },
        card: {
          marginTop: theme.spacing[4],
        },
        profileCard: {
          marginTop: theme.spacing[4],
          padding: 0,
          overflow: 'hidden',
        },
        listCard: {
          padding: 0,
        },
        listSectionLabel: {
          paddingHorizontal: theme.spacing[5],
          paddingTop: theme.spacing[4],
          paddingBottom: theme.spacing[2],
          fontSize: theme.typography.fontSize.sm,
          fontFamily: theme.typography.fontFamily.medium,
          color: theme.colors.textMuted,
        },
        listSpacer: {
          height: theme.spacing[3],
        },
        profileHeader: {
          paddingTop: theme.spacing[6],
          paddingBottom: theme.spacing[4],
          paddingHorizontal: theme.spacing[5],
          alignItems: 'center',
          borderWidth: 1,
          borderColor: withOpacity(theme.colors.border, 0.9),
          borderTopLeftRadius: theme.radius.xl,
          borderTopRightRadius: theme.radius.xl,
          backgroundColor: theme.colors.surface,
        },
        profileAvatarWrap: {
          position: 'relative',
        },
        avatarRing: {
          width: 70,
          height: 70,
          borderRadius: 35,
          padding: 2,
          backgroundColor: withOpacity(theme.colors.primary, 0.22),
        },
        avatar: {
          flex: 1,
          borderRadius: 33,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: withOpacity(theme.colors.border, 0.9),
        },
        avatarText: {
          fontSize: theme.typography.fontSize.xl,
          fontFamily: theme.typography.fontFamily.bold,
          color: theme.colors.primary,
        },
        avatarEditBtn: {
          position: 'absolute',
          right: -4,
          bottom: -2,
          width: 28,
          height: 28,
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: withOpacity(theme.colors.border, 0.9),
        },
        avatarEditBtnPressed: {
          opacity: 0.92,
          transform: [{ scale: 0.98 }],
        },
        userNameCentered: {
          marginTop: theme.spacing[4],
          fontSize: theme.typography.fontSize.xl,
          fontFamily: theme.typography.fontFamily.bold,
          color: theme.colors.textPrimary,
        },
        userEmailCentered: {
          marginTop: 2,
          fontSize: theme.typography.fontSize.sm,
          fontFamily: theme.typography.fontFamily.regular,
          color: theme.colors.textMuted,
        },
        badgeRow: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: theme.spacing[2],
          marginTop: theme.spacing[3],
        },
        badgeRowCentered: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing[2],
          marginTop: theme.spacing[4],
        },
        badge: {
          height: 30,
          borderRadius: 999,
          paddingHorizontal: theme.spacing[3],
          borderWidth: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing[2],
        },
        badgePressed: {
          opacity: 0.92,
        },
        badgeText: {
          fontSize: theme.typography.fontSize.sm,
          fontFamily: theme.typography.fontFamily.medium,
          color: theme.colors.textPrimary,
        },
        profileStatsRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: theme.spacing[5],
          paddingVertical: theme.spacing[4],
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderTopWidth: 0,
          borderColor: withOpacity(theme.colors.border, 0.9),
          borderBottomLeftRadius: theme.radius.xl,
          borderBottomRightRadius: theme.radius.xl,
        },
        profileStatItem: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        },
        profileStatDivider: {
          width: 1,
          height: 26,
          backgroundColor: theme.colors.border,
        },
        profileStatValue: {
          fontSize: theme.typography.fontSize.xl,
          fontFamily: theme.typography.fontFamily.bold,
          color: theme.colors.textPrimary,
        },
        profileStatLabel: {
          marginTop: 2,
          fontSize: theme.typography.fontSize.xs,
          color: theme.colors.textMuted,
        },
        primaryRow: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: theme.spacing[5],
          paddingVertical: theme.spacing[4],
        },
        primaryRowPressed: {
          backgroundColor: withOpacity(theme.colors.primary, 0.04),
        },
        primaryRowIcon: {
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
        },
        primaryRowText: {
          flex: 1,
          paddingHorizontal: theme.spacing[3],
        },
        primaryRowTitle: {
          fontSize: theme.typography.fontSize.base,
          fontFamily: theme.typography.fontFamily.medium,
          color: theme.colors.textPrimary,
        },
        primaryRowSubtitle: {
          marginTop: 2,
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.textMuted,
        },
        quickTilesRow: {
          marginTop: theme.spacing[4],
          flexDirection: 'row',
          gap: theme.spacing[3],
        },
        quickTile: {
          flex: 1,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.xl,
          paddingVertical: theme.spacing[4],
          paddingHorizontal: theme.spacing[4],
          alignItems: 'center',
          borderWidth: 1,
          borderColor: withOpacity(theme.colors.border, 0.9),
        },
        quickTilePressed: {
          opacity: 0.95,
          transform: [{ scale: 0.99 }],
        },
        quickTileIcon: {
          width: 38,
          height: 38,
          borderRadius: 19,
          alignItems: 'center',
          justifyContent: 'center',
        },
        quickTileText: {
          marginTop: theme.spacing[2],
          fontSize: theme.typography.fontSize.sm,
          fontFamily: theme.typography.fontFamily.medium,
          color: theme.colors.textPrimary,
        },
        sectionHeaderRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: theme.spacing[4],
        },
        sectionTitle: {
          fontSize: theme.typography.fontSize.base,
          fontFamily: theme.typography.fontFamily.medium,
          color: theme.colors.textPrimary,
        },
        sectionBadge: {
          width: 34,
          height: 34,
          borderRadius: 17,
          alignItems: 'center',
          justifyContent: 'center',
        },
        statsGrid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginHorizontal: -theme.spacing[2],
          marginTop: -theme.spacing[2],
        },
        statItem: {
          width: '50%',
          paddingHorizontal: theme.spacing[2],
          paddingTop: theme.spacing[2],
        },
        statValue: {
          fontSize: theme.typography.fontSize['2xl'],
          fontFamily: theme.typography.fontFamily.bold,
          color: theme.colors.secondary,
        },
        statLabel: {
          marginTop: 2,
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.textMuted,
        },
        settingItem: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: theme.spacing[3],
          paddingHorizontal: theme.spacing[5],
          minHeight: 52,
        },
        settingLeft: {
          flexDirection: 'row',
          alignItems: 'center',
          flex: 1,
          paddingRight: theme.spacing[3],
        },
        settingIcon: {
          width: 34,
          height: 34,
          borderRadius: 17,
          alignItems: 'center',
          justifyContent: 'center',
        },
        settingText: {
          marginLeft: theme.spacing[3],
          fontSize: theme.typography.fontSize.base,
          color: theme.colors.textPrimary,
        },
        divider: {
          height: 1,
          backgroundColor: theme.colors.border,
        },
        dividerInset: {
          height: 1,
          backgroundColor: theme.colors.border,
          marginLeft: theme.spacing[5] + 34 + theme.spacing[3],
        },
        actionRow: {
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: 52,
          paddingVertical: theme.spacing[3],
          paddingHorizontal: theme.spacing[5],
          borderRadius: theme.radius.xl,
        },
        actionRowPressed: {
          backgroundColor: withOpacity(theme.colors.primary, 0.06),
        },
        actionDivider: {
          height: 1,
          backgroundColor: theme.colors.border,
          marginLeft: theme.spacing[5] + 40 + theme.spacing[3],
          marginRight: theme.spacing[5],
        },
        actionIcon: {
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
        },
        actionText: {
          flex: 1,
          paddingHorizontal: theme.spacing[3],
        },
        actionTitle: {
          fontSize: theme.typography.fontSize.base,
          fontFamily: theme.typography.fontFamily.medium,
          color: theme.colors.textPrimary,
        },
        actionSubtitle: {
          marginTop: 2,
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.textMuted,
        },
      });
