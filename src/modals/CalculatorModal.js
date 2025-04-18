import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, TextInput, Dimensions } from 'react-native';

const buttons = [
  ['C', '(', ')', '/'],
  ['7', '8', '9', '*'],
  ['4', '5', '6', '-'],
  ['1', '2', '3', '+'],
  ['0', '.', '=', '%'],
];

export default function CalculatorModal({ visible, onClose }) {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');

  const handlePress = (val) => {
    if (val === 'C') {
      setExpression('');
      setResult('');
    } else if (val === '=') {
      try {
        // eslint-disable-next-line no-eval
        let evalResult = eval(expression.replace(/%/g, '/100'));
        setResult(evalResult.toString());
      } catch {
        setResult('Lỗi');
      }
    } else {
      setExpression(expression + val);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.calculator}>
          <Text style={styles.calculatorTitle}>MÁY TÍNH</Text>
          <TextInput
            style={styles.input}
            value={expression}
            editable={false}
            placeholder="Nhập phép tính"
            placeholderTextColor="#888"
            textAlign="right"
          />
          <Text style={styles.result}>{result}</Text>
          <View style={styles.buttonGrid}>
            {buttons.map((row, i) => (
              <View style={styles.buttonRow} key={i}>
                {row.map(btn => (
                  <TouchableOpacity
                    style={[
                      styles.button,
                      btn === '=' ? styles.equalBtn : btn === 'C' ? styles.clearBtn : {},
                    ]}
                    key={btn}
                    onPress={() => handlePress(btn)}
                  >
                    <Text style={[
                      styles.buttonText,
                      btn === '=' ? styles.equalText : btn === 'C' ? styles.clearText : {},
                    ]}>
                      {btn}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeTxt}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const { width } = Dimensions.get('window');
const calcWidth = width > 340 ? 320 : width * 0.95;

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#000a', justifyContent: 'center', alignItems: 'center' },
  calculator: { width: calcWidth, backgroundColor: '#232338', borderRadius: 18, padding: 18, alignItems: 'center', elevation: 6 },
  calculatorTitle: { color: '#39ff14', fontWeight: 'bold', fontSize: 20, marginBottom: 4, letterSpacing: 2 },
  input: { backgroundColor: '#181829', color: '#fff', fontSize: 22, borderRadius: 10, width: '100%', padding: 12, marginBottom: 6, marginTop: 7 },
  result: { color: '#ffe46b', fontWeight: 'bold', fontSize: 22, alignSelf: 'flex-end', marginBottom: 10 },
  buttonGrid: { width: '100%', marginTop: 5 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  button: { flex: 1, marginHorizontal: 4, backgroundColor: '#28283d', paddingVertical: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  equalBtn: { backgroundColor: '#39ff14' },
  equalText: { color: '#181829' },
  clearBtn: { backgroundColor: '#ff3c6f' },
  clearText: { color: '#fff' },
  closeBtn: { backgroundColor: '#ffe46b', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 44, marginTop: 18 },
  closeTxt: { color: '#181829', fontWeight: 'bold', fontSize: 16 }
});