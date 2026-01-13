import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';

import Screen from '../../src/components/layout/Screen';
import AppHeader from '../../src/components/layout/AppHeader';
import Card from '../../src/components/ui/Card';
import IconCircleButton from '../../src/components/ui/IconCircleButton';
import { lightTheme } from '../../src/styles/theme';
import { relationshipService, type RelationshipStatusResponse } from '../../src/services/api/relationship';
import { withOpacity } from '../../src/components/form/color';

const normalizeInviteCode = (value: string) => value.replaceAll(/[^a-z0-9]/gi, '').toUpperCase();
const formatInviteCode = (value: string) => {
  const code = normalizeInviteCode(value);
  if (code.length <= 4) return code;
  return `${code.slice(0, 4)} ${code.slice(4, 8)}`;
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export default function PartnerConnectScreen() {
  const router = useRouter();
  const theme = lightTheme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'none' | 'pending' | 'active'>('none');
  const [inviteCode, setInviteCode] = useState<string>('');
  const [partnerCode, setPartnerCode] = useState<string>('');
  const [partner, setPartner] = useState<
    | {
        user_id: string;
        email: string;
        username: string;
        full_name: string;
      }
    | undefined
  >(undefined);
  const [connectedSince, setConnectedSince] = useState<string | undefined>(undefined);
  const [daysConnected, setDaysConnected] = useState<number | undefined>(undefined);
  const [stats, setStats] = useState<RelationshipStatusResponse['stats'] | undefined>(undefined);

  const isActive = status === 'active';

  const formatAmount = (value: number | undefined) => {
    if (typeof value !== 'number' || Number.isNaN(value)) return '0.00';
    return value.toFixed(2);
  };

  const refresh = async () => {
    const res = await relationshipService.getStatus();
    setStatus(res.status);
    setInviteCode(res.invite_code ?? '');
    setPartner(res.partner);
    setConnectedSince(res.connected_since);
    setDaysConnected(res.days_connected);
    setStats(res.stats);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refresh();
      } catch (e: any) {
        if (!cancelled) Alert.alert('Error', e?.message ?? 'Failed to load relationship status');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onCreateInvite = async () => {
    try {
      setLoading(true);
      const res = await relationshipService.createInvite();
      setStatus(res.status);
      setInviteCode(res.invite_code ?? '');
      setPartner(res.partner);
      setConnectedSince(res.connected_since);
      setDaysConnected(res.days_connected);
      setStats(res.stats);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to create invite');
    } finally {
      setLoading(false);
    }
  };

  const onRegenerateInvite = async () => {
    try {
      setLoading(true);
      const res = await relationshipService.regenerateInvite();
      setStatus(res.status);
      setInviteCode(res.invite_code ?? '');
      setPartner(res.partner);
      setConnectedSince(res.connected_since);
      setDaysConnected(res.days_connected);
      setStats(res.stats);
      if (res.invite_code) Alert.alert('New code', 'Invite code regenerated.');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to regenerate invite');
    } finally {
      setLoading(false);
    }
  };

  const onCopy = async () => {
    if (!inviteCode) {
      Alert.alert('Invite code', 'Create a code first.');
      return;
    }
    try {
      await Clipboard.setStringAsync(normalizeInviteCode(inviteCode));
      Alert.alert('Copied', 'Invite code copied to clipboard.');
    } catch {
      Alert.alert('Error', 'Failed to copy code.');
    }
  };

  const onShare = async () => {
    if (!inviteCode) {
      Alert.alert('Invite code', 'Create a code first.');
      return;
    }
    const formatted = formatInviteCode(inviteCode);
    try {
      await Share.share({
        message: `Join me on Amora. Use this invite code: ${formatted}`,
      });
    } catch {
      // Share sheet can be dismissed without an error.
    }
  };

  const onAcceptInvite = async () => {
    const code = normalizeInviteCode(partnerCode);
    if (!code) {
      Alert.alert('Invite code', 'Please enter a code.');
      return;
    }
    try {
      setLoading(true);
      const res = await relationshipService.acceptInvite(code);
      setStatus(res.status);
      setInviteCode(res.invite_code ?? '');
      setPartner(res.partner);
      setConnectedSince(res.connected_since);
      setDaysConnected(res.days_connected);
      setStats(res.stats);
      Alert.alert('Connected', 'You are now connected.');
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to accept invite');
    } finally {
      setLoading(false);
    }
  };

  const onBreakUp = async () => {
    Alert.alert(
      'Break up',
      'This will disconnect you and remove shared access. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Break up',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const res = await relationshipService.breakUp();
              setStatus(res.status);
              setInviteCode('');
              setPartnerCode('');
              setPartner(undefined);
              setConnectedSince(undefined);
              setDaysConnected(undefined);
              setStats(undefined);
            } catch (e: any) {
              Alert.alert('Error', e?.message ?? 'Failed to break up');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const headline = isActive ? 'Partner connected' : 'Connect your partner';
  const subtitle = isActive
    ? 'Your shared space is ready.'
    : 'Invite your partner or enter a code you received.';

  const connectedSinceLabel = connectedSince
    ? new Date(connectedSince).toLocaleDateString()
    : undefined;

  return (
    <Screen scroll theme={theme} contentStyle={styles.content}>
      <AppHeader title={headline} subtitle={subtitle} onBack={() => router.back()} theme={theme} />

      <View style={styles.stack}>
        {isActive ? (
          <>
            <Card theme={theme} style={styles.card}>
              <View style={styles.row}>
                <View style={styles.iconWrap}>
                  <Ionicons name="heart" size={18} color={theme.colors.primary} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.cardTitle}>Your partner</Text>
                  <Text style={styles.cardSub}>
                    {partner?.full_name ?? 'Connected'}
                    {partner?.username ? ` • @${partner.username}` : ''}
                  </Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{daysConnected ?? 0}</Text>
                  <Text style={styles.statLabel}>Days together</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{connectedSinceLabel ?? '—'}</Text>
                  <Text style={styles.statLabel}>Connected since</Text>
                </View>
              </View>
            </Card>

            <Card theme={theme} style={styles.card}>
              <View style={styles.row}>
                <View style={styles.iconWrap}>
                  <Ionicons name="stats-chart" size={18} color={theme.colors.primary} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.cardTitle}>Together stats</Text>
                  <Text style={styles.cardSub}>A quick snapshot of your shared activity.</Text>
                </View>
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statsTile}>
                  <Text style={styles.statsTileValue}>{stats?.moods_last_7_days ?? 0}</Text>
                  <Text style={styles.statsTileLabel}>Moods (7d)</Text>
                </View>
                <View style={styles.statsTile}>
                  <Text style={styles.statsTileValue}>{stats?.events_next_7_days ?? 0}</Text>
                  <Text style={styles.statsTileLabel}>Events (next 7d)</Text>
                </View>
                <View style={styles.statsTile}>
                  <Text style={styles.statsTileValue}>{stats?.memories_total ?? 0}</Text>
                  <Text style={styles.statsTileLabel}>Memories</Text>
                </View>
                <View style={styles.statsTile}>
                  <Text style={styles.statsTileValue}>{stats?.notes_total ?? 0}</Text>
                  <Text style={styles.statsTileLabel}>Notes</Text>
                </View>
                <View style={styles.statsTile}>
                  <Text style={styles.statsTileValue}>{formatAmount(stats?.expenses_unsettled)}</Text>
                  <Text style={styles.statsTileLabel}>Unsettled</Text>
                </View>
                <View style={styles.statsTile}>
                  <Text style={styles.statsTileValue}>{stats?.expenses_unsettled_count ?? 0}</Text>
                  <Text style={styles.statsTileLabel}>To settle</Text>
                </View>
              </View>
            </Card>

            <Card theme={theme} style={styles.card}>
              <View style={styles.row}>
                <View style={styles.iconWrap}>
                  <Ionicons name="apps" size={18} color={theme.colors.primary} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.cardTitle}>Quick actions</Text>
                  <Text style={styles.cardSub}>Jump into your shared space.</Text>
                </View>
              </View>

              <View style={styles.actionGrid}>
                <TouchableOpacity style={styles.actionTile} onPress={() => router.push('/dashboard')}>
                  <Ionicons name="grid" size={18} color={theme.colors.primary} style={styles.actionIcon} />
                  <Text style={styles.actionText}>Dashboard</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionTile} onPress={() => router.push('/calendar')}>
                  <Ionicons name="calendar" size={18} color={theme.colors.primary} style={styles.actionIcon} />
                  <Text style={styles.actionText}>Calendar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionTile} onPress={() => router.push('/memories')}>
                  <Ionicons name="images" size={18} color={theme.colors.primary} style={styles.actionIcon} />
                  <Text style={styles.actionText}>Memories</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionTile} onPress={() => router.push('/notes')}>
                  <Ionicons name="document-text" size={18} color={theme.colors.primary} style={styles.actionIcon} />
                  <Text style={styles.actionText}>Notes</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.dangerBtn, loading && styles.disabledBtn]}
                onPress={onBreakUp}
                disabled={loading}
              >
                <Text style={styles.dangerBtnText}>Break up</Text>
              </TouchableOpacity>
            </Card>
          </>
        ) : null}

        {isActive ? null : (
          <>
            <Card theme={theme} style={styles.card}>
          <View style={styles.row}>
            <View style={styles.iconWrap}>
              <Ionicons name="people" size={18} color={theme.colors.primary} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.cardTitle}>Your invite</Text>
              <Text style={styles.cardSub}>Create a code and share it with your partner.</Text>
            </View>
          </View>

          <View style={styles.inviteBox}>
            <Text style={styles.inviteCode}>
              {inviteCode ? formatInviteCode(inviteCode) : '— — — — — — — —'}
            </Text>

            <View style={styles.inviteActionsRow}>
              <IconCircleButton icon="copy-outline" theme={theme} onPress={onCopy} />
              <View style={{ width: theme.spacing[2] }} />
              <IconCircleButton icon="share-outline" theme={theme} onPress={onShare} />
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.disabledBtn]}
              onPress={inviteCode ? onRegenerateInvite : onCreateInvite}
              disabled={loading}
            >
              <Text style={styles.primaryBtnText}>{inviteCode ? 'Regenerate' : 'Create invite'}</Text>
            </TouchableOpacity>
          </View>
            </Card>

            <Card theme={theme} style={styles.card}>
          <View style={styles.row}>
            <View style={styles.iconWrap}>
              <Ionicons name="key" size={18} color={theme.colors.primary} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.cardTitle}>Have a code?</Text>
              <Text style={styles.cardSub}>Enter it to connect instantly.</Text>
            </View>
          </View>

          <View style={styles.acceptRow}>
            <TextInput
              value={partnerCode}
              onChangeText={(t) => setPartnerCode(normalizeInviteCode(t))}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={8}
              placeholder="ABCDEFGH"
              placeholderTextColor={theme.colors.textMuted}
              style={styles.input}
            />
            <TouchableOpacity
              style={[styles.secondaryBtn, loading && styles.disabledBtn]}
              onPress={onAcceptInvite}
              disabled={loading}
            >
              <Text style={styles.secondaryBtnText}>Connect</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.hintText}>Tip: you can paste codes with spaces or dashes.</Text>
            </Card>
          </>
        )}
      </View>
    </Screen>
  );
}

const createStyles = (theme: typeof lightTheme) =>
  StyleSheet.create({
    content: {
      paddingTop: theme.spacing[4],
      paddingBottom: theme.spacing[8],
    },
    stack: {
      marginTop: theme.spacing[4],
    },
    card: {
      marginBottom: theme.spacing[4],
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing[4],
    },
    flex: { flex: 1 },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: withOpacity(theme.colors.primary, 0.08),
      marginRight: theme.spacing[3],
    },
    cardTitle: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.textPrimary,
    },
    cardSub: {
      marginTop: 2,
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textMuted,
    },
    inviteBox: {
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.background,
      padding: theme.spacing[4],
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    inviteCode: {
      fontSize: 20,
      letterSpacing: 2,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.textPrimary,
      textAlign: 'center',
      marginBottom: theme.spacing[3],
    },
    inviteActionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing[4],
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'stretch',
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
    },
    statItem: {
      flex: 1,
      paddingVertical: theme.spacing[4],
      paddingHorizontal: theme.spacing[4],
      alignItems: 'center',
      justifyContent: 'center',
    },
    statDivider: {
      width: 1,
      backgroundColor: theme.colors.border,
    },
    statValue: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.textPrimary,
    },
    statLabel: {
      marginTop: 2,
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textMuted,
    },
    actionGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: theme.spacing[2],
      marginBottom: theme.spacing[4],
      justifyContent: 'space-between',
    },
    actionTile: {
      flexGrow: 1,
      width: '48%',
      height: 48,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: theme.spacing[4],
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing[3],
    },
    actionText: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.textPrimary,
    },
    actionIcon: {
      marginRight: theme.spacing[2],
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginTop: theme.spacing[2],
    },
    statsTile: {
      width: '48%',
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: theme.spacing[4],
      paddingVertical: theme.spacing[4],
      marginBottom: theme.spacing[3],
    },
    statsTileValue: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.textPrimary,
    },
    statsTileLabel: {
      marginTop: 2,
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textMuted,
    },
    acceptRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    input: {
      flex: 1,
      height: 48,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: theme.spacing[4],
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.textPrimary,
      marginRight: theme.spacing[3],
    },
    primaryBtn: {
      height: 44,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryBtnText: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.onPrimary,
    },
    secondaryBtn: {
      height: 48,
      paddingHorizontal: theme.spacing[4],
      borderRadius: theme.radius.lg,
      backgroundColor: withOpacity(theme.colors.primary, 0.1),
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: withOpacity(theme.colors.primary, 0.2),
    },
    secondaryBtnText: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.primary,
    },
    dangerBtn: {
      height: 48,
      borderRadius: theme.radius.lg,
      backgroundColor: withOpacity(theme.colors.error, 0.12),
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: withOpacity(theme.colors.error, 0.25),
    },
    dangerBtnText: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.error,
    },
    disabledBtn: {
      opacity: 0.6,
    },
    hintText: {
      marginTop: theme.spacing[3],
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textMuted,
    },
    successTitle: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing[2],
    },
    successSub: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textMuted,
    },
  });
