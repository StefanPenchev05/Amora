import { Component, ErrorInfo, ReactNode } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions, Animated } from "react-native";
import { lightTheme } from "@/src/styles/theme";
import { textStyles } from "@/src/styles/components/text-styles";
import { designTokens } from "@/src/styles/tokens/design-tokens";

type Props = { 
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  fallbackTitle?: string;
  fallbackMessage?: string;
};

type State = { 
  hasError: boolean;
  error: Error | null;
  retryCount: number;
};

const { width } = Dimensions.get('window');

export class ErrorBoundary extends Component<Props, State> {
  private readonly fadeAnim = new Animated.Value(0);
  private readonly bounceAnim = new Animated.Value(0);
  private readonly rotateAnim = new Animated.Value(0);
  private readonly pulseAnim = new Animated.Value(1);
  private readonly floatAnim = new Animated.Value(0);
  private readonly particleAnims = Array.from({ length: 6 }, () => ({
    x: new Animated.Value(0),
    y: new Animated.Value(0),
    opacity: new Animated.Value(0),
    scale: new Animated.Value(0),
  }));

  state: State = { 
    hasError: false, 
    error: null,
    retryCount: 0
  };

  static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      retryCount: 0
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught error:", error);
    console.error("Component stack:", errorInfo.componentStack);
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
    
    // Start creative animation sequence
    this.startCreativeAnimations();
  }

  startCreativeAnimations = () => {
    // Main fade in
    Animated.timing(this.fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Bounce effect for icon
    Animated.sequence([
      Animated.timing(this.bounceAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(this.bounceAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous rotation for background elements
    Animated.loop(
      Animated.timing(this.rotateAnim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();

    // Pulsing effect for error icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(this.pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(this.pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Floating effect for main content
    Animated.loop(
      Animated.sequence([
        Animated.timing(this.floatAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(this.floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Particle animations
    this.particleAnims.forEach((particle, index) => {
      const delay = index * 200;
      
      setTimeout(() => {
        // Random positions around the screen
        const randomX = (Math.random() - 0.5) * width * 0.8;
        const randomY = (Math.random() - 0.5) * 400;
        
        Animated.parallel([
          Animated.timing(particle.opacity, {
            toValue: 0.3,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(particle.scale, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(particle.x, {
            toValue: randomX,
            duration: 2000 + Math.random() * 1000,
            useNativeDriver: true,
          }),
          Animated.timing(particle.y, {
            toValue: randomY,
            duration: 2000 + Math.random() * 1000,
            useNativeDriver: true,
          }),
        ]).start();

        // Loop the particle movement
        Animated.loop(
          Animated.sequence([
            Animated.timing(particle.x, {
              toValue: randomX + (Math.random() - 0.5) * 100,
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.timing(particle.x, {
              toValue: randomX,
              duration: 3000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }, delay);
    });
  };

  handleRetry = () => {
    this.setState(prevState => ({ 
      hasError: false, 
      error: null,
      retryCount: prevState.retryCount + 1
    }));
    
    // Reset animation
    this.fadeAnim.setValue(0);
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const theme = lightTheme; // You can add theme switching logic here
    const { fallbackTitle, fallbackMessage } = this.props;
    const { error, retryCount } = this.state;

    const isDevelopment = __DEV__;

    return (
      <Animated.View 
        style={[
          styles.container, 
          { 
            backgroundColor: theme.colors.background,
            opacity: this.fadeAnim 
          }
        ]}
      >
        {/* Background Pattern */}
        <View style={[styles.backgroundPattern, { backgroundColor: theme.colors.surface }]} />
        
        <View style={styles.content}>
          {/* Error Icon */}
          <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.error}15` }]}>
            <View style={[styles.iconInner, { backgroundColor: theme.colors.error }]}>
              <Text style={styles.iconText}>⚠️</Text>
            </View>
          </View>

          {/* Error Content */}
          <View style={styles.textContainer}>
            <Text style={[
              textStyles.headlineMedium, 
              { color: theme.colors.textPrimary, textAlign: 'center' }
            ]}>
              {fallbackTitle || "Oops! Something went wrong"}
            </Text>

            <Text style={[
              textStyles.bodyLarge, 
              { 
                color: theme.colors.textMuted, 
                textAlign: 'center',
                lineHeight: 24,
                marginTop: designTokens.spacing.md
              }
            ]}>
              {fallbackMessage || 
                "We're sorry for the inconvenience. The app encountered an unexpected error, but don't worry - we're here to help you get back on track."}
            </Text>

            {/* Retry Count Indicator */}
            {retryCount > 0 && (
              <View style={[styles.retryBadge, { backgroundColor: `${theme.colors.primary}20` }]}>
                <Text style={[
                  textStyles.labelSmall, 
                  { color: theme.colors.primary }
                ]}>
                  Retry attempt: {retryCount}
                </Text>
              </View>
            )}
          </View>

          {/* Development Error Details */}
          {isDevelopment && error && (
            <View style={[
              styles.errorDetails, 
              { 
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border
              }
            ]}>
              <Text style={[
                textStyles.labelMedium, 
                { color: theme.colors.error, marginBottom: designTokens.spacing.xs }
              ]}>
                🔧 Development Error Details:
              </Text>
              <Text style={[
                textStyles.bodySmall, 
                { 
                  color: theme.colors.textMuted,
                  fontFamily: 'monospace',
                  lineHeight: 18
                }
              ]}>
                {error.message}
              </Text>
              {error.stack && (
                <Text style={[
                  textStyles.bodySmall, 
                  { 
                    color: theme.colors.textMuted,
                    fontFamily: 'monospace',
                    fontSize: 10,
                    marginTop: designTokens.spacing.xs,
                    opacity: 0.8
                  }
                ]} 
                numberOfLines={3}
                >
                  {error.stack}
                </Text>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                { 
                  backgroundColor: theme.colors.primary,
                  transform: [{ scale: pressed ? 0.98 : 1 }]
                }
              ]}
              onPress={this.handleRetry}
              android_ripple={{ color: theme.colors.primaryHover }}
            >
              <Text style={[
                textStyles.labelLarge, 
                { color: theme.colors.onPrimary, fontWeight: '600' }
              ]}>
                🔄 Try Again
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                { 
                  borderColor: theme.colors.border,
                  backgroundColor: pressed ? theme.colors.surface : 'transparent'
                }
              ]}
              onPress={() => {
                // You can add navigation to home or report functionality here
                console.log('Report error or navigate to safe screen');
              }}
            >
              <Text style={[
                textStyles.labelMedium, 
                { color: theme.colors.primary }
              ]}>
                📞 Report Issue
              </Text>
            </Pressable>
          </View>

          {/* Footer */}
          <Text style={[
            textStyles.bodySmall, 
            { 
              color: theme.colors.textMuted, 
              textAlign: 'center',
              marginTop: designTokens.spacing.lg,
              opacity: 0.7
            }
          ]}>
            Error ID: {Date.now().toString(36).toUpperCase()}
          </Text>
        </View>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    opacity: 0.1,
    transform: [{ skewY: '-3deg' }],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: designTokens.spacing.xl,
    paddingHorizontal: designTokens.spacing.lg,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: designTokens.spacing.xl,
  },
  iconInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 36,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: designTokens.spacing.xxl,
    maxWidth: width - (designTokens.spacing.xl * 2),
  },
  retryBadge: {
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.xs,
    borderRadius: designTokens.borderRadius.xl,
    marginTop: designTokens.spacing.md,
  },
  errorDetails: {
    marginBottom: designTokens.spacing.xl,
    padding: designTokens.spacing.md,
    borderRadius: designTokens.borderRadius.md,
    borderWidth: 1,
    width: '100%',
    maxWidth: width - (designTokens.spacing.xl * 2),
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    gap: designTokens.spacing.md,
  },
  primaryButton: {
    paddingVertical: designTokens.spacing.md,
    paddingHorizontal: designTokens.spacing.xl,
    borderRadius: designTokens.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButton: {
    paddingVertical: designTokens.spacing.md,
    paddingHorizontal: designTokens.spacing.xl,
    borderRadius: designTokens.borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
