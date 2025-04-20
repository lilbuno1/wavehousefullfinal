import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, TextInput, Image, StyleSheet, ScrollView, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

// Hàm định dạng VND
function formatVNDCurrency(val) {
  if (typeof val !== "number" && typeof val !== "string") return "";
  let str = String(val).replace(/\D/g, '');
  if (!str) return '';
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' ₫';
}

export default function ImportHistoryModal({ visible, onClose, history, onAdd }) {
  const [showAdd, setShowAdd] = useState(false);
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [spec, setSpec] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [invoiceImage, setInvoiceImage] = useState('');
  const [note, setNote] = useState('');

  // For detail modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  // For zoom image modal
  const [zoomImageUri, setZoomImageUri] = useState('');
  const [showZoom, setShowZoom] = useState(false);

  const pickImage = async (setter) => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7, base64: true });
    if (!result.canceled) {
      setter(result.assets[0].uri);
    }
  };

  // Đảm bảo giá luôn lưu là số
  const handleAdd = () => {
    if (!productName.trim()) return;
    onAdd({
      id: Date.now(),
      time: new Date().toISOString(),
      productName,
      quantity,
      spec,
      price: Number(String(price).replace(/\D/g, '')) || 0,
      image,
      invoiceImage,
      note
    });
    setProductName('');
    setQuantity('');
    setSpec('');
    setPrice('');
    setImage('');
    setInvoiceImage('');
    setNote('');
    setShowAdd(false);
  };

  // Định dạng ngay khi nhập vào ô giá
  const handlePriceChange = (val) => {
    // chỉ lấy số, fomat lại luôn
    let num = String(val).replace(/\D/g, '');
    if (!num) setPrice('');
    else setPrice(formatVNDCurrency(num));
  };

  // Ensure only open zoom when uri is valid
  const openZoom = (uri) => {
    if (uri && typeof uri === 'string' && (uri.startsWith('file') || uri.startsWith('http'))) {
      setZoomImageUri(uri);
      setShowZoom(true);
    }
  };

  // Đảm bảo history luôn là mảng
  const safeHistory = Array.isArray(history) ? history : [];

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ flex: 1, backgroundColor: '#232338', padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={onClose}><Text style={{ color: '#39ff14', fontWeight: 'bold', fontSize: 18 }}>←</Text></TouchableOpacity>
          <Text style={{ flex: 1, textAlign: 'center', color: '#39ff14', fontSize: 19, fontWeight: 'bold' }}>Lịch sử nhập hàng</Text>
          <TouchableOpacity onPress={() => setShowAdd(v => !v)}>
            <Text style={{ color: '#ffe46b', fontSize: 16 }}>{showAdd ? 'Đóng' : '+ Thêm'}</Text>
          </TouchableOpacity>
        </View>
        {showAdd && (
          <ScrollView style={{ backgroundColor: '#181829', borderRadius: 9, marginVertical: 12, padding: 10 }}>
            <Text style={styles.label}>Tên hàng *</Text>
            <TextInput style={styles.input} value={productName} onChangeText={setProductName} placeholder="Tên hàng" placeholderTextColor="#aaa" />
            <Text style={styles.label}>Số lượng</Text>
            <TextInput style={styles.input} value={quantity} onChangeText={setQuantity} placeholder="Số lượng" keyboardType="numeric" placeholderTextColor="#aaa" />
            <Text style={styles.label}>Quy cách</Text>
            <TextInput style={styles.input} value={spec} onChangeText={setSpec} placeholder="Quy cách" placeholderTextColor="#aaa" />
            <Text style={styles.label}>Giá nhập</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={handlePriceChange}
              placeholder="Giá nhập"
              keyboardType="numeric"
              placeholderTextColor="#aaa"
            />
            <Text style={styles.label}>Hình hàng</Text>
            <TouchableOpacity style={styles.imgBtn} onPress={() => pickImage(setImage)}>
              <Text style={styles.imgBtnTxt}>{image ? "Đổi hình" : "Chọn hình"}</Text>
            </TouchableOpacity>
            {image ? <Image source={{ uri: image }} style={{ width: 80, height: 80, marginBottom: 8, borderRadius: 7 }} /> : null}
            <Text style={styles.label}>Ảnh hóa đơn</Text>
            <TouchableOpacity style={styles.imgBtn} onPress={() => pickImage(setInvoiceImage)}>
              <Text style={styles.imgBtnTxt}>{invoiceImage ? "Đổi hình" : "Chọn hình"}</Text>
            </TouchableOpacity>
            {invoiceImage ? <Image source={{ uri: invoiceImage }} style={{ width: 80, height: 80, marginBottom: 8, borderRadius: 7 }} /> : null}
            <Text style={styles.label}>Ghi chú</Text>
            <TextInput style={styles.input} value={note} onChangeText={setNote} placeholder="Ghi chú" placeholderTextColor="#aaa" />
            <TouchableOpacity style={styles.addBtn} onPress={handleAdd}><Text style={{ color: '#181829', fontWeight: 'bold' }}>Lưu nhập hàng</Text></TouchableOpacity>
          </ScrollView>
        )}
        <FlatList
          data={safeHistory}
          keyExtractor={item => item.id + ''}
          style={{ flex: 1 }}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => { setSelectedProduct(item.productName); setShowDetail(true); }}>
              <View style={styles.item}>
                <Text style={styles.itemTitle}>{item.productName}</Text>
                <Text style={styles.itemDesc}>SL: {item.quantity} | Giá: {formatVNDCurrency(item.price)}</Text>
                <Text style={styles.itemDesc}>Quy cách: {item.spec || '(Không có)'}</Text>
                <Text style={styles.itemDesc}>Ngày: {new Date(item.time).toLocaleString()}</Text>
                {item.image ?
                  <TouchableOpacity onPress={() => openZoom(item.image)}>
                    <Image source={{ uri: item.image }} style={styles.itemImg} />
                  </TouchableOpacity>
                  : null}
                {item.invoiceImage ?
                  <TouchableOpacity onPress={() => openZoom(item.invoiceImage)}>
                    <Image source={{ uri: item.invoiceImage }} style={styles.itemImg} />
                  </TouchableOpacity>
                  : null}
                {item.note ? <Text style={styles.itemDesc}>Ghi chú: {item.note}</Text> : null}
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={{ color: '#aaa', marginTop: 24, textAlign: 'center' }}>Chưa có lịch sử nhập hàng.</Text>}
        />
        {/* Modal chi tiết nhập hàng cho sản phẩm */}
        {showDetail && (
          <Modal visible={showDetail} animationType="slide">
            <View style={{ flex: 1, backgroundColor: '#232338', padding: 16 }}>
              <TouchableOpacity onPress={() => setShowDetail(false)}>
                <Text style={{ color: '#39ff14', fontWeight: 'bold', fontSize: 18 }}>← Quay lại</Text>
              </TouchableOpacity>
              <Text style={{ color: '#ffe46b', fontWeight: 'bold', fontSize: 22, marginTop: 10, marginBottom: 10 }}>Chi tiết nhập: {selectedProduct}</Text>
              <FlatList
                data={safeHistory.filter(h => h.productName === selectedProduct)}
                keyExtractor={item => item.id + ''}
                renderItem={({ item }) => (
                  <View style={styles.item}>
                    <Text style={styles.itemDesc}>Ngày: {new Date(item.time).toLocaleString()}</Text>
                    <Text style={styles.itemDesc}>SL: {item.quantity} | Giá: {formatVNDCurrency(item.price)}</Text>
                    <Text style={styles.itemDesc}>Quy cách: {item.spec || '(Không có)'}</Text>
                    {item.image ?
                      <TouchableOpacity onPress={() => openZoom(item.image)}>
                        <Image source={{ uri: item.image }} style={styles.itemImg} />
                      </TouchableOpacity>
                      : null}
                    {item.invoiceImage ?
                      <TouchableOpacity onPress={() => openZoom(item.invoiceImage)}>
                        <Image source={{ uri: item.invoiceImage }} style={styles.itemImg} />
                      </TouchableOpacity>
                      : null}
                    {item.note ? <Text style={styles.itemDesc}>Ghi chú: {item.note}</Text> : null}
                  </View>
                )}
              />
            </View>
          </Modal>
        )}
        {/* Modal phóng to hình ảnh */}
        {showZoom && !!zoomImageUri && (
          <Modal visible={showZoom} transparent animationType="fade" onRequestClose={() => setShowZoom(false)}>
            <TouchableOpacity style={styles.zoomOverlay} activeOpacity={1} onPress={() => setShowZoom(false)}>
              <Image
                source={{ uri: zoomImageUri }}
                style={styles.zoomImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </Modal>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  label: { color: '#fff', marginTop: 10 },
  input: { backgroundColor: '#29293e', borderRadius: 6, color: '#fff', padding: 8, marginBottom: 6 },
  imgBtn: { backgroundColor: '#ffe46b', borderRadius: 6, padding: 7, marginVertical: 6, alignSelf: 'flex-start' },
  imgBtnTxt: { color: '#181829', fontWeight: 'bold' },
  addBtn: { backgroundColor: '#39ff14', borderRadius: 8, padding: 10, marginTop: 8, alignItems: 'center' },
  item: { backgroundColor: '#29293e', borderRadius: 7, marginVertical: 7, padding: 10 },
  itemTitle: { color: '#39ff14', fontWeight: 'bold', fontSize: 16 },
  itemDesc: { color: '#ffe46b', marginTop: 2 },
  itemImg: { width: 60, height: 60, borderRadius: 7, marginTop: 6 },
  zoomOverlay: { flex: 1, backgroundColor: '#000d', justifyContent: 'center', alignItems: 'center' },
  zoomImage: { width: Dimensions.get('window').width * 0.95, height: Dimensions.get('window').height * 0.8, borderRadius: 10 },
});