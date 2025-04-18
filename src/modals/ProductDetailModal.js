import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import ImageView from "react-native-image-viewing";
import { formatVNDCurrency } from '../utils/format';

export default function ProductDetailModal({ visible, item, onClose }) {
  const [showImageZoom, setShowImageZoom] = useState(false);

  if (!item) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Chi tiết sản phẩm</Text>
          {item.image ? (
            <>
              <TouchableOpacity onPress={() => setShowImageZoom(true)}>
                <Image source={{ uri: item.image }} style={styles.image} />
              </TouchableOpacity>
              <ImageView
                images={[{ uri: item.image }]}
                imageIndex={0}
                visible={showImageZoom}
                onRequestClose={() => setShowImageZoom(false)}
              />
            </>
          ) : (
            <View style={[styles.image, { backgroundColor: "#444", justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={{ color: "#fff", fontSize: 32 }}>?</Text>
            </View>
          )}
          <Text style={styles.infoLabel}>
            <Text style={styles.boldLabel}>Tên sản phẩm: </Text>
            <Text style={styles.infoText}>{item.name}</Text>
          </Text>
          <Text style={styles.infoLabel}>
            <Text style={styles.boldLabel}>Giá: </Text>
            <Text style={styles.price}>{formatVNDCurrency(item.price)}</Text>
          </Text>
          <Text style={styles.infoLabel}>
            <Text style={styles.boldLabel}>Quy cách: </Text>
            <Text style={styles.spec}>{item.spec}</Text>
          </Text>
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
  content: { backgroundColor: '#232338', borderRadius: 12, padding: 24, width: '85%', alignItems: 'center' },
  title: { color: '#39ff14', fontWeight: 'bold', fontSize: 19, marginBottom: 10, alignSelf: 'center' },
  image: { width: 160, height: 160, borderRadius: 14, marginBottom: 18, backgroundColor: '#292941' },
  infoLabel: { color: '#fff', fontSize: 16, marginBottom: 8, textAlign: 'center' },
  boldLabel: { fontWeight: 'bold', color: '#ffe46b' },
  infoText: { color: '#fff', fontSize: 16 },
  price: { color: '#39ff14', fontWeight: 'bold', fontSize: 18 },
  spec: { color: '#ffe46b', fontSize: 16 },
  closeBtn: { backgroundColor: '#ff3c6f', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 34, marginTop: 12 },
  closeTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});