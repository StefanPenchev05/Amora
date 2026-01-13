import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Screen from '../../src/components/layout/Screen';
import AppHeader from '../../src/components/layout/AppHeader';
import Card from '../../src/components/ui/Card';
import IconCircleButton from '../../src/components/ui/IconCircleButton';
import { withOpacity } from '../../src/components/form/color';
import { lightTheme } from '../../src/styles/theme';
import { moodService } from '../../src/services/api/moods';
import { relationshipService, RelationshipStatusResponse } from '../../src/services/api/relationship';

const moodEmojis = [
  { value: 1, emoji: '😢', label: 'Sad', color: '#6B8E9D' },
  { value: 2, emoji: '😕', label: 'Not great', color: '#9DA6B8' },
  { value: 3, emoji: '😐', label: 'Okay', color: '#F59E0B' },
  { value: 4, emoji: '😊', label: 'Good', color: '#60A5FA' },
  { value: 5, emoji: '😄', label: 'Amazing', color: '#22C55E' },
] as const;

type MoodEntry = {
  id: string;
  mood: number;
  date: string;
  time: string;
  note: string;
};

export default function MoodScreen() {
  const router = useRouter();
  const theme = lightTheme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [relationship, setRelationship] = useState<RelationshipStatusResponse | null>(null);
  const [loadingRelationship, setLoadingRelationship] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [moodNote, setMoodNote] = useState('');
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void loadMoods();
    void loadRelationship();
  }, []);

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const loadRelationship = async () => {
    try {
      setLoadingRelationship(true);
      const status = await relationshipService.getStatus();
      setRelationship(status);
    } catch {
      // Non-blocking.
      setRelationship(null);
    } finally {
      setLoadingRelationship(false);
    }
  };

  const loadMoods = async () => {
    try {
      const apiMoods = await moodService.getAll();
      const mapped: MoodEntry[] = apiMoods.map((m) => ({
        id: m.id,
        mood: m.level,
        date: formatDateLabel(m.mood_date),
        time: new Date(m.mood_date).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        }),
        note: m.note?.trim() ? m.note : '—',
      }));
      setMoodHistory(mapped);
    } catch (error) {
      Alert.alert('Error', 'Failed to load moods');
      console.error('Error loading moods:', error);
    }
  };

  const handleSaveMood = async () => {
    if (!selectedMood) return;

    try {
      setSaving(true);
      await moodService.create({
        level: selectedMood,
        note: moodNote || '',
        mood_date: new Date().toISOString(),
      });
      await loadMoods();

      setModalVisible(false);
      setSelectedMood(null);
      setMoodNote('');
    } catch (error) {
      Alert.alert('Error', 'Failed to save mood');
      console.error('Error saving mood:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMood = async (id: string) => {
    try {
      await moodService.delete(id);
      await loadMoods();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete mood');
      console.error('Error deleting mood:', error);
    }
  };

  const getMoodMeta = (value: number) => moodEmojis.find((m) => m.value === value);

  const weeklyAverage = useMemo(() => {
    if (moodHistory.length === 0) return '—';
    const slice = moodHistory.slice(0, 7);
    const sum = slice.reduce((acc, m) => acc + m.mood, 0);
    return (sum / slice.length).toFixed(1);
  }, [moodHistory]);

  const partnerConnected = relationship?.status === 'active';
  const partnerName = relationship?.partner?.full_name || relationship?.partner?.username || 'Partner';

  return (
    <Screen scroll theme={theme} contentStyle={styles.content}>
      <AppHeader
        title="Mood"
        subtitle="Track how you feel"
        onBack={() => router.back()}
        theme={theme}
        right={
          <IconCircleButton
            icon="add"
            theme={theme}
            onPress={() => {
              setSelectedMood(null);
              setMoodNote('');
              setModalVisible(true);
            }}
          />
        }
      />

      <Card theme={theme} style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryLeft}>
            <Text style={styles.cardTitle}>This week</Text>
            <Text style={styles.cardSubtitle}>Average mood</Text>
          </View>
          <View style={styles.summaryRight}>
            <Text style={styles.averageText}>{weeklyAverage}</Text>
          </View>
        </View>

        <View style={styles.moodBar}>
          {moodHistory
            .slice(0, 7)
            .reverse()
            .map((m) => {
              const meta = getMoodMeta(m.mood);
              return (
                <View key={m.id} style={styles.barColumn}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${m.mood * 20}%`,
                        backgroundColor: meta?.color ?? theme.colors.primary,
                      },
                    ]}
                  />
                </View>
              );
            })}
          {moodHistory.length === 0 ? (
            <View style={styles.emptyBarHint}>
              <Text style={styles.emptyBarText}>Log a mood to see trends.</Text>
            </View>
          ) : null}
        </View>
      </Card>

      {partnerConnected ? (
        <Card theme={theme} style={styles.partnerCard}>
          <View style={styles.partnerRow}>
            <View style={[styles.partnerIcon, { backgroundColor: withOpacity(theme.colors.accent, 0.12) }]}>
              <Ionicons name="checkmark" size={18} color={theme.colors.accent} />
            </View>
            <View style={styles.partnerText}>
              <Text style={styles.cardTitle}>{partnerName} connected</Text>
              <Text style={styles.cardSubtitle}>
                Partner mood sharing will appear here once available.
              </Text>
            </View>
          </View>
        </Card>
      ) : (
        <Card theme={theme} style={styles.partnerCard}>
          <View style={styles.partnerRow}>
            <View style={styles.partnerIcon}>
              <Ionicons name="heart" size={18} color={theme.colors.primary} />
            </View>
            <View style={styles.partnerText}>
              <Text style={styles.cardTitle}>Share with a partner</Text>
              <Text style={styles.cardSubtitle}>
                Connect your partner to unlock shared features.
              </Text>
            </View>
            <Pressable
              onPress={() => router.push('/(app)/partner')}
              style={({ pressed }) => [styles.partnerCta, pressed && styles.pressed]}
            >
              <Text style={styles.partnerCtaText}>Connect</Text>
            </Pressable>
          </View>
          {loadingRelationship ? (
            <Text style={styles.microText}>Checking relationship...</Text>
          ) : null}
        </Card>
      )}

      <Card theme={theme} style={styles.card}>
        <Text style={styles.sectionTitle}>How are you feeling?</Text>
        <View style={styles.moodRow}>
          {moodEmojis.map((m) => (
            <Pressable
              key={m.value}
              onPress={() => {
                setSelectedMood(m.value);
                setModalVisible(true);
              }}
              style={({ pressed }) => [
                styles.moodButton,
                { backgroundColor: withOpacity(m.color, 0.12) },
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.moodEmoji}>{m.emoji}</Text>
              <Text style={styles.moodLabel}>{m.label}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card theme={theme} style={styles.card}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>History</Text>
          <Pressable onPress={loadMoods} style={({ pressed }) => [styles.refreshBtn, pressed && styles.pressed]}>
            <Ionicons name="refresh" size={18} color={theme.colors.textMuted} />
          </Pressable>
        </View>

        {moodHistory.length === 0 ? (
          <Text style={styles.emptyText}>No moods yet. Add your first one.</Text>
        ) : null}

        {moodHistory.map((entry, index) => {
          const meta = getMoodMeta(entry.mood);
          return (
            <View
              key={entry.id}
              style={[
                styles.row,
                index !== 0 && { marginTop: theme.spacing[3] },
                { borderColor: theme.colors.border },
              ]}
            >
              <View style={[styles.moodIndicator, { backgroundColor: withOpacity(meta?.color ?? theme.colors.primary, 0.16) }]}>
                <Text style={styles.moodCardEmoji}>{meta?.emoji ?? '🙂'}</Text>
              </View>
              <View style={styles.rowContent}>
                <Text numberOfLines={2} style={styles.rowTitle}>
                  {entry.note}
                </Text>
                <Text style={styles.rowMeta}>
                  {entry.date} • {entry.time}
                </Text>
              </View>
              <Pressable
                onPress={() => handleDeleteMood(entry.id)}
                hitSlop={10}
                style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
              >
                <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
              </Pressable>
            </View>
          );
        })}
      </Card>

      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log mood</Text>
              <Pressable onPress={() => setModalVisible(false)} hitSlop={10}>
                <Ionicons name="close" size={26} color={theme.colors.textMuted} />
              </Pressable>
            </View>

            <View style={styles.modalMoodRow}>
              {moodEmojis.map((m) => {
                const selected = selectedMood === m.value;
                return (
                  <Pressable
                    key={m.value}
                    onPress={() => setSelectedMood(m.value)}
                    style={({ pressed }) => [
                      styles.modalMoodOption,
                      {
                        borderColor: selected ? withOpacity(theme.colors.primary, 0.35) : theme.colors.border,
                        backgroundColor: selected
                          ? withOpacity(m.color, 0.18)
                          : withOpacity(theme.colors.surface, 0.7),
                      },
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.modalMoodEmoji}>{m.emoji}</Text>
                  </Pressable>
                );
              })}
            </View>

            {selectedMood ? (
              <Text style={styles.selectedMoodText}>{getMoodMeta(selectedMood)?.label}</Text>
            ) : (
              <Text style={styles.selectedMoodHint}>Pick a mood to continue.</Text>
            )}

            <TextInput
              style={styles.noteInput}
              placeholder="Add a note (optional)"
              placeholderTextColor={theme.colors.textMuted}
              multiline
              numberOfLines={4}
              value={moodNote}
              onChangeText={setMoodNote}
            />

            <Pressable
              onPress={handleSaveMood}
              disabled={!selectedMood || saving}
              style={({ pressed }) => [
                styles.saveMoodButton,
                (!selectedMood || saving) && styles.saveMoodButtonDisabled,
                pressed && styles.pressed,
              ]}
            >
              {saving ? (
                <ActivityIndicator color={theme.colors.onPrimary} />
              ) : (
                <Text style={styles.saveMoodButtonText}>Save</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const createStyles = (theme: typeof lightTheme) =>
  StyleSheet.create({
    content: {
      paddingTop: theme.spacing[4],
    },
    pressed: {
      opacity: 0.92,
      transform: [{ scale: 0.99 }],
    },
    card: {
      marginTop: theme.spacing[4],
    },
    summaryCard: {
      marginTop: theme.spacing[4],
    },
    partnerCard: {
      marginTop: theme.spacing[4],
      paddingVertical: theme.spacing[4],
    },
    cardTitle: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.textPrimary,
    },
    cardSubtitle: {
      marginTop: 2,
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textMuted,
    },
    microText: {
      marginTop: theme.spacing[2],
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textMuted,
    },
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
    },
    summaryLeft: {
      flex: 1,
    },
    summaryRight: {
      alignItems: 'flex-end',
    },
    averageText: {
      fontSize: 34,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.secondary,
    },
    moodBar: {
      marginTop: theme.spacing[4],
      flexDirection: 'row',
      alignItems: 'flex-end',
      height: 96,
    },
    barColumn: {
      flex: 1,
      height: '100%',
      marginHorizontal: 3,
      backgroundColor: withOpacity(theme.colors.border, 0.6),
      borderRadius: 8,
      overflow: 'hidden',
    },
    barFill: {
      width: '100%',
      position: 'absolute',
      bottom: 0,
      borderRadius: 8,
    },
    emptyBarHint: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyBarText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textMuted,
    },
    partnerRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    partnerIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: withOpacity(theme.colors.primary, 0.12),
    },
    partnerText: {
      flex: 1,
      paddingHorizontal: theme.spacing[3],
    },
    partnerCta: {
      paddingHorizontal: theme.spacing[4],
      paddingVertical: theme.spacing[2],
      borderRadius: 999,
      backgroundColor: withOpacity(theme.colors.primary, 0.12),
      borderWidth: 1,
      borderColor: withOpacity(theme.colors.primary, 0.2),
    },
    partnerCtaText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.primary,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.textPrimary,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing[3],
    },
    refreshBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: withOpacity(theme.colors.border, 0.5),
    },
    moodRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.spacing[4],
    },
    moodButton: {
      width: 62,
      paddingVertical: theme.spacing[3],
      borderRadius: theme.radius.lg,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: withOpacity(theme.colors.border, 0.7),
    },
    moodEmoji: {
      fontSize: 26,
    },
    moodLabel: {
      marginTop: 6,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textMuted,
      textAlign: 'center',
    },
    emptyText: {
      marginTop: theme.spacing[3],
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textMuted,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing[3],
      borderRadius: theme.radius.lg,
      borderWidth: 1,
    },
    moodIndicator: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    moodCardEmoji: {
      fontSize: 18,
    },
    rowContent: {
      flex: 1,
      paddingHorizontal: theme.spacing[3],
    },
    rowTitle: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textPrimary,
    },
    rowMeta: {
      marginTop: 2,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textMuted,
    },
    iconBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: withOpacity(theme.colors.error, 0.08),
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: theme.spacing[5],
      paddingBottom: theme.spacing[8],
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing[4],
    },
    modalTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.textPrimary,
    },
    modalMoodRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing[3],
    },
    modalMoodOption: {
      width: 56,
      height: 56,
      borderRadius: 18,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalMoodEmoji: {
      fontSize: 24,
    },
    selectedMoodText: {
      marginBottom: theme.spacing[3],
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.textPrimary,
      textAlign: 'center',
    },
    selectedMoodHint: {
      marginBottom: theme.spacing[3],
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textMuted,
      textAlign: 'center',
    },
    noteInput: {
      minHeight: 110,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing[4],
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textPrimary,
      backgroundColor: withOpacity(theme.colors.background, 0.7),
    },
    saveMoodButton: {
      marginTop: theme.spacing[4],
      height: 52,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
    },
    saveMoodButtonDisabled: {
      opacity: 0.5,
    },
    saveMoodButtonText: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.onPrimary,
    },
  });
