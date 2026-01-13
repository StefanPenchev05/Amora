import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { lightTheme } from '../../styles/theme';

type Theme = typeof lightTheme;

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  variant?: 'solid' | 'gradient';
  theme?: Theme;
};

const Screen: React.FC<Props> = ({
  children,
  scroll = false,
  contentStyle,
  style,
  variant = 'solid',
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
    <View
      style={[
        styles.root,
        variant === 'gradient' ? styles.rootGradient : null,
        style,
      ]}
    >
      <SafeAreaView style={styles.safe}>{content}</SafeAreaView>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    rootGradient: {
      // Optional soft gradient feel without a full-screen diagonal wash
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
      paddingBottom: theme.spacing[8],
    },
  });

export default Screen;
