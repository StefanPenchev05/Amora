import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const imageSize = (width - 48) / 2;

interface Memory {
  id: number;
  title: string;
  description: string;
  date: string;
  emoji: string;
  category: string;
}

export default function MemoriesScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [memoryTitle, setMemoryTitle] = useState('');
  const [memoryDescription, setMemoryDescription] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadMemories();
  }, []);

  const loadMemories = async () => {
    try {
      const stored = await AsyncStorage.getItem('memories');
      if (stored) {
        setMemories(JSON.parse(stored));
      } else {
        const mockMemories: Memory[] = [
          {
            id: 1,
            title: 'Beach Sunset',
            description: 'Our first beach trip together. The sunset was magical! 🌅',
            date: 'Jan 12, 2026',
            emoji: '🏖️',
            category: 'travel',
          },
          {
            id: 2,
            title: 'First Kiss',
            description: 'Under the stars at the park. A moment I\'ll never forget.',
            date: 'Jan 1, 2025',
            emoji: '💋',
            category: 'milestone',
          },
          {
            id: 3,
            title: 'Coffee Shop Date',
            description: 'Tried the new cafe downtown. Best latte and conversation!',
            date: 'Jan 14, 2026',
            emoji: '☕',
            category: 'date',
          },
          {
            id: 4,
            title: 'Movie Night',
            description: 'Marathon of our favorite series with homemade popcorn 🍿',
            date: 'Jan 10, 2026',
            emoji: '🎬',
            category: 'fun',
          },
          {
            id: 5,
            title: 'Cozy Morning',
            description: 'Breakfast in bed and morning cuddles',
            date: 'Jan 8, 2026',
            emoji: '🛏️',
            category: 'cozy',
          },
        ];
        setMemories(mockMemories);
        await AsyncStorage.setItem('memories', JSON.stringify(mockMemories));
      }
    } catch (error) {
      console.error('Error loading memories:', error);
    }
  };

  const saveMemories = async (newMemories: Memory[]) => {
    try {
      await AsyncStorage.setItem('memories', JSON.stringify(newMemories));
      setMemories(newMemories);
    } catch (error) {
      console.error('Error saving memories:', error);
    }
  };

  const handleSaveMemory = async () => {
    if (memoryTitle.trim() && memoryDescription.trim()) {
      const newMemory: Memory = {
        id: Date.now(),
        title: memoryTitle,
        description: memoryDescription,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        emoji: '📸',
        category: selectedCategory === 'all' ? 'fun' : selectedCategory,
      };
      await saveMemories([newMemory, ...memories]);
      setModalVisible(false);
      setMemoryTitle('');
      setMemoryDescription('');
    }
  };

  const handleDeleteMemory = async (id: number) => {
    const updated = memories.filter(m => m.id !== id);
    await saveMemories(updated);
  };

  const filteredMemories = selectedCategory === 'all' 
    ? memories 
    : memories.filter(m => m.category === selectedCategory);

  const categories = [
    { id: 'all', label: 'All', icon: 'grid' },
    { id: 'travel', label: 'Travel', icon: 'airplane' },
    { id: 'milestone', label: 'Milestones', icon: 'star' },
    { id: 'date', label: 'Dates', icon: 'heart' },
    { id: 'fun', label: 'Fun', icon: 'happy' },
    { id: 'cozy', label: 'Cozy', icon: 'home' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F0E5FF', '#FFE5EC', '#FFFFFF']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Memories</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.viewModeButton}
              onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              <Ionicons
                name={viewMode === 'grid' ? 'list' : 'grid'}
                size={24}
                color="#333"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
              <Ionicons name="add-circle" size={28} color="#9D6BFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{memories.length}</Text>
            <Text style={styles.statLabel}>Memories</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>365</Text>
            <Text style={styles.statLabel}>Days Together</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{memories.filter(m => m.category === 'milestone').length}</Text>
            <Text style={styles.statLabel}>Milestones</Text>
          </View>
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons
                name={category.icon as any}
                size={16}
                color={selectedCategory === category.id ? 'white' : '#666'}
              />
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextActive,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Memories Grid/List */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={viewMode === 'grid' ? styles.gridContent : styles.listContent}
        >
          {viewMode === 'grid' ? (
            <View style={styles.memoryGrid}>
              {filteredMemories.map((memory) => (
                <View key={memory.id} style={styles.memoryGridCard}>
                  <TouchableOpacity 
                    style={styles.gridDeleteButton}
                    onPress={() => handleDeleteMemory(memory.id)}
                  >
                    <Ionicons name="close-circle" size={24} color="#FF6B9D" />
                  </TouchableOpacity>
                  <View style={styles.memoryImagePlaceholder}>
                    <Text style={styles.memoryGridEmoji}>{memory.emoji}</Text>
                  </View>
                  <Text style={styles.memoryGridTitle} numberOfLines={2}>
                    {memory.title}
                  </Text>
                  <Text style={styles.memoryGridDate}>{memory.date}</Text>
                </View>
              ))}
            </View>
          ) : (
            <>
              {filteredMemories.map((memory) => (
                <View key={memory.id} style={styles.memoryListCard}>
                  <View style={styles.memoryListImagePlaceholder}>
                    <Text style={styles.memoryListEmoji}>{memory.emoji}</Text>
                  </View>
                  <View style={styles.memoryListContent}>
                    <Text style={styles.memoryListTitle}>{memory.title}</Text>
                    <Text style={styles.memoryListDescription} numberOfLines={2}>
                      {memory.description}
                    </Text>
                    <Text style={styles.memoryListDate}>{memory.date}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.memoryOptions}
                    onPress={() => handleDeleteMemory(memory.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF6B9D" />
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </LinearGradient>

      {/* Add Memory Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Memory</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Photo Placeholder */}
            <TouchableOpacity style={styles.photoPlaceholder}>
              <Ionicons name="images-outline" size={48} color="#999" />
              <Text style={styles.photoPlaceholderText}>Add Photos</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.titleInput}
              placeholder="Memory title"
              placeholderTextColor="#999"
              value={memoryTitle}
              onChangeText={setMemoryTitle}
            />

            <TextInput
              style={styles.descriptionInput}
              placeholder="Describe this moment..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              value={memoryDescription}
              onChangeText={setMemoryDescription}
              textAlignVertical="top"
            />

            {/* Category Selector */}
            <View style={styles.modalCategorySection}>
              <Text style={styles.modalCategoryLabel}>Category:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categories.slice(1).map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.modalCategoryChip}
                  >
                    <Ionicons name={category.icon as any} size={16} color="#666" />
                    <Text style={styles.modalCategoryText}>{category.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity 
              style={[
                styles.saveMemoryButton,
                (!memoryTitle.trim() || !memoryDescription.trim()) && styles.saveMemoryButtonDisabled
              ]} 
              onPress={handleSaveMemory}
              disabled={!memoryTitle.trim() || !memoryDescription.trim()}
            >
              <Text style={styles.saveMemoryButtonText}>Save Memory</Text>
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
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewModeButton: {
    padding: 8,
  },
  addButton: {
    padding: 8,
  },
  statsCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9D6BFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },
  categoryScroll: {
    marginBottom: 20,
  },
  categoryContainer: {
    paddingHorizontal: 20,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#9D6BFF',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: 'white',
  },
  content: {
    flex: 1,
  },
  gridContent: {
    paddingHorizontal: 12,
  },
  listContent: {
    paddingHorizontal: 20,
  },
  memoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  memoryGridCard: {
    width: imageSize,
    margin: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  gridDeleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  memoryImagePlaceholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F0E5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memoryGridEmoji: {
    fontSize: 48,
  },
  memoryGridTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    padding: 12,
    paddingBottom: 4,
  },
  memoryGridDate: {
    fontSize: 12,
    color: '#666',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  memoryListCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  memoryListImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#F0E5FF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memoryListEmoji: {
    fontSize: 32,
  },
  memoryListContent: {
    flex: 1,
  },
  memoryListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  memoryListDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  memoryListDate: {
    fontSize: 12,
    color: '#999',
  },
  memoryOptions: {
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
    minHeight: 500,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  photoPlaceholder: {
    height: 150,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  photoPlaceholderText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  titleInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    color: '#333',
  },
  descriptionInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    marginBottom: 16,
    color: '#333',
  },
  modalCategorySection: {
    marginBottom: 24,
  },
  modalCategoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  modalCategoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
  },
  modalCategoryText: {
    fontSize: 14,
    color: '#666',
  },
  saveMemoryButton: {
    backgroundColor: '#9D6BFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveMemoryButtonDisabled: {
    backgroundColor: '#CCC',
  },
  saveMemoryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
