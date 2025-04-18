import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

// Sinh mã hàng: KD + số thứ tự 4 số, tăng dần
function generateProductCode(products) {
  let maxIndex = 1;
  if (Array.isArray(products) && products.length > 0) {
    products.forEach(p => {
      if (p.code && /^KD\d+$/.test(p.code)) {
        const num = parseInt(p.code.replace('KD', ''), 10);
        if (!isNaN(num) && num >= maxIndex) maxIndex = num + 1;
      }
    });
    if (maxIndex === 1) maxIndex = products.length + 1;
  }
  return `KD${maxIndex.toString().padStart(4, '0')}`;
}

export default function AddProductScreen({ onAddProduct, onCancel, products = [] }) {
  const [code, setCode] = useState(generateProductCode(products));
  useEffect(() => {
    setCode(generateProductCode(products));
  }, [products]);

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleAdd = () => {
    if (!name.trim() || !quantity.trim()) return;
    onAddProduct({
      code,
      name,
      quantity: Number(quantity),
      desc,
      date
    });
    setName('');
    setQuantity('');
    setDesc('');
    setDate(new Date());
    setCode(generateProductCode([...products, { code }]));
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#191932" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Ionicons name="cube-outline" size={38} color="#39ff14" style={{marginRight:10}} />
          <Text style={styles.headerText}>Thêm Sản Phẩm Mới</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Mã Hàng</Text>
          <View style={styles.codeRow}>
            <TextInput
              style={[styles.input, { flex: 1, color: "#39ff14", fontWeight: "bold" }]}
              value={code}
              editable={false}
              selectTextOnFocus={false}
            />
          </View>

          <Text style={styles.label}>Tên sản phẩm</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập tên sản phẩm"
            placeholderTextColor="#aafac8"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Số lượng</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập số lượng"
            placeholderTextColor="#aafac8"
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
          />

          <Text style={styles.label}>Ngày nhập hàng</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="calendar-outline" size={18} color="#39ff14" style={{ marginRight: 6 }} />
            <Text style={styles.dateTextShow}>{date.toLocaleDateString()}</Text>
            <Text style={styles.dateEditHint}>(Chạm để đổi)</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(_, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
              locale="vi-VN"
            />
          )}

          <Text style={styles.label}>Mô tả (tuỳ chọn)</Text>
          <TextInput
            style={[styles.input, { minHeight: 48, textAlignVertical: "top" }]}
            placeholder="Thêm ghi chú, mô tả, v.v..."
            placeholderTextColor="#aafac8"
            value={desc}
            onChangeText={setDesc}
            multiline
          />

          <TouchableOpacity
            style={[
              styles.addButton,
              !name.trim() || !quantity.trim() ? styles.addButtonDisabled : null,
            ]}
            onPress={handleAdd}
            disabled={!name.trim() || !quantity.trim()}
          >
            <Ionicons name="checkmark-circle" size={22} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.addButtonText}>Lưu sản phẩm</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
            <Ionicons name="close-circle-outline" size={19} color="#ff3c6f" style={{ marginRight: 4 }} />
            <Text style={styles.cancelBtnText}>Huỷ</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    alignItems: "center",
    backgroundColor: "#191932",
    flexGrow: 1,
    justifyContent: "center"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
    marginTop: 26,
    alignSelf: "center",
  },
  headerText: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#39ff14",
    textShadowColor: "#222",
    textShadowRadius: 10,
    letterSpacing: 1.2,
  },
  form: {
    width: "100%",
    backgroundColor: "#232348",
    borderRadius: 14,
    padding: 18,
    shadowColor: "#00e0ff",
    shadowOpacity: 0.09,
    shadowRadius: 9,
    elevation: 5,
  },
  label: {
    color: "#ffe46b",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 7,
    marginTop: 14,
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 1,
  },
  input: {
    backgroundColor: "#1e1e2f",
    color: "#fff",
    borderRadius: 9,
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 3,
    borderWidth: 1.5,
    borderColor: "#39ff14",
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e1e2f",
    borderRadius: 9,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1.5,
    borderColor: "#39ff14",
    marginBottom: 3,
  },
  dateTextShow: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  dateEditHint: {
    color: "#aafac8",
    fontSize: 12,
    fontStyle: "italic",
  },
  addButton: {
    flexDirection: "row",
    backgroundColor: "#39ff14",
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 5,
    shadowColor: "#39ff14",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  addButtonDisabled: {
    backgroundColor: "#444",
    shadowColor: "#222",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    letterSpacing: 1.1,
  },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    alignSelf: "center",
    padding: 7,
  },
  cancelBtnText: {
    color: "#ff3c6f",
    fontSize: 15,
    fontWeight: "bold",
    marginLeft: 2,
  },
});