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
import { noteService } from '../../src/services/api/notes';

interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  isPinned: boolean;
  date: string;
}

export default function NotesScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [modalVisible, setModalVisible] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [selectedColor, setSelectedColor] = useState('#FFE5EC');
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const apiNotes = await noteService.getAll();
      const mapped: Note[] = apiNotes.map((n) => ({
        id: n.id,
        title: n.title,
        content: n.content,
        color: n.color,
        isPinned: n.is_pinned,
        date: new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      }));
      setNotes(mapped);
    } catch (error) {
      Alert.alert('Error', 'Failed to load notes');
      console.error('Error loading notes:', error);
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
    if (!noteTitle.trim() || !noteContent.trim()) {
      Alert.alert('Error', 'Please fill in title and content');
      return;
    }

    try {
      setSaving(true);
      await noteService.create({
        title: noteTitle.trim(),
        content: noteContent.trim(),
        color: selectedColor,
      });
      await loadNotes();

      setModalVisible(false);
      setNoteTitle('');
      setNoteContent('');
      setSelectedColor('#FFE5EC');
    } catch (error) {
      Alert.alert('Error', 'Failed to save note');
      console.error('Error saving note:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await noteService.delete(id);
      await loadNotes();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete note');
      console.error('Error deleting note:', error);
    }
  };

  const handleTogglePin = async (id: string) => {
    try {
      await noteService.togglePin(id);
      await loadNotes();
    } catch (error) {
      Alert.alert('Error', 'Failed to update note');
      console.error('Error toggling pin:', error);
    }
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedNotes = filteredNotes.filter(note => note.isPinned);
  const regularNotes = filteredNotes.filter(note => !note.isPinned);

  return (
    <Screen scroll contentStyle={styles.screenContent}>
      <AppHeader
        title="Notes"
        subtitle="Save little things"
        onBack={() => router.replace('/(app)/dashboard')}
        right={(
          <IconCircleButton
            icon="add"
            theme={theme}
            onPress={() => setModalVisible(true)}
          />
        )}
        theme={theme}
      />

      <Card theme={theme} style={styles.card}>
        <View style={styles.searchRow}>
          <View style={styles.searchIcon}>
            <Ionicons name="search" size={18} color={theme.colors.textMuted} />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search notes"
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </Card>

      {pinnedNotes.length > 0 ? (
        <Card theme={theme} style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Pinned</Text>
            <View style={[styles.sectionBadge, { backgroundColor: withOpacity(theme.colors.primary, 0.12) }]}>
              <Ionicons name="pin" size={16} color={theme.colors.primary} />
            </View>
          </View>

          {pinnedNotes.map((note, index) => (
            <View
              key={note.id}
              style={[
                styles.noteCard,
                { backgroundColor: note.color },
                index !== 0 && { marginTop: theme.spacing[3] },
              ]}
            >
              <View style={styles.noteHeaderRow}>
                <Text style={styles.noteTitle} numberOfLines={1}>
                  {note.title}
                </Text>

                <View style={styles.noteActions}>
                  <Pressable
                    onPress={() => handleTogglePin(note.id)}
                    hitSlop={10}
                    style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
                  >
                    <Ionicons name="pin" size={18} color={theme.colors.primary} />
                  </Pressable>
                  <Pressable
                    onPress={() => handleDeleteNote(note.id)}
                    hitSlop={10}
                    style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
                  >
                    <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
                  </Pressable>
                </View>
              </View>

              <Text style={styles.noteContent} numberOfLines={3}>
                {note.content}
              </Text>
              <Text style={styles.noteDate}>{note.date}</Text>
            </View>
          ))}
        </Card>
      ) : null}

      <Card theme={theme} style={styles.card}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>All notes</Text>
          <Text style={styles.sectionMeta}>{regularNotes.length}</Text>
        </View>

        {regularNotes.length === 0 ? (
          <Text style={styles.emptyText}>No notes yet. Add your first one.</Text>
        ) : (
          regularNotes.map((note, index) => (
            <View
              key={note.id}
              style={[
                styles.noteCard,
                { backgroundColor: note.color },
                index !== 0 && { marginTop: theme.spacing[3] },
              ]}
            >
              <View style={styles.noteHeaderRow}>
                <Text style={styles.noteTitle} numberOfLines={1}>
                  {note.title}
                </Text>
                <View style={styles.noteActions}>
                  <Pressable
                    onPress={() => handleTogglePin(note.id)}
                    hitSlop={10}
                    style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
                  >
                    <Ionicons name="pin-outline" size={18} color={theme.colors.textMuted} />
                  </Pressable>
                  <Pressable
                    onPress={() => handleDeleteNote(note.id)}
                    hitSlop={10}
                    style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
                  >
                    <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
                  </Pressable>
                </View>
              </View>
              <Text style={styles.noteContent} numberOfLines={3}>
                {note.content}
              </Text>
              <Text style={styles.noteDate}>{note.date}</Text>
            </View>
          ))
        )}
      </Card>

      {/* Add Note Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>New note</Text>
              <Pressable onPress={() => setModalVisible(false)} hitSlop={10}>
                <Ionicons name="close" size={26} color={theme.colors.textMuted} />
              </Pressable>
            </View>

            <View style={[styles.preview, { backgroundColor: selectedColor }]}
            >
              <TextInput
                style={styles.titleInput}
                placeholder="Title"
                placeholderTextColor={theme.colors.textMuted}
                value={noteTitle}
                onChangeText={setNoteTitle}
              />
              <TextInput
                style={styles.contentInput}
                placeholder="Write your note…"
                placeholderTextColor={theme.colors.textMuted}
                multiline
                numberOfLines={8}
                value={noteContent}
                onChangeText={setNoteContent}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.colorPicker}>
              <Text style={styles.colorLabel}>Color</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorRow}>
                {noteColors.map((color) => {
                  const selected = selectedColor === color;
                  return (
                    <Pressable
                      key={color}
                      onPress={() => setSelectedColor(color)}
                      style={({ pressed }) => [
                        styles.colorOption,
                        { backgroundColor: color, borderColor: selected ? theme.colors.textPrimary : 'transparent' },
                        pressed && styles.pressed,
                      ]}
                    >
                      {selected ? <Ionicons name="checkmark" size={18} color={theme.colors.textPrimary} /> : null}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <Pressable
              onPress={handleSaveNote}
              disabled={!noteTitle.trim() || !noteContent.trim() || saving}
              style={({ pressed }) => [
                styles.primaryBtn,
                (!noteTitle.trim() || !noteContent.trim() || saving) && styles.primaryBtnDisabled,
                pressed && styles.pressed,
              ]}
            >
              {saving ? (
                <ActivityIndicator color={theme.colors.onPrimary} />
              ) : (
                <Text style={styles.primaryBtnText}>Save note</Text>
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
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    searchIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: withOpacity(theme.colors.secondary, 0.05),
      marginRight: theme.spacing[3],
    },
    searchInput: {
      flex: 1,
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textPrimary,
      paddingVertical: theme.spacing[2],
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
    sectionBadge: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
    },
    noteCard: {
      borderRadius: theme.radius.lg,
      padding: theme.spacing[4],
      borderWidth: 1,
      borderColor: withOpacity(theme.colors.secondary, 0.06),
    },
    noteHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    noteTitle: {
      flex: 1,
      paddingRight: theme.spacing[3],
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.textPrimary,
    },
    noteActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[3],
    },
    iconBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: withOpacity(theme.colors.surface, 0.6),
    },
    noteContent: {
      marginTop: theme.spacing[3],
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: withOpacity(theme.colors.textPrimary, 0.78),
      lineHeight: 20,
    },
    noteDate: {
      marginTop: theme.spacing[3],
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textMuted,
    },
    emptyText: {
      paddingVertical: theme.spacing[4],
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textMuted,
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
    preview: {
      borderRadius: theme.radius.lg,
      padding: theme.spacing[4],
      borderWidth: 1,
      borderColor: withOpacity(theme.colors.secondary, 0.06),
    },
    titleInput: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.textPrimary,
      paddingVertical: theme.spacing[2],
    },
    contentInput: {
      marginTop: theme.spacing[3],
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textPrimary,
      minHeight: 140,
    },
    colorPicker: {
      marginTop: theme.spacing[4],
    },
    colorLabel: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing[3],
    },
    colorRow: {
      paddingRight: theme.spacing[2],
    },
    colorOption: {
      width: 44,
      height: 44,
      borderRadius: 22,
      marginRight: theme.spacing[3],
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
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
