import React, { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import Screen from '../../src/components/layout/Screen';
import AppHeader from '../../src/components/layout/AppHeader';
import Card from '../../src/components/ui/Card';
import { lightTheme } from '../../src/styles/theme';
import { relationshipService } from '../../src/services/api/relationship';
import { withOpacity } from '../../src/components/form/color';

export default function PartnerConnectScreen() {
  const router = useRouter();
  const theme = lightTheme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'none' | 'pending' | 'active'>('none');
  const [inviteCode, setInviteCode] = useState<string>('');
  const [partnerCode, setPartnerCode] = useState<string>('');

  const refresh = async () => {
    const res = await relationshipService.getStatus();
    setStatus(res.status);
    setInviteCode(res.invite_code ?? '');
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
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to create invite');
    } finally {
      setLoading(false);
    }
  };

  const onAcceptInvite = async () => {
    const code = partnerCode.trim();
    if (!code) {
      Alert.alert('Invite code', 'Please enter a code.');
      return;
    }
    try {
      setLoading(true);
      const res = await relationshipService.acceptInvite(code);
      setStatus(res.status);
      setInviteCode(res.invite_code ?? '');
      Alert.alert('Connected', 'You are now connected.');
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to accept invite');
    } finally {
      setLoading(false);
    }
  };

  const headline = status === 'active' ? 'Partner connected' : 'Connect your partner';
  const subtitle = status === 'active'
    ? 'Your shared space is ready.'
    : 'Invite your partner or enter a code you received.';

  return (
    <Screen scroll theme={theme} contentStyle={styles.content}>
      <AppHeader title={headline} subtitle={subtitle} onBack={() => router.back()} theme={theme} />

      <Card theme={theme}>
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
          <Text style={styles.inviteCode}>{inviteCode || '— — — — — — — —'}</Text>
          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.disabledBtn]}
            onPress={onCreateInvite}
            disabled={loading}
          >
            <Text style={styles.primaryBtnText}>{inviteCode ? 'Regenerate' : 'Create invite'}</Text>
          </TouchableOpacity>
        </View>
      </Card>

      <Card theme={theme}>
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
            onChangeText={setPartnerCode}
            autoCapitalize="characters"
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
      </Card>

      {status === 'active' ? (
        <Card theme={theme}>
          <Text style={styles.successTitle}>All set</Text>
          <Text style={styles.successSub}>You can now share moods, events, and memories together.</Text>
        </Card>
      ) : null}
    </Screen>
  );
}

const createStyles = (theme: typeof lightTheme) =>
  StyleSheet.create({
    content: {
      paddingTop: theme.spacing[4],
      paddingBottom: theme.spacing[8],
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
      marginBottom: theme.spacing[4],
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
    disabledBtn: {
      opacity: 0.6,
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
