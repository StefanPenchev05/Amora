import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  category: string;
  icon: string;
}

export default function CalendarScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [newEventCategory, setNewEventCategory] = useState<'date' | 'fun' | 'milestone' | 'task' | 'activity'>('date');
  const [events, setEvents] = useState<Event[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const stored = await AsyncStorage.getItem('events');
      if (stored) {
        setEvents(JSON.parse(stored));
      } else {
        // Initialize with mock data
        const mockEvents = [
          { id: 1, title: 'Date Night', date: '2026-01-15', time: '19:00', category: 'date', icon: '🍽️' },
          { id: 2, title: 'Movie Marathon', date: '2026-01-16', time: '17:00', category: 'fun', icon: '🎬' },
          { id: 3, title: 'Anniversary', date: '2026-02-14', time: '00:00', category: 'milestone', icon: '💕' },
          { id: 4, title: 'Doctor Appointment', date: '2026-01-20', time: '10:00', category: 'task', icon: '🏥' },
          { id: 5, title: 'Gym Together', date: '2026-01-17', time: '07:00', category: 'activity', icon: '💪' },
          { id: 6, title: 'Cook Together', date: '2026-01-18', time: '18:00', category: 'date', icon: '👨‍🍳' },
        ];
        setEvents(mockEvents);
        await AsyncStorage.setItem('events', JSON.stringify(mockEvents));
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const saveEvents = async (newEvents: Event[]) => {
    try {
      await AsyncStorage.setItem('events', JSON.stringify(newEvents));
      setEvents(newEvents);
    } catch (error) {
      console.error('Error saving events:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      date: '#FF6B9D',
      fun: '#4A90E2',
      milestone: '#9D6BFF',
      task: '#FFB347',
      activity: '#50C878',
    };
    return colors[category] || '#999';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      date: '🍽️',
      fun: '🎬',
      milestone: '💕',
      task: '🏥',
      activity: '💪',
    };
    return icons[category] || '📅';
  };

  const handleAddEvent = async () => {
    if (newEventTitle.trim() && newEventDate.trim()) {
      const newEvent: Event = {
        id: Date.now(),
        title: newEventTitle,
        date: newEventDate,
        time: newEventTime || '12:00',
        category: newEventCategory,
        icon: getCategoryIcon(newEventCategory),
      };
      await saveEvents([...events, newEvent]);
      setModalVisible(false);
      setNewEventTitle('');
      setNewEventDate('');
      setNewEventTime('');
      setNewEventCategory('date');
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    const updatedEvents = events.filter(e => e.id !== eventId);
    await saveEvents(updatedEvents);
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const changeMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };

  const handleDateSelect = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setNewEventDate(dateStr);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#E5F3FF', '#FFF0F5', '#FFFFFF']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Calendar</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
            <Ionicons name="add-circle" size={28} color="#FF6B9D" />
          </TouchableOpacity>
        </View>

        {/* Month Selector */}
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={() => changeMonth(-1)}>
            <Ionicons name="chevron-back" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.monthText}>{getMonthName(currentDate)}</Text>
          <TouchableOpacity onPress={() => changeMonth(1)}>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <Text key={index} style={styles.weekDay}>{day}</Text>
          ))}
          {/* Empty cells for days before month starts */}
          {[...Array(getFirstDayOfMonth(currentDate))].map((_, i) => (
            <View key={`empty-${i}`} style={styles.dayCell} />
          ))}
          {/* Actual days of the month */}
          {[...Array(getDaysInMonth(currentDate))].map((_, i) => {
            const day = i + 1;
            const dayEvents = getEventsForDay(day);
            return (
              <TouchableOpacity 
                key={day} 
                style={[
                  styles.dayCell,
                  isToday(day) && styles.today,
                ]}
                onPress={() => handleDateSelect(day)}
              >
                <Text style={[
                  styles.dayNumber,
                  isToday(day) && styles.todayText,
                ]}>{day}</Text>
                {dayEvents.length > 0 && (
                  <View style={styles.eventDotsContainer}>
                    {dayEvents.slice(0, 3).map((event, idx) => (
                      <View 
                        key={idx} 
                        style={[styles.eventDot, { backgroundColor: getCategoryColor(event.category) }]} 
                      />
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Events List */}
        <ScrollView style={styles.eventsList} showsVerticalScrollIndicator={false}>
          <Text style={styles.eventsTitle}>Upcoming Events</Text>
          {events
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((event) => (
            <TouchableOpacity key={event.id} style={styles.eventCard}>
              <View style={[styles.eventIndicator, { backgroundColor: getCategoryColor(event.category) }]} />
              <View style={styles.eventContent}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventEmoji}>{event.icon}</Text>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                </View>
                <View style={styles.eventDetails}>
                  <Ionicons name="calendar-outline" size={14} color="#666" />
                  <Text style={styles.eventDate}>{formatDate(event.date)}</Text>
                  <Ionicons name="time-outline" size={14} color="#666" style={{ marginLeft: 12 }} />
                  <Text style={styles.eventTime}>{event.time}</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.eventOptions}
                onPress={() => handleDeleteEvent(event.id)}
              >
                <Ionicons name="trash-outline" size={20} color="#FF6B9D" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>
      </LinearGradient>

      {/* Add Event Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Event</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Event title"
              placeholderTextColor="#999"
              value={newEventTitle}
              onChangeText={setNewEventTitle}
            />

            <TextInput
              style={styles.input}
              placeholder="Date (YYYY-MM-DD)"
              placeholderTextColor="#999"
              value={newEventDate}
              onChangeText={setNewEventDate}
            />

            <TextInput
              style={styles.input}
              placeholder="Time (HH:MM)"
              placeholderTextColor="#999"
              value={newEventTime}
              onChangeText={setNewEventTime}
            />

            <View style={styles.categorySelector}>
              <Text style={styles.categoryLabel}>Category:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
                {[
                  { key: 'date', label: 'Date', icon: '🍽️' },
                  { key: 'fun', label: 'Fun', icon: '🎬' },
                  { key: 'milestone', label: 'Milestone', icon: '💕' },
                  { key: 'task', label: 'Task', icon: '🏥' },
                  { key: 'activity', label: 'Activity', icon: '💪' },
                ].map((cat) => (
                  <TouchableOpacity
                    key={cat.key}
                    style={[
                      styles.categoryChip, 
                      { backgroundColor: getCategoryColor(cat.key) },
                      newEventCategory === cat.key && styles.categoryChipSelected,
                    ]}
                    onPress={() => setNewEventCategory(cat.key as any)}
                  >
                    <Text style={styles.categoryIcon}>{cat.icon}</Text>
                    <Text style={styles.categoryChipText}>{cat.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity 
              style={[styles.addEventButton, (!newEventTitle.trim() || !newEventDate.trim()) && styles.addEventButtonDisabled]} 
              onPress={handleAddEvent}
              disabled={!newEventTitle.trim() || !newEventDate.trim()}
            >
              <Text style={styles.addEventButtonText}>Add Event</Text>
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
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  weekDay: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  today: {
    backgroundColor: '#FF6B9D',
    borderRadius: 20,
  },
  dayNumber: {
    fontSize: 14,
    color: '#333',
  },
  todayText: {
    color: 'white',
    fontWeight: 'bold',
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: 8,
  },
  eventsList: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  eventsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  eventIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 12,
  },
  eventContent: {
    flex: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  eventDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  eventTime: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  eventOptions: {
    padding: 8,
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
    minHeight: 400,
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
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    color: '#333',
  },
  categorySelector: {
    marginBottom: 24,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  categoriesScroll: {
    flexGrow: 0,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryChipSelected: {
    borderWidth: 3,
    borderColor: '#333',
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  categoryChipText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  eventDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 2,
  },
  addEventButton: {
    backgroundColor: '#FF6B9D',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  addEventButtonDisabled: {
    backgroundColor: '#CCC',
  },
  addEventButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
