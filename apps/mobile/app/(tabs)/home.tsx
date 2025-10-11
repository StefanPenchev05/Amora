import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Later: import { HomeScreen } from '@/screens/home/HomeScreen';

export default function HomeTab() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Feed</Text>
      <Text>Your relationship timeline goes here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});