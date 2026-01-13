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

interface Note {
  id: number;
  title: string;
  content: string;
  color: string;
  isPinned: boolean;
  date: string;
}

export default function NotesScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [selectedColor, setSelectedColor] = useState('#FFE5EC');
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const stored = await AsyncStorage.getItem('notes');
      if (stored) {
        setNotes(JSON.parse(stored));
      } else {
        const mockNotes: Note[] = [
          {
            id: 1,
            title: 'Things I Love About You',
            content: 'Your smile lights up my day, your laugh is contagious, the way you always know how to cheer me up...',
            color: '#FFE5EC',
            isPinned: true,
            date: 'Jan 15, 2026',
          },
          {
            id: 2,
            title: 'Date Ideas',
            content: '🍕 Try new Italian restaurant downtown\n🎬 Movie marathon weekend\n🏕️ Camping trip in spring\n☕ Coffee shop hopping',
            color: '#E5F3FF',
            isPinned: true,
            date: 'Jan 14, 2026',
          },
          {
            id: 3,
            title: 'Our Song Playlist',
            content: '1. "Perfect" - Ed Sheeran\n2. "A Thousand Years"\n3. "Thinking Out Loud"\n4. "All of Me"',
            color: '#F0E5FF',
            isPinned: false,
            date: 'Jan 13, 2026',
          },
          {
            id: 4,
            title: 'Anniversary Plans',
            content: 'Dinner reservation at La Petite Maison at 7 PM\nGift: custom photo album\nSurprise: weekend getaway',
            color: '#FFF5E5',
            isPinned: false,
            date: 'Jan 10, 2026',
          },
          {
            id: 5,
            title: 'Bucket List Together',
            content: '✈️ Travel to Paris\n🏖️ Beach vacation in Maldives\n🎸 Learn guitar together\n🍳 Take cooking classes',
            color: '#E5FFEE',
            isPinned: false,
            date: 'Jan 8, 2026',
          },
          {
            id: 6,
            title: 'Thank You Note',
            content: 'Thank you for being so patient with me today. I know I was stressed about work, but you made everything better just by being there. I love you! 💕',
            color: '#FFE5EC',
            isPinned: false,
            date: 'Jan 5, 2026',
          },
        ];
        setNotes(mockNotes);
        await AsyncStorage.setItem('notes', JSON.stringify(mockNotes));
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const saveNotes = async (newNotes: Note[]) => {
    try {
      await AsyncStorage.setItem('notes', JSON.stringify(newNotes));
      setNotes(newNotes);
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const noteColors = [
    '#FFE5EC', // Pink
    '#E5F3FF', // Blue
    '#FFF5E5', // Orange
    '#F0E5FF', // Purple
    '#E5FFEE', // Green
    '#FFF0E5', // Peach
  ];

  const handleSaveNote = async () => {
    if (noteTitle.trim() && noteContent.trim()) {
      const newNote: Note = {
        id: Date.now(),
        title: noteTitle,
        content: noteContent,
        color: selectedColor,
        isPinned: false,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };
      await saveNotes([newNote, ...notes]);
      setModalVisible(false);
      setNoteTitle('');
      setNoteContent('');
      setSelectedColor('#FFE5EC');
    }
  };

  const handleDeleteNote = async (id: number) => {
    const updated = notes.filter(n => n.id !== id);
    await saveNotes(updated);
  };

  const handleTogglePin = async (id: number) => {
    const updated = notes.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n);
    await saveNotes(updated);
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedNotes = filteredNotes.filter(note => note.isPinned);
  const regularNotes = filteredNotes.filter(note => !note.isPinned);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFF5E5', '#FFE5EC', '#FFFFFF']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Love Notes</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
            <Ionicons name="add-circle" size={28} color="#FFB347" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search notes..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Pinned Notes */}
          {pinnedNotes.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="pin" size={20} color="#FF6B9D" />
                <Text style={styles.sectionTitle}>Pinned</Text>
              </View>
              {pinnedNotes.map((note) => (
                <View
                  key={note.id}
                  style={[styles.noteCard, { backgroundColor: note.color }]}
                >
                  <View style={styles.noteHeader}>
                    <Text style={styles.noteTitle}>{note.title}</Text>
                    <View style={styles.noteActions}>
                      <TouchableOpacity onPress={() => handleTogglePin(note.id)}>
                        <Ionicons name="pin" size={20} color="#FF6B9D" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteNote(note.id)} style={{ marginLeft: 12 }}>
                        <Ionicons name="trash-outline" size={20} color="#FF6B9D" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={styles.noteContent} numberOfLines={3}>
                    {note.content}
                  </Text>
                  <Text style={styles.noteDate}>{note.date}</Text>
                </View>
              ))}
            </View>
          )}

          {/* All Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All Notes</Text>
            {regularNotes.map((note) => (
              <View
                key={note.id}
                style={[styles.noteCard, { backgroundColor: note.color }]}
              >
                <View style={styles.noteHeader}>
                  <Text style={styles.noteTitle}>{note.title}</Text>
                  <View style={styles.noteActions}>
                    <TouchableOpacity onPress={() => handleTogglePin(note.id)}>
                      <Ionicons name="pin-outline" size={20} color="#666" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteNote(note.id)} style={{ marginLeft: 12 }}>
                      <Ionicons name="trash-outline" size={20} color="#FF6B9D" />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.noteContent} numberOfLines={3}>
                  {note.content}
                </Text>
                <Text style={styles.noteDate}>{note.date}</Text>
              </View>
            ))}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </LinearGradient>

      {/* Add Note Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: selectedColor }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Note</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.titleInput}
              placeholder="Title"
              placeholderTextColor="#999"
              value={noteTitle}
              onChangeText={setNoteTitle}
            />

            <TextInput
              style={styles.contentInput}
              placeholder="Write your note..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={10}
              value={noteContent}
              onChangeText={setNoteContent}
              textAlignVertical="top"
            />

            {/* Color Picker */}
            <View style={styles.colorPicker}>
              <Text style={styles.colorLabel}>Color:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {noteColors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorOptionSelected,
                    ]}
                    onPress={() => setSelectedColor(color)}
                  >
                    {selectedColor === color && (
                      <Ionicons name="checkmark" size={24} color="#333" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity 
              style={[
                styles.saveNoteButton,
                (!noteTitle.trim() || !noteContent.trim()) && styles.saveNoteButtonDisabled
              ]} 
              onPress={handleSaveNote}
              disabled={!noteTitle.trim() || !noteContent.trim()}
            >
              <Text style={styles.saveNoteButtonText}>Save Note</Text>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  noteCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  noteContent: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
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
  titleInput: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  contentInput: {
    fontSize: 16,
    color: '#333',
    minHeight: 200,
    marginBottom: 20,
  },
  colorPicker: {
    marginBottom: 20,
  },
  colorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#333',
  },
  saveNoteButton: {
    backgroundColor: '#FFB347',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveNoteButtonDisabled: {
    backgroundColor: '#CCC',
  },
  saveNoteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noteActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
