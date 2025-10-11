# Design System Documentation

## Overview

The Viki mobile app uses a comprehensive design system built on **design tokens** and **component styles** to ensure consistency, maintainability, and scalability across the entire application. Our design system follows modern design principles and provides a unified visual language.

## Architecture

```
src/styles/
├── theme/
│   ├── light-theme.ts      # Light mode theme configuration
│   ├── dark-theme.ts       # Dark mode theme configuration  
│   └── index.ts            # Theme exports and utilities
├── tokens/
│   ├── color-tokens.ts     # Color palette definitions
│   └── font-tokens.ts      # Typography tokens
└── components/
    └── text-styles.ts      # Predefined text styles
```

## Design Tokens

### Color System

Our color system is built around semantic color tokens that adapt to light and dark themes:

#### Primary Colors
- **Primary**: Main brand color used for primary actions and key UI elements
- **OnPrimary**: Text/icon color that appears on primary backgrounds
- **PrimaryContainer**: Tinted containers and less prominent primary elements
- **OnPrimaryContainer**: Text/icon color for primary containers

#### Secondary Colors  
- **Secondary**: Supporting color for secondary actions and accents
- **OnSecondary**: Text/icon color on secondary backgrounds
- **SecondaryContainer**: Secondary tinted containers
- **OnSecondaryContainer**: Text/icon color for secondary containers

#### Surface Colors
- **Surface**: Default background color for components
- **OnSurface**: Default text/icon color on surfaces
- **SurfaceVariant**: Alternative surface color for subtle differentiation
- **OnSurfaceVariant**: Text/icon color on surface variants

#### Utility Colors
- **Background**: Main app background color
- **OnBackground**: Primary text color on backgrounds
- **Error**: Error states and destructive actions
- **OnError**: Text/icon color on error backgrounds
- **Outline**: Borders and dividers
- **OutlineVariant**: Subtle borders and dividers

### Typography System

The typography system provides a complete type scale following Material Design 3 principles:

#### Display Styles (Largest)
- **displayLarge**: 57px/64px line height - Hero headlines
- **displayMedium**: 45px/52px line height - Large headers
- **displaySmall**: 36px/44px line height - Section headers

#### Headlines
- **headlineLarge**: 32px/40px line height - Page titles
- **headlineMedium**: 28px/36px line height - Card titles
- **headlineSmall**: 24px/32px line height - Subsection headers

#### Titles
- **titleLarge**: 22px/28px line height - Prominent titles
- **titleMedium**: 16px/24px line height - Medium emphasis titles
- **titleSmall**: 14px/20px line height - Small titles

#### Body Text
- **bodyLarge**: 16px/24px line height - Primary body text
- **bodyMedium**: 14px/20px line height - Secondary body text
- **bodySmall**: 12px/16px line height - Caption text

#### Labels
- **labelLarge**: 14px/20px line height - Button text
- **labelMedium**: 12px/16px line height - Form labels
- **labelSmall**: 11px/16px line height - Small labels

#### Code/Monospace
- **codeBlock**: 14px/20px line height - Code blocks
- **codeInline**: 12px/16px line height - Inline code

## Usage Examples

### Using Colors

```typescript
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme } from '@styles/theme';

// In a component
const MyComponent = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  
  return (
    <View style={{ backgroundColor: theme.surface }}>
      <Text style={{ color: theme.onSurface }}>
        Hello World
      </Text>
    </View>
  );
};
```

### Using Typography Styles

```typescript
import { textStyles } from '@styles/components/text-styles';

const MyComponent = () => {
  return (
    <View>
      <Text style={textStyles.headlineLarge}>
        Main Title
      </Text>
      <Text style={textStyles.bodyMedium}>
        This is body text with consistent styling.
      </Text>
      <Text style={textStyles.labelSmall}>
        Small label
      </Text>
    </View>
  );
};
```

### Combining Styles with Theme Colors

```typescript
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme } from '@styles/theme';
import { textStyles } from '@styles/components/text-styles';

const MyComponent = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  
  return (
    <View style={{ backgroundColor: theme.background }}>
      <Text 
        style={[
          textStyles.headlineMedium, 
          { color: theme.onBackground }
        ]}
      >
        Themed Header
      </Text>
      <Text 
        style={[
          textStyles.bodyLarge, 
          { color: theme.onSurface }
        ]}
      >
        Themed body text
      </Text>
    </View>
  );
};
```

### Creating Custom Styled Components

```typescript
import { Text as RNText, TextProps } from 'react-native';
import { textStyles } from '@styles/components/text-styles';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme } from '@styles/theme';

interface ThemedTextProps extends TextProps {
  variant?: keyof typeof textStyles;
  color?: 'primary' | 'secondary' | 'onSurface' | 'onBackground';
}

export const ThemedText: React.FC<ThemedTextProps> = ({ 
  variant = 'bodyMedium',
  color = 'onSurface',
  style,
  ...props 
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  
  return (
    <RNText
      style={[
        textStyles[variant],
        { color: theme[color] },
        style
      ]}
      {...props}
    />
  );
};

// Usage
<ThemedText variant="headlineLarge" color="primary">
  Welcome to Viki
</ThemedText>
```

## Theme Switching

The design system supports automatic theme switching based on the device's appearance:

```typescript
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme } from '@styles/theme';

// Custom hook for theme
export const useTheme = () => {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkTheme : lightTheme;
};

// In your app
const App = () => {
  const theme = useTheme();
  
  return (
    <View style={{ backgroundColor: theme.background }}>
      {/* Your app content */}
    </View>
  );
};
```

## Best Practices

### 1. Always Use Design Tokens
- ❌ Don't hardcode colors: `color: '#FF0000'`
- ✅ Use theme colors: `color: theme.error`

### 2. Use Predefined Text Styles
- ❌ Don't create custom font sizes: `fontSize: 18`
- ✅ Use text styles: `style={textStyles.titleMedium}`

### 3. Maintain Semantic Naming
- Use semantic color names (`primary`, `surface`) instead of literal names (`blue`, `gray`)
- This ensures colors can change without breaking the naming convention

### 4. Test in Both Themes
- Always test your components in both light and dark themes
- Use the device simulator to toggle between appearance modes

### 5. Extend Thoughtfully
- When adding new colors or text styles, consider if they fit the existing system
- Maintain consistency with the established patterns

## File Structure Guidelines

When adding new design tokens or styles:

1. **Colors**: Add to `color-tokens.ts` following the existing pattern
2. **Typography**: Extend `font-tokens.ts` for new font families or weights
3. **Text Styles**: Add to `text-styles.ts` following the naming convention
4. **Themes**: Update both `light-theme.ts` and `dark-theme.ts`

## Integration with Expo

The design system is fully compatible with Expo and React Native:

- Uses standard React Native `TextStyle` and `ViewStyle` types
- Compatible with Expo's theming system
- Works with `useColorScheme()` for automatic theme detection
- Supports Expo's font loading system

## Performance Considerations

- All color and typography tokens are defined as constants
- Styles are memoized and reused across components
- No runtime color calculations - all values are pre-computed
- Minimal re-renders when switching themes

