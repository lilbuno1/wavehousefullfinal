import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Dimensions, FlatList, Image } from 'react-native';
import ImportByImageScreen from '../screens/ImportByImageScreen';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');
const basePadding = Math.round(width * 0.04);
const baseRadius = Math.round(width * 0.035);

function formatVND(value) {
  if (!value) return '';
  let number = value.replace(/\D/g, '');
  if (number.length > 12) number = number.slice(0, 12);
  return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export default function AddProductModal({ visible, onClose, onAdd }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [spec, setSpec] = useState('');
  const [showOCR, setShowOCR] = useState(false);
  const [importedProducts, setImportedProducts] = useState([]);
  const [imageUri, setImageUri] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const handleAdd = () => {
    if (!name) {
      alert('Nhập tên sản phẩm!');
      return;
    }
    onAdd({ id: Date.now().toString(), name, price: price.replace(/\./g, ''), spec, outOfStock: false, isFavorite: false, isHot: false, image: imageUri || '' });
    setName('');
    setPrice('');
    setSpec('');
    setImageUri(null);
    onClose();
  };

  const handleImportOCR = (products) => {
    setImportedProducts(products);
  };

  const handleAddImportedProduct = (prod) => {
    onAdd({ ...prod, id: Date.now().toString() + Math.random(), outOfStock: false, isFavorite: false, isHot: false, image: imageUri || '' });
    setImportedProducts(importedProducts.filter(p => p !== prod));
    if (importedProducts.length === 1) onClose();
  };

  const pickProductImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled && result.assets?.[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const removeImage = () => setImageUri(null);

  const handlePriceChange = (text) => {
    setPrice(formatVND(text));
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Thêm sản phẩm</Text>
          <ScrollView>
            {/* Ảnh sản phẩm */}
            <View style={styles.imageSection}>
              <Text style={styles.imageLabel}>Hình ảnh sản phẩm</Text>
              <TouchableOpacity style={styles.imageBox} onPress={() => imageUri ? setShowImageModal(true) : pickProductImage()}>
                {imageUri ?
                  <Image source={{ uri: imageUri }} style={styles.productImage} resizeMode="cover" /> :
                  <View style={styles.imagePlaceholder}>
                    <Text style={styles.imagePlaceholderText}>Chưa cập nhật</Text>
                  </View>
                }
              </TouchableOpacity>
              <View style={styles.imageActions}>
                <TouchableOpacity style={styles.imageActionBtn} onPress={pickProductImage}>
                  <Text style={styles.imageActionText}>{imageUri ? 'Đổi ảnh' : 'Chọn ảnh'}</Text>
                </TouchableOpacity>
                {imageUri && (
                  <TouchableOpacity style={styles.imageActionBtn} onPress={removeImage}>
                    <Text style={[styles.imageActionText, { color: 'red' }]}>Xóa ảnh</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <Modal visible={showImageModal} transparent animationType="fade">
              <View style={styles.fullscreenOverlay}>
                <TouchableOpacity style={{flex: 1}} activeOpacity={1} onPress={() => setShowImageModal(false)}>
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.fullScreenImage}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            </Modal>
            <TextInput
              style={styles.input}
              placeholder="Tên sản phẩm"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#aaa"
            />
            <TextInput
              style={styles.input}
              placeholder="Giá (VND)"
              value={price}
              onChangeText={handlePriceChange}
              keyboardType="numeric"
              placeholderTextColor="#aaa"
              maxLength={15}
            />
            <TextInput
              style={styles.input}
              placeholder="Quy cách"
              value={spec}
              onChangeText={setSpec}
              placeholderTextColor="#aaa"
            />
            <TouchableOpacity style={styles.ocrBtn} onPress={() => setShowOCR(true)}>
              <Text style={styles.ocrBtnText}>Nhập hàng bằng ảnh hóa đơn (OCR)</Text>
            </TouchableOpacity>
            {importedProducts.length > 0 && (
              <View style={styles.ocrListBox}>
                <Text style={styles.ocrListTitle}>Sản phẩm nhận diện được:</Text>
                <FlatList
                  data={importedProducts}
                  keyExtractor={(item, idx) => idx.toString()}
                  renderItem={({ item }) => (
                    <View style={styles.ocrItem}>
                      <Text style={{ color: '#ffe46b' }}>{item.name} | SL: {item.quantity} | Giá: {formatVND(item.price)}</Text>
                      <TouchableOpacity style={styles.addBtn} onPress={() => handleAddImportedProduct(item)}>
                        <Text style={styles.addBtnText}>Thêm</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                />
              </View>
            )}
          </ScrollView>
          {/* Nút Thêm sản phẩm và Hủy: thiết kế mới hài hòa, nổi bật, dễ nhìn */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.addProductBtn} onPress={handleAdd}>
              <Text style={styles.addProductBtnText}>Thêm sản phẩm</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtnRow} onPress={onClose}>
              <Text style={styles.cancelBtnTextRow}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Modal visible={showOCR} animationType="slide">
          <ImportByImageScreen
            onResult={handleImportOCR}
            onClose={() => setShowOCR(false)}
          />
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#000a', justifyContent: 'center', alignItems: 'center' },
  modal: {
    width: '90%',
    maxWidth: 420,
    backgroundColor: '#232338',
    borderRadius: baseRadius * 1.2,
    padding: basePadding * 1.1,
    elevation: 10,
    alignItems: 'stretch',
    maxHeight: 650,
  },
  title: {
    color: '#39ff14',
    fontWeight: 'bold',
    fontSize: Math.round(width * 0.053),
    textAlign: 'center',
    marginBottom: basePadding * 0.5,
  },
  imageSection: { alignItems: 'center', marginBottom: 15 },
  imageLabel: {
    color: '#ffe46b',
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: Math.round(width * 0.038)
  },
  imageBox: {
    width: 110,
    height: 110,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#ffe46b',
    backgroundColor: '#181829',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#252535',
  },
  imagePlaceholderText: {
    color: '#aaa', fontSize: 14,
  },
  imageActions: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 6 },
  imageActionBtn: { paddingHorizontal: 10, paddingVertical: 5 },
  imageActionText: { color: '#ffe46b', fontWeight: 'bold' },

  fullscreenOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center'
  },
  fullScreenImage: {
    width: width - 30,
    height: width - 30,
    borderRadius: 15,
    alignSelf: 'center'
  },

  input: {
    backgroundColor: '#181829',
    borderRadius: baseRadius,
    padding: 12,
    marginBottom: 8,
    color: '#ffe46b',
    fontSize: Math.round(width * 0.043),
  },
  ocrBtn: {
    backgroundColor: '#ffe46b',
    borderRadius: baseRadius * 0.9,
    paddingHorizontal: 13,
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  ocrBtnText: {
    color: '#181829',
    fontWeight: 'bold',
    fontSize: Math.round(width * 0.04),
  },
  ocrListBox: { backgroundColor: '#181829', borderRadius: 8, padding: 8, marginVertical: 8 },
  ocrListTitle: { color: "#39ff14", fontWeight: 'bold', marginBottom: 6 },
  ocrItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  addBtn: { backgroundColor: '#39ff14', paddingHorizontal: 11, paddingVertical: 6, borderRadius: 8 },
  addBtnText: { color: '#181829', fontWeight: 'bold' },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 2,
  },
  addProductBtn: {
    flex: 1,
    backgroundColor: '#39ff14',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 4,
    shadowColor: '#39ff14',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  addProductBtnText: { color: '#181829', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.5 },
  cancelBtnRow: {
    flex: 1,
    backgroundColor: '#e53935',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 4,
    shadowColor: '#e53935',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  cancelBtnTextRow: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});