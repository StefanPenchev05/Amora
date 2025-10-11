import React from "react";
import { View, Text, ScrollView, useColorScheme } from "react-native";
import { lightTheme, darkTheme } from "@/src/styles/theme";
import { textStyles } from "@/src/styles/components/text-styles";

export default function HomeTab() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;

  const ColorCard = ({
    colorName,
    colorValue,
  }: {
    colorName: string;
    colorValue: string;
  }) => {
    // Determine text color based on background darkness
    const isDarkBackground =
      colorName === "background" ||
      colorName === "surface" ||
      colorName === "primary" ||
      colorName === "secondary";
    const textColor = isDarkBackground
      ? theme.colors.textPrimary
      : theme.colors.background;

    return (
      <View
        style={{
          backgroundColor: colorValue,
          padding: 16,
          marginVertical: 4,
          borderRadius: 8,
          minHeight: 60,
          justifyContent: "center",
          borderWidth: 1,
          borderColor: theme.colors.border,
        }}
      >
        <Text style={[textStyles.labelMedium, { color: textColor }]}>
          {colorName}
        </Text>
        <Text
          style={[textStyles.labelSmall, { color: textColor, opacity: 0.7 }]}
        >
          {colorValue}
        </Text>
      </View>
    );
  };

  const TypographyShowcase = ({
    styleName,
    styleObject,
  }: {
    styleName: string;
    styleObject: any;
  }) => (
    <View style={{ marginVertical: 8 }}>
      <Text
        style={[
          textStyles.labelSmall,
          { color: theme.colors.textMuted, marginBottom: 4 },
        ]}
      >
        {styleName}
      </Text>
      <Text style={[styleObject, { color: theme.colors.textPrimary }]}>
        The quick brown fox jumps over the lazy dog
      </Text>
    </View>
  );

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }}>
      <View style={{ padding: 20 }}>
        {/* Header */}
        <Text
          style={[
            textStyles.displayMedium,
            { color: theme.colors.textPrimary, marginBottom: 8 },
          ]}
        >
          Design System
        </Text>
        <Text
          style={[
            textStyles.bodyLarge,
            { color: theme.colors.textMuted, marginBottom: 32 },
          ]}
        >
          Showcase of colors, typography, and design tokens
        </Text>

        {/* Theme Info */}
        <View
          style={{
            backgroundColor: theme.colors.accent,
            padding: 16,
            borderRadius: theme.radius.md,
            marginBottom: 32,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Text
            style={[
              textStyles.titleMedium,
              { color: theme.colors.textPrimary, marginBottom: 4 },
            ]}
          >
            Current Theme
          </Text>
          <Text
            style={[textStyles.bodyMedium, { color: theme.colors.textMuted }]}
          >
            {colorScheme === "dark" ? "Dark Mode" : "Light Mode"} • Automatic
            detection
          </Text>
        </View>

        {/* Typography Section */}
        <Text
          style={[
            textStyles.headlineMedium,
            { color: theme.colors.textPrimary, marginBottom: 16 },
          ]}
        >
          Typography Scale
        </Text>

        <View
          style={{
            backgroundColor: theme.colors.surface,
            padding: 16,
            borderRadius: theme.radius.lg,
            marginBottom: 32,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Text
            style={[
              textStyles.titleSmall,
              { color: theme.colors.primary, marginBottom: 16 },
            ]}
          >
            Display Styles
          </Text>
          <TypographyShowcase
            styleName="displayLarge"
            styleObject={textStyles.displayLarge}
          />
          <TypographyShowcase
            styleName="displayMedium"
            styleObject={textStyles.displayMedium}
          />
          <TypographyShowcase
            styleName="displaySmall"
            styleObject={textStyles.displaySmall}
          />

          <Text
            style={[
              textStyles.titleSmall,
              { color: theme.colors.primary, marginTop: 24, marginBottom: 16 },
            ]}
          >
            Headlines
          </Text>
          <TypographyShowcase
            styleName="headlineLarge"
            styleObject={textStyles.headlineLarge}
          />
          <TypographyShowcase
            styleName="headlineMedium"
            styleObject={textStyles.headlineMedium}
          />
          <TypographyShowcase
            styleName="headlineSmall"
            styleObject={textStyles.headlineSmall}
          />

          <Text
            style={[
              textStyles.titleSmall,
              { color: theme.colors.primary, marginTop: 24, marginBottom: 16 },
            ]}
          >
            Titles
          </Text>
          <TypographyShowcase
            styleName="titleLarge"
            styleObject={textStyles.titleLarge}
          />
          <TypographyShowcase
            styleName="titleMedium"
            styleObject={textStyles.titleMedium}
          />
          <TypographyShowcase
            styleName="titleSmall"
            styleObject={textStyles.titleSmall}
          />

          <Text
            style={[
              textStyles.titleSmall,
              { color: theme.colors.primary, marginTop: 24, marginBottom: 16 },
            ]}
          >
            Body Text
          </Text>
          <TypographyShowcase
            styleName="bodyLarge"
            styleObject={textStyles.bodyLarge}
          />
          <TypographyShowcase
            styleName="bodyMedium"
            styleObject={textStyles.bodyMedium}
          />
          <TypographyShowcase
            styleName="bodySmall"
            styleObject={textStyles.bodySmall}
          />

          <Text
            style={[
              textStyles.titleSmall,
              { color: theme.colors.primary, marginTop: 24, marginBottom: 16 },
            ]}
          >
            Labels
          </Text>
          <TypographyShowcase
            styleName="labelLarge"
            styleObject={textStyles.labelLarge}
          />
          <TypographyShowcase
            styleName="labelMedium"
            styleObject={textStyles.labelMedium}
          />
          <TypographyShowcase
            styleName="labelSmall"
            styleObject={textStyles.labelSmall}
          />

          <Text
            style={[
              textStyles.titleSmall,
              { color: theme.colors.primary, marginTop: 24, marginBottom: 16 },
            ]}
          >
            Code Styles
          </Text>
          <TypographyShowcase
            styleName="codeBlock"
            styleObject={textStyles.codeBlock}
          />
          <TypographyShowcase
            styleName="codeInline"
            styleObject={textStyles.codeInline}
          />
        </View>

        {/* Color Palette Section */}
        <Text
          style={[
            textStyles.headlineMedium,
            { color: theme.colors.textPrimary, marginBottom: 16 },
          ]}
        >
          Color Palette
        </Text>

        <View style={{ marginBottom: 32 }}>
          <Text
            style={[
              textStyles.titleMedium,
              { color: theme.colors.textPrimary, marginBottom: 12 },
            ]}
          >
            Core Colors
          </Text>
          <ColorCard colorName="primary" colorValue={theme.colors.primary} />
          <ColorCard
            colorName="primaryHover"
            colorValue={theme.colors.primaryHover}
          />
          <ColorCard
            colorName="secondary"
            colorValue={theme.colors.secondary}
          />
          <ColorCard colorName="accent" colorValue={theme.colors.accent} />

          <Text
            style={[
              textStyles.titleMedium,
              {
                color: theme.colors.textPrimary,
                marginTop: 24,
                marginBottom: 12,
              },
            ]}
          >
            Surface & Background
          </Text>
          <ColorCard
            colorName="background"
            colorValue={theme.colors.background}
          />
          <ColorCard colorName="surface" colorValue={theme.colors.surface} />
          <ColorCard colorName="border" colorValue={theme.colors.border} />

          <Text
            style={[
              textStyles.titleMedium,
              {
                color: theme.colors.textPrimary,
                marginTop: 24,
                marginBottom: 12,
              },
            ]}
          >
            Text Colors
          </Text>
          <ColorCard
            colorName="textPrimary"
            colorValue={theme.colors.textPrimary}
          />
          <ColorCard
            colorName="textMuted"
            colorValue={theme.colors.textMuted}
          />

          <Text
            style={[
              textStyles.titleMedium,
              {
                color: theme.colors.textPrimary,
                marginTop: 24,
                marginBottom: 12,
              },
            ]}
          >
            Status Colors
          </Text>
          <ColorCard colorName="success" colorValue={theme.colors.success} />
          <ColorCard colorName="warning" colorValue={theme.colors.warning} />
          <ColorCard colorName="error" colorValue={theme.colors.error} />
        </View>

        {/* Interactive Examples */}
        <Text
          style={[
            textStyles.headlineMedium,
            { color: theme.colors.textPrimary, marginBottom: 16 },
          ]}
        >
          Interactive Examples
        </Text>

        {/* Card Example */}
        <View
          style={{
            backgroundColor: theme.colors.surface,
            padding: 20,
            borderRadius: theme.radius.lg,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Text
            style={[
              textStyles.titleLarge,
              { color: theme.colors.textPrimary, marginBottom: 8 },
            ]}
          >
            Sample Card Component
          </Text>
          <Text
            style={[
              textStyles.bodyMedium,
              { color: theme.colors.textMuted, marginBottom: 16 },
            ]}
          >
            This card demonstrates how surface colors and typography work
            together to create a cohesive design.
          </Text>
          <View
            style={{
              backgroundColor: theme.colors.primary,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: theme.radius.sm,
              alignSelf: "flex-start",
            }}
          >
            <Text
              style={[
                textStyles.labelMedium,
                { color: theme.colors.background },
              ]}
            >
              Primary Action
            </Text>
          </View>
        </View>

        {/* Success State Example */}
        <View
          style={{
            backgroundColor: theme.colors.success,
            padding: 16,
            borderRadius: theme.radius.md,
            marginBottom: 16,
          }}
        >
          <Text
            style={[
              textStyles.titleMedium,
              { color: theme.colors.textPrimary, marginBottom: 4 },
            ]}
          >
            Success State
          </Text>
          <Text
            style={[textStyles.bodyMedium, { color: theme.colors.textPrimary }]}
          >
            This demonstrates success colors with proper contrast ratios.
          </Text>
        </View>

        {/* Error State Example */}
        <View
          style={{
            backgroundColor: theme.colors.error,
            padding: 16,
            borderRadius: theme.radius.md,
            marginBottom: 16,
          }}
        >
          <Text
            style={[
              textStyles.titleMedium,
              { color: theme.colors.background, marginBottom: 4 },
            ]}
          >
            Error State
          </Text>
          <Text
            style={[textStyles.bodyMedium, { color: theme.colors.background }]}
          >
            This demonstrates error colors with proper contrast ratios for
            accessibility.
          </Text>
        </View>

        {/* Spacing & Typography Example */}
        <View
          style={{
            backgroundColor: theme.colors.surface,
            padding: theme.spacing[6],
            borderRadius: theme.radius.lg,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Text
            style={[
              textStyles.headlineSmall,
              {
                color: theme.colors.textPrimary,
                marginBottom: theme.spacing[4],
              },
            ]}
          >
            Design Tokens in Action
          </Text>
          <Text
            style={[
              textStyles.bodyMedium,
              { color: theme.colors.textMuted, marginBottom: theme.spacing[3] },
            ]}
          >
            This example uses:
          </Text>
          <Text
            style={[textStyles.bodySmall, { color: theme.colors.textMuted }]}
          >
            • Spacing tokens: {theme.spacing[6]}px padding, {theme.spacing[4]}px
            margins{"\n"}• Border radius: {theme.radius.lg}px{"\n"}• Typography:
            headlineSmall, bodyMedium, bodySmall{"\n"}• Colors: surface,
            textPrimary, textMuted, border
          </Text>
        </View>

        {/* WCAG AA Compliance Section */}
        <Text
          style={[
            textStyles.headlineMedium,
            { color: theme.colors.textPrimary, marginBottom: 16 },
          ]}
        >
          WCAG AA Compliance
        </Text>

        <View
          style={{
            backgroundColor: theme.colors.surface,
            padding: 20,
            borderRadius: theme.radius.lg,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Text
            style={[
              textStyles.titleMedium,
              { color: theme.colors.textPrimary, marginBottom: 12 },
            ]}
          >
            ✅ Accessibility Improvements
          </Text>
          
          <Text
            style={[
              textStyles.bodyMedium,
              { color: theme.colors.textMuted, marginBottom: 16 },
            ]}
          >
            All color combinations now meet WCAG AA standards (4.5:1 contrast ratio):
          </Text>

          {/* Text Muted Example */}
          <View style={{ marginBottom: 16 }}>
            <Text style={[textStyles.labelSmall, { color: theme.colors.primary }]}>
              Text Muted (Fixed)
            </Text>
            <Text style={[textStyles.bodyMedium, { color: theme.colors.textMuted }]}>
              Improved from #A1A1AA to #4B5563 for 4.5:1 contrast ratio
            </Text>
          </View>

          {/* On-Brand Colors */}
          <Text style={[textStyles.labelSmall, { color: theme.colors.primary, marginBottom: 8 }]}>
            Brand Button Examples (WCAG AA Compliant)
          </Text>
          
          {/* Primary Button Demo */}
          <View
            style={{
              backgroundColor: theme.colors.primary,
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: theme.radius.md,
              marginBottom: 8,
            }}
          >
            <Text
              style={[
                textStyles.labelMedium,
                { 
                  color: theme.colors.onPrimary, 
                  textAlign: 'center' 
                },
              ]}
            >
              Primary Button ({colorScheme === 'dark' ? '≈9.3:1' : '≈6-7:1'} contrast)
            </Text>
          </View>

          {/* Secondary Button Demo */}
          <View
            style={{
              backgroundColor: theme.colors.secondary,
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: theme.radius.md,
              marginBottom: 8,
            }}
          >
            <Text
              style={[
                textStyles.labelMedium,
                { 
                  color: theme.colors.onSecondary, 
                  textAlign: 'center' 
                },
              ]}
            >
              Secondary Button ({colorScheme === 'dark' ? '≈9.3:1' : '≈6-7:1'} contrast)
            </Text>
          </View>

          {/* Accent Button Demo */}
          <View
            style={{
              backgroundColor: theme.colors.accent,
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: theme.radius.md,
              marginBottom: 16,
            }}
          >
            <Text
              style={[
                textStyles.labelMedium,
                { 
                  color: theme.colors.onAccent, 
                  textAlign: 'center' 
                },
              ]}
            >
              Accent Button (High contrast)
            </Text>
          </View>

          <Text
            style={[
              textStyles.bodySmall,
              { color: theme.colors.textMuted },
            ]}
          >
            💡 All buttons now use "on-*" color tokens for optimal readability
          </Text>
        </View>

        {/* New Color Tokens Section */}
        <View
          style={{
            backgroundColor: theme.colors.surface,
            padding: 20,
            borderRadius: theme.radius.lg,
            marginBottom: 32,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Text
            style={[
              textStyles.titleMedium,
              { color: theme.colors.textPrimary, marginBottom: 12 },
            ]}
          >
            🎯 New WCAG AA Color Tokens
          </Text>
          
          <View style={{ marginBottom: 12 }}>
            <Text style={[textStyles.labelSmall, { color: theme.colors.primary }]}>
              onPrimary
            </Text>
            <ColorCard colorName="onPrimary" colorValue={theme.colors.onPrimary} />
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={[textStyles.labelSmall, { color: theme.colors.primary }]}>
              onSecondary
            </Text>
            <ColorCard colorName="onSecondary" colorValue={theme.colors.onSecondary} />
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={[textStyles.labelSmall, { color: theme.colors.primary }]}>
              onAccent
            </Text>
            <ColorCard colorName="onAccent" colorValue={theme.colors.onAccent} />
          </View>

          <Text
            style={[
              textStyles.bodySmall,
              { color: theme.colors.textMuted },
            ]}
          >
            These tokens ensure text is always readable on colored backgrounds
          </Text>
        </View>

        {/* Footer */}
        <View
          style={{
            backgroundColor: theme.colors.accent,
            padding: 16,
            borderRadius: theme.radius.md,
            marginBottom: 40,
          }}
        >
          <Text
            style={[
              textStyles.bodySmall,
              { color: theme.colors.onAccent, textAlign: "center" },
            ]}
          >
            🎨 Design System • WCAG AA Compliant • Toggle your device's appearance to see theme switching in action
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
