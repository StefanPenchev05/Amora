import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';

export default function Page() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={['#FFE5E5', '#FFF0F5', '#FFFFFF']}
      style={styles.container}
    >
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>💕</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>Welcome to Amora</Text>
      <Text style={styles.subtitle}>
        Bringing couples closer together{'\n'}
        Share moments, track moods, and celebrate your love
      </Text>

      {/* Get Started Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/(tabs)/register")}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#FF6B9D', '#FF8FAB']}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Login Link */}
      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/(tabs)/login")}>
          <Text style={styles.loginLink}>Log In</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  logo: {
    fontSize: 60,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 48,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  button: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#666',
  },
  loginLink: {
    fontSize: 14,
    color: '#FF6B9D',
    fontWeight: 'bold',
  },
});
