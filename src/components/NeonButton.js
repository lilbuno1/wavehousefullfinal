import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function NeonButton({ text, color, onPress }) {
  return (
    <TouchableOpacity style={[styles.btn, { borderColor: color, shadowColor: color }]} onPress={onPress}>
      <Text style={[styles.text, { color }]}>{text}</Text>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  btn: { borderWidth: 2, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 32, marginBottom: 8, marginTop: 6, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 5, elevation: 2, backgroundColor: '#232338' },
  text: { fontWeight: 'bold', fontSize: 17, letterSpacing: 1, textAlign: 'center' },
});