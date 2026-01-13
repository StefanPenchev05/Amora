import React from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { darkTheme, lightTheme } from '../../styles/theme';
import { withOpacity } from '../../components/form/color';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';

export type HomeScreenProps = {
  onOpenCalendar?: () => void;
  onOpenMood?: () => void;
  onOpenNotes?: () => void;
  onOpenMemories?: () => void;
  onAnswerPrompt?: () => void;
};

const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenCalendar,
  onOpenMood,
  onOpenNotes,
  onOpenMemories,
  onAnswerPrompt,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? darkTheme : lightTheme;
  const styles = createStyles(theme);

  const orb1Anim = React.useRef(new Animated.Value(0)).current;
  const orb2Anim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const orb1Loop = Animated.loop(
      Animated.sequence([
        Animated.timing(orb1Anim, {
          toValue: 1,
          duration: 9800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(orb1Anim, {
          toValue: 0,
          duration: 9800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    const orb2Loop = Animated.loop(
      Animated.sequence([
        Animated.timing(orb2Anim, {
          toValue: 1,
          duration: 11400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(orb2Anim, {
          toValue: 0,
          duration: 11400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    orb1Loop.start();
    orb2Loop.start();

    return () => {
      orb1Loop.stop();
      orb2Loop.stop();
    };
  }, [orb1Anim, orb2Anim]);

  const orb1Style = {
    transform: [
      {
        translateX: orb1Anim.interpolate({
          inputRange: [0, 1],
          outputRange: [-14, 22],
        }),
      },
      {
        translateY: orb1Anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 18],
        }),
      },
      {
        scale: orb1Anim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.08],
        }),
      },
    ],
  } as const;

  const orb2Style = {
    transform: [
      {
        translateX: orb2Anim.interpolate({
          inputRange: [0, 1],
          outputRange: [18, -12],
        }),
      },
      {
        translateY: orb2Anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -16],
        }),
      },
      {
        scale: orb2Anim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.06],
        }),
      },
    ],
  } as const;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <LinearGradient
        colors={[theme.colors.background, theme.colors.surface]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View
        pointerEvents="none"
        style={[
          styles.orb,
          { backgroundColor: withOpacity(theme.colors.primary, 0.12) },
          orb1Style,
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.orb2,
          { backgroundColor: withOpacity(theme.colors.accent, 0.1) },
          orb2Style,
        ]}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <View>
            <Text style={styles.kicker}>Amora</Text>
            <Text style={styles.title}>Your shared space</Text>
          </View>

          <View style={styles.topRight}>
            <View
              style={[
                styles.streakChip,
                { backgroundColor: withOpacity(theme.colors.primary, 0.14) },
              ]}
            >
              <Ionicons name="flame-outline" size={16} color={theme.colors.primary} />
              <Text style={styles.streakText}>7 days</Text>
            </View>

            <Pressable style={styles.iconButton}>
              <Ionicons name="settings-outline" size={18} color={theme.colors.textPrimary} />
            </Pressable>
          </View>
        </View>

        <GlassCard theme={theme} isDark={isDark}>
          <View style={styles.promptHeader}>
            <View style={styles.promptIcon}>
              <Ionicons name="chatbubble-ellipses-outline" size={18} color={theme.colors.primary} />
            </View>
            <View style={styles.promptTextWrap}>
              <Text style={styles.cardTitle}>Daily prompt</Text>
              <Text style={styles.cardSubtitle}>Answer together to build your timeline.</Text>
            </View>
          </View>

          <Text style={styles.promptQuestion}>
            What’s one small thing your partner did recently that you appreciated?
          </Text>

          <GradientButton
            theme={theme}
            title="Answer together"
            onPress={onAnswerPrompt}
          />
        </GlassCard>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Quick actions</Text>
          <Text style={styles.sectionHint}>for today</Text>
        </View>

        <View style={styles.grid}>
          <QuickAction
            theme={theme}
            isDark={isDark}
            title="Calendar"
            subtitle="Plan dates"
            icon="calendar-outline"
            onPress={onOpenCalendar}
          />
          <QuickAction
            theme={theme}
            isDark={isDark}
            title="Mood"
            subtitle="Check-in"
            icon="happy-outline"
            onPress={onOpenMood}
          />
          <QuickAction
            theme={theme}
            isDark={isDark}
            title="Love notes"
            subtitle="Say it"
            icon="heart-outline"
            onPress={onOpenNotes}
          />
          <QuickAction
            theme={theme}
            isDark={isDark}
            title="Memories"
            subtitle="Save moments"
            icon="images-outline"
            onPress={onOpenMemories}
          />
        </View>

        <Text style={styles.sectionTitle}>Recent</Text>

        <GlassCard theme={theme} isDark={isDark} style={styles.listCard}>
          <FeedRow
            theme={theme}
            icon="sparkles-outline"
            title="New affirmation"
            detail="You’re doing great — keep choosing each other."
          />
          <View style={styles.divider} />
          <FeedRow
            theme={theme}
            icon="time-outline"
            title="Milestone coming"
            detail="3 days until your next special day."
          />
          <View style={styles.divider} />
          <FeedRow
            theme={theme}
            icon="mail-unread-outline"
            title="Love note draft"
            detail="Tap to finish and send it later."
          />
        </GlassCard>

        <Text style={styles.devNote}>
          Dev mode: this screen is accessible without login for now.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

type Theme = typeof lightTheme;

type QuickActionProps = {
  theme: Theme;
  isDark: boolean;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
};

const QuickAction: React.FC<QuickActionProps> = ({
  theme,
  isDark,
  title,
  subtitle,
  icon,
  onPress,
}) => {
  const styles = createStyles(theme);

  return (
    <Pressable style={styles.gridItem} onPress={onPress}>
      <GlassCard theme={theme} isDark={isDark} style={styles.actionCard}>
        <View
          style={[
            styles.actionIcon,
            { backgroundColor: withOpacity(theme.colors.primary, 0.12) },
          ]}
        >
          <Ionicons name={icon} size={18} color={theme.colors.primary} />
        </View>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </GlassCard>
    </Pressable>
  );
};

type FeedRowProps = {
  theme: Theme;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  detail: string;
};

const FeedRow: React.FC<FeedRowProps> = ({ theme, icon, title, detail }) => {
  const styles = createStyles(theme);

  return (
    <View style={styles.feedRow}>
      <View
        style={[
          styles.feedIcon,
          { backgroundColor: withOpacity(theme.colors.accent, 0.12) },
        ]}
      >
        <Ionicons name={icon} size={18} color={theme.colors.accent} />
      </View>
      <View style={styles.feedText}>
        <Text style={styles.feedTitle}>{title}</Text>
        <Text style={styles.feedDetail}>{detail}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      paddingHorizontal: theme.spacing[5],
      paddingTop: theme.spacing[6],
      paddingBottom: theme.spacing[8],
      gap: theme.spacing[5],
    },
    orb: {
      position: 'absolute',
      width: 320,
      height: 320,
      borderRadius: 999,
      left: -160,
      top: 60,
    },
    orb2: {
      position: 'absolute',
      width: 280,
      height: 280,
      borderRadius: 999,
      right: -150,
      top: 260,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: theme.spacing[4],
    },
    kicker: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.primary,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
    title: {
      marginTop: theme.spacing[1],
      fontSize: theme.typography.fontSize['3xl'],
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.textPrimary,
      letterSpacing: -0.6,
    },
    topRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[3],
    },
    streakChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[2],
      paddingHorizontal: theme.spacing[3],
      paddingVertical: theme.spacing[2],
      borderRadius: 999,
      borderWidth: 1,
      borderColor: withOpacity(theme.colors.primary, 0.22),
    },
    streakText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.primary,
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: withOpacity(theme.colors.surface, 0.82),
      ...theme.shadow.sm,
    },
    promptHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[3],
    },
    promptIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: withOpacity(theme.colors.primary, 0.12),
      borderWidth: 1,
      borderColor: withOpacity(theme.colors.primary, 0.2),
    },
    promptTextWrap: {
      flex: 1,
      gap: 2,
    },
    cardTitle: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.textPrimary,
    },
    cardSubtitle: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textMuted,
    },
    promptQuestion: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.textPrimary,
      lineHeight: 26,
    },
    sectionRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: theme.spacing[2],
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.textPrimary,
    },
    sectionHint: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textMuted,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing[4],
    },
    gridItem: {
      width: '47.5%',
    },
    actionCard: {
      borderRadius: theme.radius.lg,
    },
    actionIcon: {
      width: 40,
      height: 40,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: withOpacity(theme.colors.primary, 0.22),
    },
    actionTitle: {
      marginTop: theme.spacing[1],
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.textPrimary,
    },
    actionSubtitle: {
      marginTop: 2,
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textMuted,
    },
    listCard: {
      padding: 0,
    },
    feedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[3],
      paddingHorizontal: theme.spacing[5],
      paddingVertical: theme.spacing[4],
    },
    feedIcon: {
      width: 40,
      height: 40,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: withOpacity(theme.colors.accent, 0.22),
    },
    feedText: {
      flex: 1,
      gap: 2,
    },
    feedTitle: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.textPrimary,
    },
    feedDetail: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textMuted,
      lineHeight: 20,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginHorizontal: theme.spacing[5],
    },
    devNote: {
      textAlign: 'center',
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.textMuted,
      marginTop: theme.spacing[2],
    },
  });

export default HomeScreen;
