import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, TextInputProps } from 'react-native';

type Props = TextInputProps & {
  label?: string;
  error?: string | null;
};

const PasswordField: React.FC<Props> = ({ label, error, style, ...inputProps }) => {
  const [visible, setVisible] = useState(false);
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.row}>
        <TextInput
          {...inputProps}
          secureTextEntry={!visible}
          style={[styles.input, style]}
        />
        <TouchableOpacity onPress={() => setVisible((v) => !v)} style={styles.toggle}>
          <Text style={styles.toggleText}>{visible ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: { fontSize: 13, color: '#222', marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E6E9EE',
    backgroundColor: '#fff',
  },
  toggle: { marginLeft: 10, padding: 8 },
  toggleText: { color: '#1E88E5', fontWeight: '600' },
  error: { color: '#C0392B', marginTop: 6, fontSize: 12 },
});

export default PasswordField;
