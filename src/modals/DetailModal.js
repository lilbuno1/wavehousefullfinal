import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Switch } from 'react-native';

export default function DetailModal({ visible, item, onClose, onMarkOutOfStock }) {
  if (!item) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Chi tiết sản phẩm</Text>
          <Text style={styles.label}>Tên:</Text>
          <Text style={styles.value}>{item.name}</Text>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Hết hàng:</Text>
            <Switch
              value={!!item.outOfStock}
              onValueChange={value => onMarkOutOfStock(item, value)}
            />
          </View>
          {item.outOfStock && (
            <Text style={{ color: '#ff3c6f', fontWeight: 'bold', marginTop: 8 }}>(Sản phẩm này đang hết hàng)</Text>
          )}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeTxt}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#000a', justifyContent: 'center', alignItems: 'center' },
  content: { backgroundColor: '#232338', borderRadius: 12, padding: 18, width: '88%', alignItems: 'flex-start', elevation: 10 },
  title: { color: '#39ff14', fontWeight: 'bold', fontSize: 17, alignSelf: 'center', marginBottom: 10 },
  label: { color: '#ffe46b', fontWeight: 'bold', fontSize: 14, marginTop: 7 },
  value: { color: '#fff', fontSize: 16, marginBottom: 2 },
  switchRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 4 },
  closeBtn: { marginTop: 16, backgroundColor: '#ff3c6f', paddingVertical: 7, paddingHorizontal: 24, borderRadius: 10, alignSelf: 'center' },
  closeTxt: { color: '#fff', fontWeight: 'bold', fontSize: 15 }
});