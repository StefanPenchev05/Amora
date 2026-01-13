import React from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet } from 'react-native';

type Props = TextInputProps & {
  label?: string;
  error?: string | null;
};

const TextField: React.FC<Props> = ({ label, error, style, ...inputProps }) => {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput {...inputProps} style={[styles.input, style]} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: { fontSize: 13, color: '#222', marginBottom: 6 },
  input: {
    height: 46,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E6E9EE',
    backgroundColor: '#fff',
  },
  error: { color: '#C0392B', marginTop: 6, fontSize: 12 },
});

export default TextField;
