import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function Page() {
  const router = useRouter();

    useEffect(() => {
      throw new Error("Just testing the error boundry")
    }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wellcome to Amora</Text>
      <Text style={styles.subtitle}>Bringing couples closer together</Text>

      <Pressable
        style={styles.button}
        onPress={() => router.push("/(tabs)/designTutorial")}
      >
        <Text style={styles.buttonText}> Design Tutorial </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#f4511e",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
