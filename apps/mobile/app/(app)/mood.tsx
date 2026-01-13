import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { moodService } from '../../src/services/api/moods';

const { width } = Dimensions.get('window');

const moodEmojis = [
  { value: 1, emoji: '😢', label: 'Sad', color: '#6B8E9D' },
  { value: 2, emoji: '😕', label: 'Not Great', color: '#9DA6B8' },
  { value: 3, emoji: '😐', label: 'Okay', color: '#FFB347' },
  { value: 4, emoji: '😊', label: 'Good', color: '#87CEEB' },
  { value: 5, emoji: '😄', label: 'Amazing', color: '#50C878' },
];

interface MoodEntry {
  id: string;
  mood: number;
  date: string;
  time: string;
  note: string;
}

export default function MoodScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [moodNote, setMoodNote] = useState('');
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMoods();
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

  const loadMoods = async () => {
    try {
      const apiMoods = await moodService.getAll();
      const mapped: MoodEntry[] = apiMoods.map((m) => ({
        id: m.id,
        mood: m.level,
        date: formatDateLabel(m.mood_date),
        time: new Date(m.mood_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        note: m.note || 'No note',
      }));
      setMoodHistory(mapped);
    } catch (error) {
      Alert.alert('Error', 'Failed to load moods');
      console.error('Error loading moods:', error);
    }
  };

  const partnerMoodHistory = [
    { id: 1, mood: 4, date: 'Today', time: '11:00 AM', note: 'Loved our breakfast!' },
    { id: 2, mood: 5, date: 'Yesterday', time: '9:00 PM', note: 'Best movie night ever' },
    { id: 3, mood: 3, date: 'Jan 13', time: '3:00 PM', note: 'Tired but happy to help' },
  ];

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

  const getMoodEmoji = (value: number) => {
    return moodEmojis.find(m => m.value === value);
  };

  const getWeeklyAverage = () => {
    if (moodHistory.length === 0) return '0.0';
    const sum = moodHistory.slice(0, 7).reduce((acc, m) => acc + m.mood, 0);
    return (sum / Math.min(moodHistory.length, 7)).toFixed(1);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#E5F3FF', '#FFF5E5', '#FFFFFF']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mood Tracking</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
            <Ionicons name="add-circle" size={28} color="#4A90E2" />
          </TouchableOpacity>
        </View>

        {/* Mood Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Your Week</Text>
          <View style={styles.summaryContent}>
            <Text style={styles.averageText}>{getWeeklyAverage()}</Text>
            <Text style={styles.averageLabel}>Average Mood</Text>
          </View>
          <View style={styles.moodBar}>
            {moodHistory.slice(0, 7).reverse().map((mood) => {
              const moodData = getMoodEmoji(mood.mood);
              return (
                <View key={mood.id} style={styles.barColumn}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${mood.mood * 20}%`,
                        backgroundColor: moodData?.color || '#999',
                      },
                    ]}
                  />
                </View>
              );
            })}
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Quick Mood Selector */}
          <View style={styles.quickMoodSection}>
            <Text style={styles.sectionTitle}>How are you feeling?</Text>
            <View style={styles.moodGrid}>
              {moodEmojis.map((mood) => (
                <TouchableOpacity
                  key={mood.value}
                  style={styles.moodButton}
                  onPress={() => {
                    setSelectedMood(mood.value);
                    setModalVisible(true);
                  }}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text style={styles.moodLabel}>{mood.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Your Mood History */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Mood History</Text>
            {moodHistory.map((entry) => {
              const moodData = getMoodEmoji(entry.mood);
              return (
                <View key={entry.id} style={styles.moodCard}>
                  <View style={[styles.moodIndicator, { backgroundColor: moodData?.color }]}>
                    <Text style={styles.moodCardEmoji}>{moodData?.emoji}</Text>
                  </View>
                  <View style={styles.moodCardContent}>
                    <Text style={styles.moodCardNote}>{entry.note}</Text>
                    <View style={styles.moodCardMeta}>
                      <Text style={styles.moodCardDate}>{entry.date}</Text>
                      <Text style={styles.moodCardTime}>{entry.time}</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDeleteMood(entry.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF6B9D" />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          {/* Partner's Mood */}
          <View style={styles.section}>
            <View style={styles.partnerHeader}>
              <Text style={styles.sectionTitle}>Alex's Mood</Text>
              <View style={styles.partnerBadge}>
                <Ionicons name="heart" size={16} color="#FF6B9D" />
              </View>
            </View>
            {partnerMoodHistory.map((entry) => {
              const moodData = getMoodEmoji(entry.mood);
              return (
                <TouchableOpacity key={entry.id} style={styles.moodCard}>
                  <View style={[styles.moodIndicator, { backgroundColor: moodData?.color }]}>
                    <Text style={styles.moodCardEmoji}>{moodData?.emoji}</Text>
                  </View>
                  <View style={styles.moodCardContent}>
                    <Text style={styles.moodCardNote}>{entry.note}</Text>
                    <View style={styles.moodCardMeta}>
                      <Text style={styles.moodCardDate}>{entry.date}</Text>
                      <Text style={styles.moodCardTime}>{entry.time}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </LinearGradient>

      {/* Add Mood Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Your Mood</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalMoodSelector}>
              {moodEmojis.map((mood) => (
                <TouchableOpacity
                  key={mood.value}
                  style={[
                    styles.modalMoodOption,
                    selectedMood === mood.value && { backgroundColor: mood.color },
                  ]}
                  onPress={() => setSelectedMood(mood.value)}
                >
                  <Text style={styles.modalMoodEmoji}>{mood.emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedMood && (
              <Text style={styles.selectedMoodText}>
                {getMoodEmoji(selectedMood)?.label}
              </Text>
            )}

            <TextInput
              style={styles.noteInput}
              placeholder="Add a note (optional)"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              value={moodNote}
              onChangeText={setMoodNote}
            />

            <TouchableOpacity
              style={[
                styles.saveMoodButton,
                (!selectedMood || saving) && styles.saveMoodButtonDisabled,
              ]}
              onPress={handleSaveMood}
              disabled={!selectedMood || saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveMoodButtonText}>Save Mood</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    padding: 8,
  },
  summaryCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  summaryContent: {
    alignItems: 'center',
    marginBottom: 16,
  },
  averageText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  averageLabel: {
    fontSize: 14,
    color: '#666',
  },
  moodBar: {
    flexDirection: 'row',
    height: 100,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  barColumn: {
    flex: 1,
    marginHorizontal: 2,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 4,
    position: 'absolute',
    bottom: 0,
  },
  content: {
    flex: 1,
  },
  quickMoodSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  moodGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodButton: {
    width: (width - 80) / 5,
    aspectRatio: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  moodCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  moodIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  moodCardEmoji: {
    fontSize: 24,
  },
  moodCardContent: {
    flex: 1,
  },
  moodCardNote: {
    fontSize: 15,
    color: '#333',
    marginBottom: 6,
  },
  moodCardMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  moodCardDate: {
    fontSize: 13,
    color: '#666',
  },
  moodCardTime: {
    fontSize: 13,
    color: '#999',
  },
  partnerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  partnerBadge: {
    marginLeft: 8,
    backgroundColor: '#FFE5EC',
    padding: 4,
    borderRadius: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    minHeight: 450,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  modalMoodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  modalMoodOption: {
    width: (width - 120) / 5,
    aspectRatio: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalMoodEmoji: {
    fontSize: 36,
  },
  selectedMoodText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  noteInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 24,
    color: '#333',
  },
  saveMoodButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveMoodButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveMoodButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 8,
  },
});
