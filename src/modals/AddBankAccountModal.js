import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, TextInput, Image, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');
const basePadding = Math.round(width * 0.04);
const baseRadius = Math.round(width * 0.035);

export default function AddBankAccountModal({ visible, onClose, onSave, initial }) {
  const [bankName, setBankName] = useState(initial?.bankName || '');
  const [accountName, setAccountName] = useState(initial?.accountName || '');
  const [accountNumber, setAccountNumber] = useState(initial?.accountNumber || '');
  const [qrImage, setQrImage] = useState(initial?.qrImage || '');

  // Reset when open/close
  React.useEffect(() => {
    if (!visible) {
      setBankName('');
      setAccountName('');
      setAccountNumber('');
      setQrImage('');
    }
  }, [visible]);

  const pickImage = async () => {
    let res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.85,
    });
    if (res.assets && res.assets[0]) setQrImage(res.assets[0].uri);
  };

  const handleSave = () => {
    if (!bankName || !accountName || !accountNumber) {
      alert('Vui lòng nhập đủ thông tin!');
      return;
    }
    onSave({
      bankName,
      accountName,
      accountNumber,
      qrImage: qrImage || ''
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{initial ? 'Sửa' : 'Thêm'} tài khoản ngân hàng</Text>
          <TextInput
            style={styles.input}
            placeholder="Tên ngân hàng"
            value={bankName}
            onChangeText={setBankName}
            placeholderTextColor="#ccc"
          />
          <TextInput
            style={styles.input}
            placeholder="Tên chủ tài khoản"
            value={accountName}
            onChangeText={setAccountName}
            placeholderTextColor="#ccc"
          />
          <TextInput
            style={styles.input}
            placeholder="Số tài khoản"
            value={accountNumber}
            onChangeText={setAccountNumber}
            keyboardType="number-pad"
            placeholderTextColor="#ccc"
          />
          <TouchableOpacity style={styles.imgBtn} onPress={pickImage}>
            <Text style={styles.imgBtnText}>{qrImage ? "Đổi ảnh QR" : "Chọn ảnh QR"}</Text>
          </TouchableOpacity>
          {qrImage ? (
            <Image source={{ uri: qrImage }} style={styles.qrImage} />
          ) : null}

          <View style={{ flexDirection: 'row', marginTop: 16 }}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Lưu</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const imgSize = Math.round(width * 0.36);

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#000a', justifyContent: 'center', alignItems: 'center' },
  modal: {
    width: '90%',
    maxWidth: 430,
    backgroundColor: '#232338',
    borderRadius: baseRadius * 1.2,
    padding: basePadding * 1.1,
    elevation: 10,
    alignItems: 'center'
  },
  title: {
    color: '#39ff14',
    fontWeight: 'bold',
    fontSize: Math.round(width * 0.05),
    textAlign: 'center',
    marginBottom: basePadding * 0.5,
  },
  input: {
    backgroundColor: '#181829',
    borderRadius: baseRadius,
    padding: 11,
    marginBottom: 10,
    color: '#ffe46b',
    width: '100%',
    fontSize: Math.round(width * 0.043)
  },
  imgBtn: {
    backgroundColor: '#ffe46b',
    borderRadius: baseRadius * 0.9,
    paddingHorizontal: 13,
    paddingVertical: 7,
    alignItems: 'center',
    marginBottom: 8,
  },
  imgBtnText: {
    color: '#181829',
    fontWeight: 'bold',
    fontSize: Math.round(width * 0.04),
  },
  qrImage: {
    width: imgSize,
    height: imgSize,
    resizeMode: 'contain',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 6
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#39ff14',
    borderRadius: baseRadius,
    paddingVertical: 10,
    alignItems: 'center',
    marginRight: 10
  },
  saveBtnText: {
    color: '#181829',
    fontWeight: 'bold',
    fontSize: Math.round(width * 0.045),
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#444',
    borderRadius: baseRadius,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#ffe46b',
    fontWeight: 'bold',
    fontSize: Math.round(width * 0.045),
  },
});