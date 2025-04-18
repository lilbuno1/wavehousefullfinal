import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Giao diện mẫu cho Sao lưu & Khôi phục
export default function BackupRestoreModal({ visible, onClose }) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>🗂️ Sao lưu & Khôi phục</Text>
          <Text style={{ textAlign: 'center', marginVertical: 12 }}>
            - Sao lưu: Lưu toàn bộ thông tin sản phẩm và hình ảnh thành file ZIP.{"\n"}
            - Khôi phục: Chọn file ZIP để khôi phục lại dữ liệu và hình ảnh.
          </Text>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Tạo file sao lưu (ZIP)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Chọn file ZIP để khôi phục</Text>
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
  container: { backgroundColor: "#fff", borderRadius: 12, width: "85%", padding: 20, alignItems: "center" },
  title: { color: "#39ff14", fontWeight: "bold", fontSize: 22, marginBottom: 16 },
  actionBtn: { backgroundColor: "#39ff14", borderRadius: 8, paddingHorizontal: 24, paddingVertical: 14, marginVertical: 10 },
  closeBtn: { backgroundColor: "#ffe46b44", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginTop: 16 }
});