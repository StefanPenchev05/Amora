import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
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
import { eventService } from '../../src/services/api/events';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  category: string;
  description: string;
}

export default function CalendarScreen() {
  const router = useRouter();
  const theme = lightTheme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [newEventCategory, setNewEventCategory] = useState<'date' | 'fun' | 'milestone' | 'task' | 'activity'>('date');
  const [events, setEvents] = useState<Event[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const apiEvents = await eventService.getAll();
      const mappedEvents = apiEvents.map(e => ({
        id: e.id,
        title: e.title,
        description: e.description,
        date: e.event_date.split('T')[0],
        time: e.event_date.split('T')[1]?.split(':').slice(0, 2).join(':') || '00:00',
        category: e.category,
      }));
      setEvents(mappedEvents);
    } catch (error) {
      Alert.alert('Error', 'Failed to load events');
      console.error('Error loading events:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      date: theme.colors.secondary,
      fun: theme.colors.primary,
      milestone: theme.colors.accent,
      task: theme.colors.warning,
      activity: theme.colors.success,
    };
    return colors[category] || theme.colors.textMuted;
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
    if (!newEventTitle.trim() || !newEventDate.trim()) {
      Alert.alert('Error', 'Please fill in title and date');
      return;
    }

    try {
      setLoading(true);
      const dateTime = `${newEventDate}T${newEventTime || '12:00'}:00Z`;
      await eventService.create({
        title: newEventTitle,
        description: newEventDescription || '',
        category: newEventCategory,
        event_date: dateTime,
      });
      
      await loadEvents();
      setModalVisible(false);
      setNewEventTitle('');
      setNewEventDescription('');
      setNewEventDate('');
      setNewEventTime('');
      setNewEventCategory('date');
    } catch (error) {
      Alert.alert('Error', 'Failed to create event');
      console.error('Error creating event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await eventService.delete(eventId);
      await loadEvents();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete event');
      console.error('Error deleting event:', error);
    }
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

  const weekDays = useMemo(
    () => [
      { key: 'sun', label: 'S' },
      { key: 'mon', label: 'M' },
      { key: 'tue', label: 'T' },
      { key: 'wed', label: 'W' },
      { key: 'thu', label: 'T' },
      { key: 'fri', label: 'F' },
      { key: 'sat', label: 'S' },
    ],
    [],
  );

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const aTime = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
      const bTime = new Date(`${b.date}T${b.time || '00:00'}`).getTime();
      return aTime - bTime;
    });
  }, [events]);

  const categories = useMemo(
    () => [
      { key: 'date' as const, label: 'Date', icon: '🍽️' },
      { key: 'fun' as const, label: 'Fun', icon: '🎬' },
      { key: 'milestone' as const, label: 'Milestone', icon: '💕' },
      { key: 'task' as const, label: 'Task', icon: '🏥' },
      { key: 'activity' as const, label: 'Activity', icon: '💪' },
    ],
    [],
  );

  const headerRight = (
    <IconCircleButton
      icon="add"
      theme={theme}
      onPress={() => setModalVisible(true)}
    />
  );

  return (
    <Screen scroll theme={theme} contentStyle={styles.screenContent}>
      <AppHeader
        title="Calendar"
        subtitle="Plan moments together"
        onBack={() => router.back()}
        right={headerRight}
        theme={theme}
      />

      <Card theme={theme} style={styles.card}>
        <View style={styles.monthRow}>
          <IconCircleButton icon="chevron-back" theme={theme} onPress={() => changeMonth(-1)} />
          <Text style={styles.monthText}>{getMonthName(currentDate)}</Text>
          <IconCircleButton icon="chevron-forward" theme={theme} onPress={() => changeMonth(1)} />
        </View>
      </Card>

      <Card theme={theme} style={styles.card}>
        <View style={styles.calendarGrid}>
          {weekDays.map((day) => (
            <Text key={day.key} style={styles.weekDay}>
              {day.label}
            </Text>
          ))}

          {(() => {
            const firstDayOfMonth = getFirstDayOfMonth(currentDate);
            const prevMonthLastDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
            const prevMonthLastDay = prevMonthLastDate.getDate();

            return Array.from({ length: firstDayOfMonth }, (_, offset) => {
              const dayInPrevMonth = prevMonthLastDay - firstDayOfMonth + offset + 1;
              const key = `${prevMonthLastDate.getFullYear()}-${String(prevMonthLastDate.getMonth() + 1).padStart(2, '0')}-${String(dayInPrevMonth).padStart(2, '0')}`;
              return <View key={key} style={styles.dayCellMuted} />;
            });
          })()}

          {Array.from({ length: getDaysInMonth(currentDate) }, (_, i) => {
            const day = i + 1;
            const dayEvents = getEventsForDay(day);
            const today = isToday(day);
            return (
              <Pressable
                key={day}
                onPress={() => handleDateSelect(day)}
                style={({ pressed }) => [styles.dayCell, today && styles.today, pressed && styles.pressed]}
              >
                <Text style={[styles.dayNumber, today && styles.todayText]}>{day}</Text>
                {dayEvents.length > 0 ? (
                  <View style={styles.dotsRow}>
                    {dayEvents.slice(0, 3).map((event) => (
                      <View
                        key={event.id}
                        style={[styles.dot, { backgroundColor: getCategoryColor(event.category) }]}
                      />
                    ))}
                  </View>
                ) : (
                  <View style={{ height: 6 }} />
                )}
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card theme={theme} style={styles.card}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Upcoming</Text>
          <Text style={styles.sectionMeta}>{sortedEvents.length}</Text>
        </View>

        {sortedEvents.length === 0 ? (
          <Text style={styles.emptyText}>No upcoming events. Add one to get started.</Text>
        ) : (
          <View>
            {sortedEvents.map((event, index) => (
              <View key={event.id} style={[styles.eventRow, index !== 0 && { marginTop: theme.spacing[3] }]}>
                <View style={[styles.eventIndicator, { backgroundColor: getCategoryColor(event.category) }]} />
                <View style={styles.eventBody}>
                  <View style={styles.eventTopRow}>
                    <View style={styles.eventEmojiWrap}>
                      <Text style={styles.eventEmoji}>{getCategoryIcon(event.category)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.eventTitle} numberOfLines={1}>
                        {event.title}
                      </Text>
                      {event.description ? (
                        <Text style={styles.eventDesc} numberOfLines={1}>
                          {event.description}
                        </Text>
                      ) : null}
                    </View>
                    <Pressable
                      onPress={() => handleDeleteEvent(event.id)}
                      hitSlop={10}
                      style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
                    >
                      <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
                    </Pressable>
                  </View>

                  <View style={styles.eventMetaRow}>
                    <Ionicons name="calendar-outline" size={14} color={theme.colors.textMuted} />
                    <Text style={styles.eventMetaText}>{formatDate(event.date)}</Text>
                    <View style={{ width: theme.spacing[3] }} />
                    <Ionicons name="time-outline" size={14} color={theme.colors.textMuted} />
                    <Text style={styles.eventMetaText}>{event.time}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </Card>

      {/* Add Event Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>New event</Text>
              <Pressable onPress={() => setModalVisible(false)} hitSlop={10}>
                <Ionicons name="close" size={26} color={theme.colors.textMuted} />
              </Pressable>
            </View>

            <TextInput
              style={styles.inputTitle}
              placeholder="Event title"
              placeholderTextColor={theme.colors.textMuted}
              value={newEventTitle}
              onChangeText={setNewEventTitle}
            />

            <TextInput
              style={styles.inputBody}
              placeholder="Description (optional)"
              placeholderTextColor={theme.colors.textMuted}
              value={newEventDescription}
              onChangeText={setNewEventDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <View style={styles.row}>
              <TextInput
                style={[styles.inputInline, { flex: 1, marginRight: theme.spacing[3] }]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.colors.textMuted}
                value={newEventDate}
                onChangeText={setNewEventDate}
              />
              <TextInput
                style={[styles.inputInline, { width: 110 }]}
                placeholder="HH:MM"
                placeholderTextColor={theme.colors.textMuted}
                value={newEventTime}
                onChangeText={setNewEventTime}
              />
            </View>

            <View style={styles.modalCategorySection}>
              <Text style={styles.modalCategoryLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modalChipRow}>
                {categories.map((cat) => {
                  const active = newEventCategory === cat.key;
                  const tint = getCategoryColor(cat.key);
                  return (
                    <Pressable
                      key={cat.key}
                      onPress={() => setNewEventCategory(cat.key)}
                      style={({ pressed }) => [
                        styles.modalChip,
                        {
                          borderColor: active ? withOpacity(tint, 0.4) : theme.colors.border,
                          backgroundColor: active ? withOpacity(tint, 0.14) : withOpacity(theme.colors.surface, 0.7),
                        },
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={styles.modalChipEmoji}>{cat.icon}</Text>
                      <Text style={[styles.modalChipText, { color: active ? theme.colors.textPrimary : theme.colors.textMuted }]}>
                        {cat.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <Pressable
              onPress={handleAddEvent}
              disabled={!newEventTitle.trim() || !newEventDate.trim() || loading}
              style={({ pressed }) => [
                styles.primaryBtn,
                (!newEventTitle.trim() || !newEventDate.trim() || loading) && styles.primaryBtnDisabled,
                pressed && styles.pressed,
              ]}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.onPrimary} />
              ) : (
                <Text style={styles.primaryBtnText}>Add event</Text>
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
    screenContent: {
      paddingTop: theme.spacing[4],
    },
    card: {
      marginTop: theme.spacing[4],
    },
    pressed: {
      opacity: 0.92,
      transform: [{ scale: 0.99 }],
    },
    monthRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    monthText: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.textPrimary,
    },
    calendarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    weekDay: {
      width: `${100 / 7}%`,
      textAlign: 'center',
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.textMuted,
      marginBottom: theme.spacing[2],
    },
    dayCellMuted: {
      width: `${100 / 7}%`,
      aspectRatio: 1,
      borderRadius: 16,
      backgroundColor: withOpacity(theme.colors.surface, 0.3),
      marginVertical: 2,
    },
    dayCell: {
      width: `${100 / 7}%`,
      aspectRatio: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 16,
      marginVertical: 2,
      borderWidth: 1,
      borderColor: withOpacity(theme.colors.border, 0.7),
      backgroundColor: theme.colors.background,
    },
    today: {
      borderColor: withOpacity(theme.colors.primary, 0.45),
      backgroundColor: withOpacity(theme.colors.primary, 0.1),
    },
    dayNumber: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.textPrimary,
    },
    todayText: {
      color: theme.colors.primary,
      fontFamily: theme.typography.fontFamily.bold,
    },
    dotsRow: {
      flexDirection: 'row',
      marginTop: 6,
      height: 6,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3,
    },
    dot: {
      width: 5,
      height: 5,
      borderRadius: 3,
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
    sectionMeta: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textMuted,
    },
    emptyText: {
      paddingVertical: theme.spacing[4],
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textMuted,
    },
    eventRow: {
      flexDirection: 'row',
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
      overflow: 'hidden',
    },
    eventIndicator: {
      width: 5,
    },
    eventBody: {
      flex: 1,
      padding: theme.spacing[4],
    },
    eventTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[3],
    },
    eventEmojiWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: withOpacity(theme.colors.primary, 0.06),
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: withOpacity(theme.colors.border, 0.8),
    },
    eventEmoji: {
      fontSize: 18,
    },
    eventTitle: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.textPrimary,
    },
    eventDesc: {
      marginTop: 2,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textMuted,
    },
    eventMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing[3],
    },
    eventMetaText: {
      marginLeft: 6,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textMuted,
    },
    iconBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: withOpacity('#000000', 0.45),
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.radius.xl,
      borderTopRightRadius: theme.radius.xl,
      padding: theme.spacing[5],
      ...theme.shadow.sm,
    },
    sheetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing[4],
    },
    sheetTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.textPrimary,
    },
    inputTitle: {
      height: 48,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing[4],
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing[3],
    },
    inputBody: {
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing[4],
      paddingTop: theme.spacing[3],
      paddingBottom: theme.spacing[3],
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textPrimary,
      minHeight: 84,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing[3],
    },
    inputInline: {
      height: 48,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing[4],
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textPrimary,
    },
    modalCategorySection: {
      marginTop: theme.spacing[4],
    },
    modalCategoryLabel: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing[3],
    },
    modalChipRow: {
      paddingRight: theme.spacing[2],
    },
    modalChip: {
      height: 38,
      borderRadius: 19,
      paddingHorizontal: theme.spacing[4],
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[2],
      marginRight: theme.spacing[3],
    },
    modalChipEmoji: {
      fontSize: 16,
    },
    modalChipText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
    },
    primaryBtn: {
      marginTop: theme.spacing[5],
      height: 48,
      borderRadius: theme.radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
    },
    primaryBtnDisabled: {
      backgroundColor: withOpacity(theme.colors.primary, 0.45),
    },
    primaryBtnText: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.onPrimary,
    },
  });
