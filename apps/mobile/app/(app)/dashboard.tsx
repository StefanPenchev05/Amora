import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();

  const mockPartner = {
    name: 'Alex',
    mood: '😊',
    lastSeen: '2 hours ago',
  };

  const upcomingEvents = [
    { id: 1, title: 'Date Night', date: 'Tonight 7:00 PM', icon: '🍽️' },
    { id: 2, title: 'Movie Marathon', date: 'Tomorrow 5:00 PM', icon: '🎬' },
    { id: 3, title: 'Anniversary', date: 'Feb 14', icon: '💕' },
  ];

  const recentMemories = [
    { id: 1, title: 'Beach Day', date: 'Last Sunday', emoji: '🏖️' },
    { id: 2, title: 'First Kiss', date: 'Jan 1, 2025', emoji: '💋' },
    { id: 3, title: 'Coffee Date', date: 'Yesterday', emoji: '☕' },
  ];

  return (
    <LinearGradient
      colors={['#FFE5E5', '#FFF0F5', '#FFFFFF']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, Sarah! 👋</Text>
            <Text style={styles.subtitle}>Welcome back to your space</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/(app)/profile')}>
            <Ionicons name="person-circle-outline" size={40} color="#FF6B9D" />
          </TouchableOpacity>
        </View>

        {/* Partner Status Card */}
        <TouchableOpacity style={styles.partnerCard} activeOpacity={0.9}>
          <View style={styles.partnerInfo}>
            <View style={styles.partnerAvatar}>
              <Text style={styles.partnerAvatarText}>A</Text>
            </View>
            <View>
              <Text style={styles.partnerName}>{mockPartner.name}</Text>
              <Text style={styles.partnerStatus}>is feeling {mockPartner.mood}</Text>
            </View>
          </View>
          <Text style={styles.lastSeen}>{mockPartner.lastSeen}</Text>
        </TouchableOpacity>

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
          {upcomingEvents.map((event) => (
            <TouchableOpacity key={event.id} style={styles.eventCard}>
              <Text style={styles.eventEmoji}>{event.icon}</Text>
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventDate}>{event.date}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
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
            {recentMemories.map((memory) => (
              <TouchableOpacity key={memory.id} style={styles.memoryCard}>
                <Text style={styles.memoryEmoji}>{memory.emoji}</Text>
                <Text style={styles.memoryTitle}>{memory.title}</Text>
                <Text style={styles.memoryDate}>{memory.date}</Text>
              </TouchableOpacity>
            ))}
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
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  profileButton: {
    padding: 4,
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
