import React from 'react';
import { StyleProp, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { lightTheme } from '../../styles/theme';
import { useTheme } from '../../providers/theme';

type Theme = typeof lightTheme;

type Props = ViewProps & {
  theme?: Theme;
  style?: StyleProp<ViewStyle>;
};

const Card: React.FC<Props> = ({ theme: themeProp, style, children, ...rest }) => {
  const { theme: ctxTheme } = useTheme();
  const theme = themeProp ?? ctxTheme ?? lightTheme;
  const styles = createStyles(theme);
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xl,
      padding: theme.spacing[5],
      ...theme.shadow.sm,
    },
  });

export default Card;
