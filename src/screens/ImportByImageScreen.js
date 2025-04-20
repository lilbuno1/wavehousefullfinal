import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

async function ocrWithOCRSpace(imageUri) {
  const apiKey = 'helloworld'; // Miễn phí, nếu dùng nhiều nên đăng ký lấy key riêng tại ocr.space
  let formData = new FormData();
  formData.append('language', 'vie');
  formData.append('isOverlayRequired', 'false');
  formData.append('file', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'photo.jpg'
  });

  const res = await fetch('https://api.ocr.space/parse/image', {
    method: 'POST',
    headers: { apikey: apiKey },
    body: formData,
  });
  const data = await res.json();
  if (data?.ParsedResults?.[0]?.ParsedText) return data.ParsedResults[0].ParsedText;
  throw new Error('Không nhận diện được văn bản!');
}

export default function ImportByImageScreen({ onResult, onClose }) {
  const [img, setImg] = useState(null);
  const [scanText, setScanText] = useState('');
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled && result.assets?.[0]) {
      setImg(result.assets[0].uri);
      setScanText('');
    }
  };

  const handleScan = async () => {
    if (!img) return;
    setLoading(true);
    try {
      const text = await ocrWithOCRSpace(img);
      setScanText(text);
    } catch (e) {
      setScanText('Không nhận diện được văn bản!');
    }
    setLoading(false);
  };

  // Hàm parse giữ nguyên như trước
  const parseInvoiceText = (text) => {
    const lines = text.split('\n').filter(Boolean);
    const products = [];
    for (let line of lines) {
      const parts = line.trim().split(/\s{2,}|\t+/);
      if (parts.length >= 3) {
        products.push({
          name: parts[0],
          quantity: parts[1],
          price: parts[2],
        });
      }
    }
    return products;
  };

  const handleImport = () => {
    const products = parseInvoiceText(scanText);
    if (products.length === 0) {
      alert('Không nhận diện được sản phẩm!');
      return;
    }
    onResult(products);
    onClose();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nhập hàng bằng ảnh hóa đơn</Text>
      <TouchableOpacity style={styles.btn} onPress={pickImage}>
        <Text style={styles.btnText}>Chọn ảnh hóa đơn</Text>
      </TouchableOpacity>
      {img && <Image source={{ uri: img }} style={styles.image} />}
      <TouchableOpacity style={styles.btn} onPress={handleScan} disabled={!img || loading}>
        <Text style={styles.btnText}>Nhận diện (OCR)</Text>
      </TouchableOpacity>
      {loading && <ActivityIndicator size="large" />}
      {scanText ? (
        <ScrollView style={styles.textBox}>
          <Text style={styles.scanText}>{scanText}</Text>
        </ScrollView>
      ) : null}
      <TouchableOpacity
        style={[styles.importBtn, { backgroundColor: scanText ? '#39ff14' : '#ccc' }]}
        onPress={handleImport}
        disabled={!scanText}
      >
        <Text style={styles.importBtnText}>Nhập các sản phẩm này</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
        <Text style={styles.cancelBtnText}>Hủy</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, backgroundColor: '#232338', flex: 1 },
  title: { color: '#39ff14', fontWeight: 'bold', fontSize: 20, marginBottom: 14, textAlign: 'center' },
  btn: { backgroundColor: '#ffe46b', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  btnText: { color: '#181829', fontWeight: 'bold' },
  image: { width: '100%', height: 220, resizeMode: 'contain', marginVertical: 8, borderRadius: 8, backgroundColor: '#fff' },
  textBox: { backgroundColor: '#181829', borderRadius: 8, padding: 10, maxHeight: 120, marginBottom: 8 },
  scanText: { color: '#ffe46b' },
  importBtn: { padding: 14, borderRadius: 8, alignItems: 'center', marginVertical: 8 },
  importBtnText: { color: '#181829', fontWeight: 'bold' },
  cancelBtn: { alignItems: 'center', marginTop: 8 },
  cancelBtnText: { color: '#ffe46b' },
});