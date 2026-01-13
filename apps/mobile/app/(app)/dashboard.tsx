import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { authService } from '../../src/services/api/auth';
import { eventService, type Event } from '../../src/services/api/events';
import { memoryService, type Memory } from '../../src/services/api/memories';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();

  const [userName, setUserName] = useState<string>('');
  const [loadingUser, setLoadingUser] = useState(true);

  const [events, setEvents] = useState<Event[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadUser = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (cancelled) return;

        const displayName =
          [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
          user?.username ||
          '';
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

  useEffect(() => {
    let cancelled = false;
    const loadDashboardData = async () => {
      try {
        const [eventsRes, memoriesRes] = await Promise.all([
          eventService.getAll(),
          memoryService.getAll(),
        ]);

        if (cancelled) return;

        const sortedEvents = [...eventsRes].sort((a, b) => a.event_date.localeCompare(b.event_date));
        const sortedMemories = [...memoriesRes].sort((a, b) => b.memory_date.localeCompare(a.memory_date));

        setEvents(sortedEvents.slice(0, 3));
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

  const formatShortDateTime = (iso: string): string => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleString();
  };

  const formatShortDate = (iso: string): string => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleDateString();
  };

  const renderEvents = () => {
    if (loadingData) {
      return (
        <View style={styles.sectionLoadingRow}>
          <ActivityIndicator size="small" color="#FF6B9D" />
          <Text style={styles.sectionLoadingText}>Loading events...</Text>
        </View>
      );
    }

    if (events.length === 0) {
      return <Text style={styles.emptyText}>No upcoming events yet.</Text>;
    }

    return events.map((event) => (
      <TouchableOpacity
        key={event.id}
        style={styles.eventCard}
        onPress={() => router.push('/(app)/calendar')}
      >
        <Text style={styles.eventEmoji}>📅</Text>
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventDate}>{formatShortDateTime(event.event_date)}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </TouchableOpacity>
    ));
  };

  const renderMemories = () => {
    if (loadingData) {
      return (
        <View style={styles.sectionLoadingRow}>
          <ActivityIndicator size="small" color="#FF6B9D" />
          <Text style={styles.sectionLoadingText}>Loading memories...</Text>
        </View>
      );
    }

    if (memories.length === 0) {
      return <Text style={styles.emptyText}>No memories yet.</Text>;
    }

    return memories.map((memory) => (
      <TouchableOpacity
        key={memory.id}
        style={styles.memoryCard}
        onPress={() => router.push('/(app)/memories')}
      >
        <Text style={styles.memoryEmoji}>💖</Text>
        <Text style={styles.memoryTitle} numberOfLines={1}>{memory.title}</Text>
        <Text style={styles.memoryDate}>{formatShortDate(memory.memory_date)}</Text>
      </TouchableOpacity>
    ));
  };

  return (
    <LinearGradient
      colors={['#FFE5E5', '#FFF0F5', '#FFFFFF']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            {loadingUser ? (
              <View style={styles.greetingRow}>
                <ActivityIndicator size="small" color="#FF6B9D" />
                <Text style={styles.greetingLoadingText}>Loading...</Text>
              </View>
            ) : (
              <Text style={styles.greeting}>
                {userName ? `Hello, ${userName}! 👋` : 'Hello! 👋'}
              </Text>
            )}
            <Text style={styles.subtitle}>Welcome back to your space</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/(app)/profile')}>
            <Ionicons name="person-circle-outline" size={40} color="#FF6B9D" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: '#FFE5EC' }]}
              onPress={() => router.push('/(app)/calendar')}
            >
              <Ionicons name="calendar" size={28} color="#FF6B9D" />
              <Text style={styles.actionText}>Calendar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: '#E5F3FF' }]}
              onPress={() => router.push('/(app)/mood')}
            >
              <Ionicons name="happy" size={28} color="#4A90E2" />
              <Text style={styles.actionText}>Mood</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: '#FFF5E5' }]}
              onPress={() => router.push('/(app)/notes')}
            >
              <Ionicons name="heart" size={28} color="#FFB347" />
              <Text style={styles.actionText}>Notes</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: '#F0E5FF' }]}
              onPress={() => router.push('/(app)/memories')}
            >
              <Ionicons name="images" size={28} color="#9D6BFF" />
              <Text style={styles.actionText}>Memories</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: '#E5FFEE' }]}
              onPress={() => router.push('/(app)/expenses')}
            >
              <Ionicons name="wallet" size={28} color="#50C878" />
              <Text style={styles.actionText}>Expenses</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Upcoming Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/calendar')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          {renderEvents()}
        </View>

        {/* Recent Memories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Memories</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/memories')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {renderMemories()}
          </ScrollView>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingLoadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginLeft: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  profileButton: {
    padding: 4,
  },
  sectionLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  sectionLoadingText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginLeft: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    paddingVertical: 12,
  },
  partnerCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 24,
  },
  partnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  partnerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF6B9D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  partnerAvatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  partnerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  partnerStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  lastSeen: {
    fontSize: 12,
    color: '#999',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  viewAll: {
    fontSize: 14,
    color: '#FF6B9D',
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - 60) / 2,
    aspectRatio: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  eventEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  memoryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  memoryEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  memoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  memoryDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});
