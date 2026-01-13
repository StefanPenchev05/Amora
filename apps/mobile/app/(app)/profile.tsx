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
import { authService } from '../../src/services/api/auth';
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
  subtitle: string;
  onPress: () => void;
  tone?: 'primary' | 'secondary' | 'accent';
  showDivider?: boolean;
  danger?: boolean;
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
          <Text style={styles.actionSubtitle}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
      </Pressable>
      {showDivider ? <View style={styles.actionDivider} /> : null}
    </>
  );
};

export default function ProfileScreen() {
  const router = useRouter();
  const theme = lightTheme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [stats, setStats] = useState({ memories: 0, events: 0, notes: 0, expenses: 0 });

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

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        setNotificationsEnabled(parsed.notifications ?? true);
        setDarkModeEnabled(parsed.darkMode ?? false);
        setSoundEnabled(parsed.sound ?? true);
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
    setDarkModeEnabled(value);
    saveSettings('darkMode', value);
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
    <Screen scroll theme={theme} contentStyle={styles.content}>
      <AppHeader theme={theme} title="Profile" onBack={() => router.back()} />

      <Card theme={theme} style={styles.profileCard}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(userName || 'U').slice(0, 1).toUpperCase()}</Text>
          </View>
          <View style={styles.profileText}>
            {loadingProfile ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : (
              <>
                <Text style={styles.userName}>{userName || '—'}</Text>
                <Text style={styles.userEmail}>{userEmail || '—'}</Text>
              </>
            )}
          </View>
        </View>
      </Card>

      <Card theme={theme} style={styles.card}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Your activity</Text>
          <View style={[styles.sectionBadge, { backgroundColor: withOpacity(theme.colors.primary, 0.12) }]}>
            <Ionicons name="stats-chart" size={18} color={theme.colors.primary} />
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.memories}</Text>
            <Text style={styles.statLabel}>Memories</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.events}</Text>
            <Text style={styles.statLabel}>Events</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.notes}</Text>
            <Text style={styles.statLabel}>Notes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.expenses}</Text>
            <Text style={styles.statLabel}>Expenses</Text>
          </View>
        </View>
      </Card>

      <Card theme={theme} style={styles.card}>
        <Text style={styles.sectionTitle}>Settings</Text>

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

        <View style={styles.divider} />

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: withOpacity(theme.colors.secondary, 0.08) }]}>
              <Ionicons name="moon" size={18} color={theme.colors.secondary} />
            </View>
            <Text style={styles.settingText}>Dark mode</Text>
          </View>
          <Switch
            value={darkModeEnabled}
            onValueChange={handleToggleDarkMode}
            trackColor={{ false: theme.colors.border, true: withOpacity(theme.colors.secondary, 0.18) }}
            thumbColor={darkModeEnabled ? theme.colors.secondary : theme.colors.surface}
            ios_backgroundColor={theme.colors.border}
          />
        </View>

        <View style={styles.divider} />

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
      </Card>

      <Card theme={theme} style={styles.card}>
        <Text style={styles.sectionTitle}>Shortcuts</Text>

        <ActionRow
          theme={theme}
          styles={styles}
          icon="heart"
          tone="primary"
          title="Partner"
          subtitle="Invites & connection status"
          onPress={() => router.push('/(app)/partner')}
          showDivider
        />

        <ActionRow
          theme={theme}
          styles={styles}
          icon="document-text"
          tone="secondary"
          title="Notes"
          subtitle="Quick thoughts and reminders"
          onPress={() => router.push('/(app)/notes')}
          showDivider
        />

        <ActionRow
          theme={theme}
          styles={styles}
          icon="images"
          tone="accent"
          title="Memories"
          subtitle="Photos and moments together"
          onPress={() => router.push('/(app)/memories')}
        />
      </Card>

      <Card theme={theme} style={styles.card}>
        <Text style={styles.sectionTitle}>Account</Text>

        <ActionRow
          theme={theme}
          styles={styles}
          icon="log-out-outline"
          title="Log out"
          subtitle="Sign out of this device"
          onPress={handleLogout}
          danger
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
        },
        profileRow: {
          flexDirection: 'row',
          alignItems: 'center',
        },
        avatar: {
          width: 56,
          height: 56,
          borderRadius: 28,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: withOpacity(theme.colors.primary, 0.14),
          borderWidth: 1,
          borderColor: withOpacity(theme.colors.primary, 0.2),
        },
        avatarText: {
          fontSize: theme.typography.fontSize.xl,
          fontFamily: theme.typography.fontFamily.bold,
          color: theme.colors.primary,
        },
        profileText: {
          flex: 1,
          paddingLeft: theme.spacing[4],
        },
        userName: {
          fontSize: theme.typography.fontSize.lg,
          fontFamily: theme.typography.fontFamily.bold,
          color: theme.colors.textPrimary,
        },
        userEmail: {
          marginTop: 2,
          fontSize: theme.typography.fontSize.sm,
          fontFamily: theme.typography.fontFamily.regular,
          color: theme.colors.textMuted,
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
        actionRow: {
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: 52,
          paddingVertical: theme.spacing[3],
          marginHorizontal: -theme.spacing[5],
          paddingHorizontal: theme.spacing[5],
          borderRadius: theme.radius.xl,
        },
        actionRowPressed: {
          backgroundColor: withOpacity(theme.colors.primary, 0.06),
        },
        actionDivider: {
          height: 1,
          backgroundColor: theme.colors.border,
          marginHorizontal: -theme.spacing[5],
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
