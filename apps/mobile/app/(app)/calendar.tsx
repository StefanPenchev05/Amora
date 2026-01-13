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
import { useTheme } from '../../src/providers/theme';
import { eventService } from '../../src/services/api/events';
import { relationshipService, type RelationshipStatusResponse } from '../../src/services/api/relationship';

interface Event {
  id: string;
  user_id: string;
  title: string;
  date: string;
  time: string;
  endTime?: string;
  allDay: boolean;
  location?: string;
  category: string;
  description: string;
}

export default function CalendarScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [relationship, setRelationship] = useState<RelationshipStatusResponse | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [newEventEndTime, setNewEventEndTime] = useState('');
  const [newEventAllDay, setNewEventAllDay] = useState(false);
  const [newEventLocation, setNewEventLocation] = useState('');
  const [newEventCategory, setNewEventCategory] = useState<'date' | 'fun' | 'milestone' | 'task' | 'activity'>('date');
  const [events, setEvents] = useState<Event[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [ownerFilter, setOwnerFilter] = useState<'all' | 'you' | 'partner'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'date' | 'fun' | 'milestone' | 'task' | 'activity'>('all');

  useEffect(() => {
    loadEvents();
    void loadRelationship();
  }, []);

  const loadRelationship = async () => {
    try {
      const status = await relationshipService.getStatus();
      setRelationship(status);
    } catch {
      setRelationship(null);
    }
  };

  const loadEvents = async () => {
    try {
      const apiEvents = await eventService.getAll();
      const mappedEvents = apiEvents.map(e => ({
        id: e.id,
        user_id: e.user_id,
        title: e.title,
        description: e.description,
        date: e.event_date.split('T')[0],
        time: e.event_date.split('T')[1]?.split(':').slice(0, 2).join(':') || '00:00',
        endTime: e.end_date ? e.end_date.split('T')[1]?.split(':').slice(0, 2).join(':') || undefined : undefined,
        allDay: Boolean(e.all_day),
        location: e.location || undefined,
        category: e.category,
      }));
      setEvents(mappedEvents);
    } catch (error) {
      Alert.alert('Error', 'Failed to load events');
      console.error('Error loading events:', error);
    }
  };

  const partnerConnected = relationship?.status === 'active';
  const partnerName = relationship?.partner?.full_name || relationship?.partner?.username || 'Partner';
  const partnerUserId = relationship?.partner?.user_id;
  const isPartnerItem = (userId: string) => !!(partnerConnected && partnerUserId && userId === partnerUserId);
  const ownerLabel = (userId: string) => (isPartnerItem(userId) ? partnerName : 'You');

  const formatTimeLabel = (event: Event) => {
    if (event.allDay) return 'All day';
    if (event.endTime) return `${event.time}–${event.endTime}`;
    return event.time;
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

    if (!newEventAllDay) {
      const start = newEventTime.trim();
      const end = newEventEndTime.trim();
      if (start && !/^\d{2}:\d{2}$/.test(start)) {
        Alert.alert('Error', 'Start time must be HH:MM');
        return;
      }
      if (end && !/^\d{2}:\d{2}$/.test(end)) {
        Alert.alert('Error', 'End time must be HH:MM');
        return;
      }
    }

    try {
      setLoading(true);
      const dateTime = newEventAllDay
        ? `${newEventDate}T00:00:00Z`
        : `${newEventDate}T${newEventTime || '12:00'}:00Z`;

      const endDateTime = !newEventAllDay && newEventEndTime
        ? `${newEventDate}T${newEventEndTime}:00Z`
        : null;

      await eventService.create({
        title: newEventTitle,
        description: newEventDescription || '',
        category: newEventCategory,
        event_date: dateTime,
        end_date: endDateTime,
        all_day: newEventAllDay,
        location: newEventLocation || undefined,
      });
      
      await loadEvents();
      setModalVisible(false);
      setNewEventTitle('');
      setNewEventDescription('');
      setNewEventDate('');
      setNewEventTime('');
      setNewEventEndTime('');
      setNewEventAllDay(false);
      setNewEventLocation('');
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
    setSelectedDate(dateStr);
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

  const filteredEvents = useMemo(() => {
    return sortedEvents.filter((e) => {
      if (ownerFilter === 'partner' && !isPartnerItem(e.user_id)) return false;
      if (ownerFilter === 'you' && isPartnerItem(e.user_id)) return false;
      if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
      return true;
    });
  }, [sortedEvents, ownerFilter, categoryFilter]);

  const upcomingEvents = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return filteredEvents.filter((e) => new Date(`${e.date}T${e.time || '00:00'}`) >= todayStart);
  }, [filteredEvents]);

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
    <Screen scroll contentStyle={styles.screenContent}>
      <AppHeader
        title="Calendar"
        subtitle="Plan moments together"
        onBack={() => router.replace('/(app)/dashboard')}
        right={headerRight}
        theme={theme}
      />

      <Card theme={theme} style={styles.card}>
        <View style={styles.monthRow}>
          <View style={styles.monthNavLeft}>
            <IconCircleButton icon="chevron-back" theme={theme} onPress={() => changeMonth(-1)} />
          </View>
          <Text style={styles.monthText}>{getMonthName(currentDate)}</Text>
          <View style={styles.monthNavRight}>
            <IconCircleButton icon="chevron-forward" theme={theme} onPress={() => changeMonth(1)} />
          </View>
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
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const selected = selectedDate === dateStr;
            return (
              <Pressable
                key={day}
                onPress={() => handleDateSelect(day)}
                style={({ pressed }) => [
                  styles.dayCell,
                  today && styles.today,
                  selected && styles.selectedDay,
                  pressed && styles.pressed,
                ]}
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
          <Text style={styles.sectionMeta}>{upcomingEvents.length}</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {([
            { key: 'all' as const, label: 'All' },
            { key: 'you' as const, label: 'You' },
            { key: 'partner' as const, label: partnerConnected ? partnerName : 'Partner' },
          ]).map((opt) => {
            const active = ownerFilter === opt.key;
            return (
              <Pressable
                key={opt.key}
                onPress={() => setOwnerFilter(opt.key)}
                style={({ pressed }) => [
                  styles.filterChip,
                  {
                    backgroundColor: active ? withOpacity(theme.colors.primary, 0.12) : withOpacity(theme.colors.surface, 0.7),
                    borderColor: active ? withOpacity(theme.colors.primary, 0.28) : theme.colors.border,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.filterChipText, { color: active ? theme.colors.textPrimary : theme.colors.textMuted }]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}

          {([
            { key: 'all' as const, label: 'Any' },
            { key: 'date' as const, label: 'Date' },
            { key: 'fun' as const, label: 'Fun' },
            { key: 'milestone' as const, label: 'Milestone' },
            { key: 'task' as const, label: 'Task' },
            { key: 'activity' as const, label: 'Activity' },
          ]).map((opt) => {
            const active = categoryFilter === opt.key;
            return (
              <Pressable
                key={opt.key}
                onPress={() => setCategoryFilter(opt.key)}
                style={({ pressed }) => [
                  styles.filterChip,
                  {
                    backgroundColor: active ? withOpacity(theme.colors.accent, 0.12) : withOpacity(theme.colors.surface, 0.7),
                    borderColor: active ? withOpacity(theme.colors.accent, 0.28) : theme.colors.border,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.filterChipText, { color: active ? theme.colors.textPrimary : theme.colors.textMuted }]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {upcomingEvents.length === 0 ? (
          <Text style={styles.emptyText}>No upcoming events. Add one to get started.</Text>
        ) : (
          <View>
            {upcomingEvents.map((event, index) => (
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
                    {isPartnerItem(event.user_id) ? null : (
                      <Pressable
                        onPress={() => handleDeleteEvent(event.id)}
                        hitSlop={10}
                        style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
                      >
                        <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
                      </Pressable>
                    )}
                  </View>

                  <View style={styles.eventMetaRow}>
                    <Ionicons name="calendar-outline" size={14} color={theme.colors.textMuted} />
                    <Text style={styles.eventMetaText}>{formatDate(event.date)}</Text>
                    <View style={{ width: theme.spacing[3] }} />
                    <Ionicons name="time-outline" size={14} color={theme.colors.textMuted} />
                    <Text style={styles.eventMetaText}>
                      {formatTimeLabel(event)}
                    </Text>

                    {event.location ? (
                      <>
                        <View style={{ width: theme.spacing[3] }} />
                        <Ionicons name="location-outline" size={14} color={theme.colors.textMuted} />
                        <Text style={styles.eventMetaText} numberOfLines={1}>
                          {event.location}
                        </Text>
                      </>
                    ) : null}

                    <View style={{ width: theme.spacing[3] }} />
                    <View
                      style={[
                        styles.ownerPill,
                        {
                          backgroundColor: isPartnerItem(event.user_id)
                            ? withOpacity(theme.colors.accent, 0.12)
                            : withOpacity(theme.colors.primary, 0.12),
                          borderColor: isPartnerItem(event.user_id)
                            ? withOpacity(theme.colors.accent, 0.22)
                            : withOpacity(theme.colors.primary, 0.2),
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.ownerPillText,
                          { color: isPartnerItem(event.user_id) ? theme.colors.accent : theme.colors.primary },
                        ]}
                      >
                        {ownerLabel(event.user_id)}
                      </Text>
                    </View>
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
                placeholder={newEventAllDay ? 'All day' : 'Start'}
                placeholderTextColor={theme.colors.textMuted}
                value={newEventTime}
                onChangeText={setNewEventTime}
                editable={!newEventAllDay}
              />
            </View>

            <View style={styles.row}>
              <TextInput
                style={[styles.inputInline, { flex: 1, marginRight: theme.spacing[3] }]}
                placeholder="Location (optional)"
                placeholderTextColor={theme.colors.textMuted}
                value={newEventLocation}
                onChangeText={setNewEventLocation}
              />
              <TextInput
                style={[styles.inputInline, { width: 110 }]}
                placeholder={newEventAllDay ? '' : 'End'}
                placeholderTextColor={theme.colors.textMuted}
                value={newEventEndTime}
                onChangeText={setNewEventEndTime}
                editable={!newEventAllDay}
              />
            </View>

            <View style={[styles.row, { justifyContent: 'flex-start', gap: theme.spacing[3] }]}>
              <Pressable
                onPress={() => setNewEventAllDay((v) => !v)}
                style={({ pressed }) => [
                  styles.filterChip,
                  {
                    backgroundColor: newEventAllDay ? withOpacity(theme.colors.primary, 0.12) : withOpacity(theme.colors.surface, 0.7),
                    borderColor: newEventAllDay ? withOpacity(theme.colors.primary, 0.28) : theme.colors.border,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.filterChipText, { color: newEventAllDay ? theme.colors.textPrimary : theme.colors.textMuted }]}>All day</Text>
              </Pressable>

              <Text style={styles.helperText}>Time fields are optional</Text>
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
      justifyContent: 'center',
      position: 'relative',
      minHeight: 40,
    },
    monthNavLeft: {
      position: 'absolute',
      left: 0,
    },
    monthNavRight: {
      position: 'absolute',
      right: 0,
    },
    monthText: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.textPrimary,
    },
    calendarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    weekDay: {
      flexBasis: '14.2857%',
      maxWidth: '14.2857%',
      textAlign: 'center',
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.textMuted,
      marginBottom: theme.spacing[2],
    },
    dayCellMuted: {
      flexBasis: '14.2857%',
      maxWidth: '14.2857%',
      aspectRatio: 1,
      borderRadius: 16,
      backgroundColor: withOpacity(theme.colors.surface, 0.3),
      margin: 2,
    },
    dayCell: {
      flexBasis: '14.2857%',
      maxWidth: '14.2857%',
      aspectRatio: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 16,
      margin: 2,
      borderWidth: 1,
      borderColor: withOpacity(theme.colors.border, 0.7),
      backgroundColor: theme.colors.background,
    },
    today: {
      borderColor: withOpacity(theme.colors.primary, 0.45),
      backgroundColor: withOpacity(theme.colors.primary, 0.1),
    },
    selectedDay: {
      borderColor: withOpacity(theme.colors.accent, 0.5),
      backgroundColor: withOpacity(theme.colors.accent, 0.12),
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
    },
    dot: {
      width: 5,
      height: 5,
      borderRadius: 3,
      marginHorizontal: 1.5,
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
    filterRow: {
      paddingBottom: theme.spacing[3],
      paddingRight: theme.spacing[2],
      gap: theme.spacing[2],
    },
    filterChip: {
      height: 32,
      borderRadius: 16,
      paddingHorizontal: theme.spacing[4],
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: withOpacity(theme.colors.surface, 0.7),
    },
    filterChipText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.textMuted,
    },
    helperText: {
      fontSize: theme.typography.fontSize.xs,
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
    ownerPill: {
      paddingHorizontal: theme.spacing[3],
      height: 24,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      marginLeft: theme.spacing[2],
    },
    ownerPillText: {
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.medium,
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
