import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { lightTheme } from '../../styles/theme';

type Theme = typeof lightTheme;

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  theme?: Theme;
};

const Screen: React.FC<Props> = ({
  children,
  scroll = false,
  contentStyle,
  style,
  theme = lightTheme,
}) => {
  const styles = createStyles(theme);

  const content = scroll ? (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, contentStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, contentStyle]}>{children}</View>
  );

  return (
    <LinearGradient
      colors={[theme.colors.background, theme.colors.surface]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.root, style]}
    >
      <SafeAreaView style={styles.safe}>{content}</SafeAreaView>
    </LinearGradient>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    safe: {
      flex: 1,
    },
    scroll: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing[5],
      paddingTop: theme.spacing[5],
      paddingBottom: theme.spacing[7],
      gap: theme.spacing[5],
    },
  });

export default Screen;
