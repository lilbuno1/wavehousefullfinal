import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, TextInput, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

function formatVNDCurrency(val) {
  if (!val) return '';
  let str = String(val).replace(/\D/g, '');
  if (!str) return '';
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export default function EditProductModal({ item, onClose, onSave, onDelete }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [spec, setSpec] = useState('');
  const [image, setImage] = useState('');

  useEffect(() => {
    if (item) {
      setName(item.name || '');
      setPrice(item.price ? formatVNDCurrency(item.price) : '');
      setSpec(item.spec || '');
      setImage(item.image || '');
    }
  }, [item]);

  if (!item) return null;

  const handleSave = () => {
    if (!name.trim() || !price.trim()) {
      Alert.alert('Thiếu thông tin', 'Tên và giá sản phẩm là bắt buộc!');
      return;
    }
    const priceNumber = Number(price.replace(/\./g, ''));
    onSave({
      ...item,
      name: name.trim(),
      price: priceNumber,
      spec: spec.trim(),
      image: image.trim()
    });
  };

  const handleDelete = () => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa sản phẩm này?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: () => onDelete(item) }
    ]);
  };

  const handlePriceChange = (val) => {
    setPrice(formatVNDCurrency(val));
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.cancelled) {
      setImage(result.assets ? result.assets[0].uri : result.uri); // Expo SDK 48+ dùng result.assets[0].uri
    }
  };

  return (
    <Modal visible={!!item} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Sửa sản phẩm</Text>
          <TextInput
            style={styles.input}
            placeholder="Tên sản phẩm"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Giá"
            placeholderTextColor="#999"
            value={price}
            onChangeText={handlePriceChange}
            keyboardType="numeric"
            maxLength={15}
          />
          <TextInput
            style={styles.input}
            placeholder="Quy cách"
            placeholderTextColor="#999"
            value={spec}
            onChangeText={setSpec}
          />
          <View style={styles.imageRow}>
            {image ? (
              <Image source={{ uri: image }} style={styles.image} />
            ) : (
              <View style={[styles.image, { backgroundColor: '#444', justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: "#ccc", fontSize: 32 }}>?</Text>
              </View>
            )}
            <TouchableOpacity style={styles.changeImgBtn} onPress={pickImage}>
              <Text style={styles.changeImgTxt}>Đổi ảnh</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveTxt}>Lưu</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Text style={styles.deleteTxt}>Xóa</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeTxt}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#000a', justifyContent: 'center', alignItems: 'center' },
  content: { backgroundColor: '#232338', borderRadius: 12, padding: 22, width: '90%', alignItems: 'center' },
  title: { color: '#39ff14', fontWeight: 'bold', fontSize: 20, marginBottom: 12 },
  input: { color: '#fff', fontSize: 17, backgroundColor: '#181829', borderRadius: 8, width: '100%', padding: 10, marginBottom: 11 },
  imageRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  image: { width: 110, height: 110, borderRadius: 8 },
  changeImgBtn: { marginLeft: 18, backgroundColor: '#ffe46b', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 20 },
  changeImgTxt: { color: '#181829', fontWeight: 'bold', fontSize: 15 },
  btnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, width: '100%' },
  saveBtn: { backgroundColor: '#39ff14', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 22, flex: 1, marginRight: 6 },
  saveTxt: { color: '#181829', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
  deleteBtn: { backgroundColor: '#ff003c', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 22, flex: 1, marginRight: 6 },
  deleteTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
  closeBtn: { backgroundColor: '#ffe46b', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 22, flex: 1 },
  closeTxt: { color: '#181829', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
});