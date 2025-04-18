import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Chức năng Import Excel (demo UI, bạn cần tích hợp thư viện đọc Excel thực tế)
export default function ImportExcelModal({ visible, onClose }) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>📥 Import từ Excel</Text>
          <Text style={{ textAlign: 'center', marginVertical: 12 }}>
            (Tính năng này cho phép bạn chọn file Excel và nhập dữ liệu vào app)
          </Text>
          {/* Nút chọn file excel sẽ tích hợp thực tế bằng expo-document-picker hoặc react-native-document-picker */}
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Chọn file Excel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={{ color: "#ff003c", fontWeight: "bold" }}>ĐÓNG</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "#000a", justifyContent: "center", alignItems: "center" },
  container: { backgroundColor: "#fff", borderRadius: 12, width: "80%", padding: 20, alignItems: "center" },
  title: { color: "#39ff14", fontWeight: "bold", fontSize: 22, marginBottom: 16 },
  actionBtn: { backgroundColor: "#39ff14", borderRadius: 8, paddingHorizontal: 24, paddingVertical: 14, marginVertical: 10 },
  closeBtn: { backgroundColor: "#ffe46b44", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginTop: 16 }
});