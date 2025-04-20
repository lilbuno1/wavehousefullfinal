import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import * as Updates from 'expo-updates';

const { width } = Dimensions.get('window');
const basePadding = Math.round(width * 0.04);
const baseRadius = Math.round(width * 0.035);

export default function SettingsModal({
  visible,
  onClose,
  onOpenCalculator,
  onOpenLog,
  onOpenTodo,
  onExport,
  onImport,
  onBackup,
  onRestore,
  onBankAccount
}) {
  const handleCheckUpdate = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        alert('Đã có phiên bản mới! App sẽ tải lại để cập nhật.');
        Updates.reloadAsync();
      } else {
        alert('Bạn đang dùng phiên bản mới nhất.');
      }
    } catch (e) {
      alert('Báo kiểm tra cập nhật thất bại, vui lòng thử lại sau.');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Cài đặt</Text>
          <ScrollView contentContainerStyle={{ paddingVertical: basePadding / 2 }}>
            <TouchableOpacity style={styles.itemBtn} onPress={onOpenCalculator}>
              <Text style={styles.itemText}>Máy tính</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.itemBtn} onPress={onOpenLog}>
              <Text style={styles.itemText}>Lịch sử hoạt động</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.itemBtn} onPress={onOpenTodo}>
              <Text style={styles.itemText}>Ghi chú/Todo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.itemBtn} onPress={onBankAccount}>
              <Text style={styles.itemText}>Thêm tài khoản ngân hàng</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.itemBtn} onPress={handleCheckUpdate}>
              <Text style={[styles.itemText, { color: '#ff003c', fontWeight: 'bold' }]}>
                Cập nhật phiên bản
              </Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.itemBtn} onPress={onExport}>
              <Text style={styles.itemText}>Xuất file Excel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.itemBtn} onPress={onImport}>
              <Text style={styles.itemText}>Nhập file Excel</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.itemBtn} onPress={onBackup}>
              <Text style={styles.itemText}>Sao lưu (Backup) JSON</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.itemBtn} onPress={onRestore}>
              <Text style={styles.itemText}>Khôi phục từ JSON</Text>
            </TouchableOpacity>
          </ScrollView>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '90%',
    maxWidth: 420,
    backgroundColor: '#232338',
    borderRadius: baseRadius * 1.2,
    padding: basePadding * 1.1,
    elevation: 10,
    alignItems: 'stretch',
  },
  title: {
    color: '#39ff14',
    fontWeight: 'bold',
    fontSize: Math.round(width * 0.058),
    textAlign: 'center',
    marginBottom: basePadding,
  },
  itemBtn: {
    backgroundColor: '#181829',
    borderRadius: baseRadius * 0.9,
    paddingVertical: basePadding * 0.7,
    marginBottom: basePadding * 0.7,
    alignItems: 'center',
  },
  itemText: {
    color: '#ffe46b',
    fontSize: Math.round(width * 0.045),
    fontWeight: '600',
  },
  closeBtn: {
    backgroundColor: '#39ff14',
    paddingVertical: basePadding * 0.7,
    borderRadius: baseRadius,
    marginTop: 6,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#181829',
    fontWeight: 'bold',
    fontSize: Math.round(width * 0.045),
  },
  divider: {
    height: 1,
    backgroundColor: '#444',
    marginVertical: basePadding * 0.3,
    borderRadius: 1,
  },
});