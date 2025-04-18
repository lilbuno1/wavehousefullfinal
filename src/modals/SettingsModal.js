import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function SettingsModal({
  visible,
  onClose,
  products,
  setProducts,
  onOpenCalculator,
  onExport,
  onImport,
  onBackup,
  onRestore,
  onOpenLog,
  onOpenTodo,
}) {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.box}>
          <ScrollView>
            <TouchableOpacity style={styles.menuItem} onPress={onExport}>
              <Text style={styles.menuText}>Xuất Excel sản phẩm</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={onImport}>
              <Text style={styles.menuText}>Nhập Excel sản phẩm</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={onBackup}>
              <Text style={styles.menuText}>Backup (JSON)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={onRestore}>
              <Text style={styles.menuText}>Khôi phục backup (JSON)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={onOpenLog}>
              <Text style={styles.menuText}>Xem log hoạt động</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={onOpenCalculator}>
              <Text style={styles.menuText}>Mở máy tính</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={onOpenTodo}>
              <Text style={styles.menuText}>Việc cần làm trong ngày</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, { marginTop: 24 }]} onPress={onClose}>
              <Text style={[styles.menuText, { color: '#ff003c' }]}>Đóng</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#000b', justifyContent: 'center' },
  box: { backgroundColor: '#232338', margin: 24, borderRadius: 14, padding: 18, elevation: 10 },
  menuItem: { paddingVertical: 18, borderBottomColor: '#29293e', borderBottomWidth: 1 },
  menuText: { color: '#ffe46b', fontSize: 17, fontWeight: 'bold' },
});