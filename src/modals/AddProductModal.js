import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TextInput, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import ImageView from "react-native-image-viewing";
import { formatVNDCurrencyInput } from '../utils/format';

export default function AddProductModal({ visible, onClose, onAdd }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [spec, setSpec] = useState('');
  const [image, setImage] = useState('');
  const [showImageZoom, setShowImageZoom] = useState(false);

  const reset = () => {
    setName('');
    setPrice('');
    setSpec('');
    setImage('');
  };

  const handleAdd = () => {
    if (!name) {
      alert('Vui lòng nhập tên sản phẩm!');
      return;
    }
    onAdd({
      id: Date.now(),
      name,
      price: price.replace(/\D/g, ''),
      spec,
      image,
      outOfStock: false
    });
    reset();
  };

  // Chọn ảnh từ thiết bị
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Bạn cần cấp quyền truy cập thư viện ảnh để chọn hình!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
      base64: false,
    });
    if (!result.canceled && result.assets && result.assets[0]?.uri) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Thêm sản phẩm mới</Text>
          <Text style={styles.label}>Tên sản phẩm:</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Nhập tên sản phẩm"
            placeholderTextColor="#aaa"
          />
          <Text style={styles.label}>Giá:</Text>
          <TextInput
            style={styles.input}
            value={formatVNDCurrencyInput(price)}
            onChangeText={text => setPrice(text.replace(/\D/g, ''))}
            placeholder="Nhập giá"
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            maxLength={15}
          />
          <Text style={styles.label}>Quy cách:</Text>
          <TextInput
            style={styles.input}
            value={spec}
            onChangeText={setSpec}
            placeholder="Nhập quy cách"
            placeholderTextColor="#aaa"
          />
          <Text style={styles.label}>Hình ảnh sản phẩm:</Text>
          <View style={styles.imageBox}>
            {image
              ? (
                <>
                  <TouchableOpacity onPress={() => setShowImageZoom(true)}>
                    <Image source={{ uri: image }} style={styles.imagePreview} />
                  </TouchableOpacity>
                  <ImageView
                    images={[{ uri: image }]}
                    imageIndex={0}
                    visible={showImageZoom}
                    onRequestClose={() => setShowImageZoom(false)}
                  />
                </>
              )
              : <Text style={styles.noImage}>Chưa có hình</Text>
            }
            <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
              <Text style={styles.imageBtnTxt}>{image ? 'Đổi hình' : 'Chọn hình'}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 18 }}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
              <Text style={styles.saveTxt}>Thêm</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtn} onPress={() => { onClose(); reset(); }}>
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
  content: { backgroundColor: '#232338', borderRadius: 12, padding: 18, width: '88%', alignItems: 'flex-start', elevation: 10 },
  title: { color: '#39ff14', fontWeight: 'bold', fontSize: 18, alignSelf: 'center', marginBottom: 10 },
  label: { color: '#ffe46b', fontWeight: 'bold', fontSize: 14, marginTop: 10 },
  input: {
    width: '100%',
    borderRadius: 7,
    backgroundColor: '#292941',
    color: '#fff',
    paddingVertical: 7,
    paddingHorizontal: 13,
    fontSize: 15,
    marginTop: 5
  },
  imageBox: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  imagePreview: { width: 58, height: 58, borderRadius: 9, marginRight: 14, backgroundColor: '#292941' },
  noImage: { color: '#aaa', fontSize: 13, marginRight: 14 },
  imageBtn: { backgroundColor: '#39ff14', borderRadius: 8, paddingVertical: 7, paddingHorizontal: 14 },
  imageBtnTxt: { color: '#181829', fontWeight: 'bold', fontSize: 13 },
  saveBtn: { backgroundColor: '#39ff14', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 26 },
  saveTxt: { color: '#181829', fontWeight: 'bold', fontSize: 15 },
  closeBtn: { backgroundColor: '#ff3c6f', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 26 },
  closeTxt: { color: '#fff', fontWeight: 'bold', fontSize: 15 }
});