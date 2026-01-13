import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
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
import { memoryService } from '../../src/services/api/memories';

interface Memory {
  id: string;
  title: string;
  description: string;
  date: string;
  emoji: string;
  category: string;
}

export default function MemoriesScreen() {
  const router = useRouter();
  const theme = lightTheme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const tileWidth = useMemo(() => {
    const windowWidth = Dimensions.get('window').width;
    const contentPadding = theme.spacing[5] * 2;
    const gap = theme.spacing[4];
    return Math.floor((windowWidth - contentPadding - gap) / 2);
  }, [theme.spacing]);

  const [modalVisible, setModalVisible] = useState(false);
  const [memoryTitle, setMemoryTitle] = useState('');
  const [memoryDescription, setMemoryDescription] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [saving, setSaving] = useState(false);
  const [newMemoryCategory, setNewMemoryCategory] = useState<string>('fun');

  useEffect(() => {
    loadMemories();
  }, [selectedCategory]);

  const emojiForCategory = (category: string) => {
    const map: Record<string, string> = {
      travel: '🏖️',
      milestone: '💋',
      date: '☕',
      fun: '🎬',
      cozy: '🛏️',
    };
    return map[category] || '📸';
  };

  const loadMemories = async () => {
    try {
      const category = selectedCategory === 'all' ? undefined : selectedCategory;
      const apiMemories = await memoryService.getAll(category);
      const mapped: Memory[] = apiMemories.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        date: new Date(m.memory_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        emoji: emojiForCategory(m.category),
        category: m.category,
      }));
      setMemories(mapped);
    } catch (error) {
      Alert.alert('Error', 'Failed to load memories');
      console.error('Error loading memories:', error);
    }
  };

  const handleSaveMemory = async () => {
    if (!memoryTitle.trim() || !memoryDescription.trim()) {
      Alert.alert('Error', 'Please fill in title and description');
      return;
    }

    const category = newMemoryCategory || (selectedCategory === 'all' ? 'fun' : selectedCategory);

    try {
      setSaving(true);
      await memoryService.create({
        title: memoryTitle.trim(),
        description: memoryDescription.trim(),
        category,
        photo_url: '',
        memory_date: new Date().toISOString(),
      });
      await loadMemories();

      setModalVisible(false);
      setMemoryTitle('');
      setMemoryDescription('');
      setNewMemoryCategory(selectedCategory === 'all' ? 'fun' : selectedCategory);
    } catch (error) {
      Alert.alert('Error', 'Failed to save memory');
      console.error('Error saving memory:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    try {
      await memoryService.delete(id);
      await loadMemories();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete memory');
      console.error('Error deleting memory:', error);
    }
  };

  const filteredMemories = selectedCategory === 'all'
    ? memories
    : memories.filter(m => m.category === selectedCategory);

  const categories = useMemo(
    () => [
      { id: 'all', label: 'All', icon: 'grid-outline' },
      { id: 'travel', label: 'Travel', icon: 'airplane-outline' },
      { id: 'milestone', label: 'Milestones', icon: 'star-outline' },
      { id: 'date', label: 'Dates', icon: 'heart-outline' },
      { id: 'fun', label: 'Fun', icon: 'happy-outline' },
      { id: 'cozy', label: 'Cozy', icon: 'home-outline' },
    ],
    [],
  );

  const headerRight = (
    <View style={styles.headerRight}>
      <IconCircleButton
        icon={viewMode === 'grid' ? 'list-outline' : 'grid-outline'}
        theme={theme}
        onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
      />
      <View style={{ width: theme.spacing[3] }} />
      <IconCircleButton
        icon="add"
        theme={theme}
        onPress={() => {
          setNewMemoryCategory(selectedCategory === 'all' ? 'fun' : selectedCategory);
          setModalVisible(true);
        }}
      />
    </View>
  );

  let memoriesSectionBody: React.ReactNode;
  if (filteredMemories.length === 0) {
    memoriesSectionBody = <Text style={styles.emptyText}>No memories yet. Add your first one.</Text>;
  } else if (viewMode === 'grid') {
    memoriesSectionBody = (
      <View style={styles.grid}>
        {filteredMemories.map((memory) => (
          <View key={memory.id} style={[styles.tile, { width: tileWidth }]}> 
            <Pressable
              onPress={() => handleDeleteMemory(memory.id)}
              hitSlop={10}
              style={({ pressed }) => [styles.tileDelete, pressed && styles.pressed]}
            >
              <Ionicons name="close" size={16} color={theme.colors.error} />
            </Pressable>

            <View style={styles.tileMedia}>
              <Text style={styles.tileEmoji}>{memory.emoji}</Text>
            </View>

            <Text style={styles.tileTitle} numberOfLines={2}>
              {memory.title}
            </Text>
            <Text style={styles.tileDate}>{memory.date}</Text>
          </View>
        ))}
      </View>
    );
  } else {
    memoriesSectionBody = (
      <View>
        {filteredMemories.map((memory, index) => (
          <View
            key={memory.id}
            style={[styles.listRow, index !== 0 && { marginTop: theme.spacing[3] }]}
          >
            <View style={styles.listMedia}>
              <Text style={styles.listEmoji}>{memory.emoji}</Text>
            </View>
            <View style={styles.listContent}>
              <Text style={styles.listTitle} numberOfLines={1}>
                {memory.title}
              </Text>
              <Text style={styles.listDesc} numberOfLines={2}>
                {memory.description}
              </Text>
              <Text style={styles.listDate}>{memory.date}</Text>
            </View>
            <Pressable
              onPress={() => handleDeleteMemory(memory.id)}
              hitSlop={10}
              style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            >
              <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
            </Pressable>
          </View>
        ))}
      </View>
    );
  }

  return (
    <Screen scroll theme={theme} contentStyle={styles.screenContent}>
      <AppHeader
        title="Memories"
        subtitle="Capture moments together"
        onBack={() => router.back()}
        right={headerRight}
        theme={theme}
      />

      <Card theme={theme} style={styles.card}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{memories.length}</Text>
            <Text style={styles.statLabel}>Memories</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>—</Text>
            <Text style={styles.statLabel}>Days together</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{memories.filter(m => m.category === 'milestone').length}</Text>
            <Text style={styles.statLabel}>Milestones</Text>
          </View>
        </View>
      </Card>

      <Card theme={theme} style={styles.card}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {categories.map((category) => {
            const active = selectedCategory === category.id;
            return (
              <Pressable
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                style={({ pressed }) => [
                  styles.chip,
                  { backgroundColor: active ? theme.colors.primary : theme.colors.background },
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name={category.icon as any}
                  size={16}
                  color={active ? theme.colors.onPrimary : theme.colors.textMuted}
                />
                <Text style={[styles.chipText, { color: active ? theme.colors.onPrimary : theme.colors.textMuted }]}>
                  {category.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </Card>

      <Card theme={theme} style={styles.card}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>{viewMode === 'grid' ? 'Gallery' : 'List'}</Text>
          <Text style={styles.sectionMeta}>{filteredMemories.length}</Text>
        </View>

        {memoriesSectionBody}
      </Card>

      {/* Add Memory Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>New memory</Text>
              <Pressable onPress={() => setModalVisible(false)} hitSlop={10}>
                <Ionicons name="close" size={26} color={theme.colors.textMuted} />
              </Pressable>
            </View>

            <View style={styles.photoPlaceholder}>
              <Ionicons name="images-outline" size={40} color={theme.colors.textMuted} />
              <Text style={styles.photoPlaceholderText}>Photos (coming soon)</Text>
            </View>

            <TextInput
              style={styles.inputTitle}
              placeholder="Memory title"
              placeholderTextColor={theme.colors.textMuted}
              value={memoryTitle}
              onChangeText={setMemoryTitle}
            />

            <TextInput
              style={styles.inputBody}
              placeholder="Describe this moment…"
              placeholderTextColor={theme.colors.textMuted}
              multiline
              numberOfLines={4}
              value={memoryDescription}
              onChangeText={setMemoryDescription}
              textAlignVertical="top"
            />

            <View style={styles.modalCategorySection}>
              <Text style={styles.modalCategoryLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modalChipRow}>
                {categories.slice(1).map((category) => {
                  const active = newMemoryCategory === category.id;
                  return (
                    <Pressable
                      key={category.id}
                      onPress={() => setNewMemoryCategory(category.id)}
                      style={({ pressed }) => [
                        styles.modalChip,
                        {
                          borderColor: active ? withOpacity(theme.colors.primary, 0.35) : theme.colors.border,
                          backgroundColor: active ? withOpacity(theme.colors.primary, 0.12) : withOpacity(theme.colors.surface, 0.7),
                        },
                        pressed && styles.pressed,
                      ]}
                    >
                      <Ionicons
                        name={category.icon as any}
                        size={16}
                        color={active ? theme.colors.primary : theme.colors.textMuted}
                      />
                      <Text style={[styles.modalChipText, { color: active ? theme.colors.primary : theme.colors.textMuted }]}>
                        {category.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <Pressable
              onPress={handleSaveMemory}
              disabled={!memoryTitle.trim() || !memoryDescription.trim() || saving}
              style={({ pressed }) => [
                styles.primaryBtn,
                (!memoryTitle.trim() || !memoryDescription.trim() || saving) && styles.primaryBtnDisabled,
                pressed && styles.pressed,
              ]}
            >
              {saving ? (
                <ActivityIndicator color={theme.colors.onPrimary} />
              ) : (
                <Text style={styles.primaryBtnText}>Save memory</Text>
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
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
    },
    statNumber: {
      fontSize: theme.typography.fontSize.xl,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.primary,
    },
    statLabel: {
      marginTop: 4,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textMuted,
    },
    statDivider: {
      width: 1,
      height: 34,
      backgroundColor: theme.colors.border,
    },
    chipRow: {
      paddingRight: theme.spacing[2],
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[2],
      paddingHorizontal: theme.spacing[4],
      height: 36,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginRight: theme.spacing[3],
    },
    chipText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
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
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    tile: {
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
      overflow: 'hidden',
      marginBottom: theme.spacing[4],
    },
    tileDelete: {
      position: 'absolute',
      top: theme.spacing[3],
      right: theme.spacing[3],
      zIndex: 2,
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: withOpacity(theme.colors.surface, 0.85),
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    tileMedia: {
      width: '100%',
      aspectRatio: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: withOpacity(theme.colors.primary, 0.06),
    },
    tileEmoji: {
      fontSize: 44,
    },
    tileTitle: {
      paddingHorizontal: theme.spacing[4],
      paddingTop: theme.spacing[3],
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.textPrimary,
    },
    tileDate: {
      paddingHorizontal: theme.spacing[4],
      paddingBottom: theme.spacing[4],
      marginTop: 4,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textMuted,
    },
    listRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
      padding: theme.spacing[4],
    },
    listMedia: {
      width: 56,
      height: 56,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: withOpacity(theme.colors.primary, 0.06),
      marginRight: theme.spacing[4],
    },
    listEmoji: {
      fontSize: 28,
    },
    listContent: {
      flex: 1,
      paddingRight: theme.spacing[3],
    },
    listTitle: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.textPrimary,
    },
    listDesc: {
      marginTop: 2,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textMuted,
    },
    listDate: {
      marginTop: theme.spacing[2],
      fontSize: theme.typography.fontSize.xs,
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
    photoPlaceholder: {
      height: 120,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: withOpacity(theme.colors.secondary, 0.03),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing[4],
    },
    photoPlaceholderText: {
      marginTop: theme.spacing[2],
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textMuted,
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
      minHeight: 100,
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
