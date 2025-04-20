import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const basePadding = Math.round(width * 0.04);
const baseRadius = Math.round(width * 0.035);

export default function BankAccountsModal({ visible, accounts, onClose }) {
  const [zoomImg, setZoomImg] = useState(null);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Thông tin ngân hàng</Text>
          <ScrollView>
            {accounts && accounts.length ? accounts.map((acc, idx) => (
              <View style={styles.section} key={idx}>
                <Text style={styles.label}>{acc.bankName} ({acc.accountName})</Text>
                <Text style={styles.value}>STK: {acc.accountNumber}</Text>
                {acc.qrImage ? (
                  <TouchableOpacity onPress={() => setZoomImg(acc.qrImage)}>
                    <Image source={{ uri: acc.qrImage }} style={styles.qrImage} />
                    <Text style={styles.tapToZoom}>Chạm để phóng to</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.noImage}><Text style={{ color: "#aaa" }}>Chưa có ảnh QR</Text></View>
                )}
              </View>
            )) : (
              <Text style={styles.label}>Chưa có thông tin tài khoản ngân hàng</Text>
            )}
          </ScrollView>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Đóng</Text>
          </TouchableOpacity>
        </View>
        {/* Modal zoom QR */}
        <Modal visible={!!zoomImg} transparent animationType="fade" onRequestClose={() => setZoomImg(null)}>
          <View style={styles.zoomOverlay}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => setZoomImg(null)}>
              <Image
                source={{ uri: zoomImg }}
                style={styles.zoomImg}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.zoomCloseBtn} onPress={() => setZoomImg(null)}>
              <Text style={styles.zoomCloseText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const imgSize = Math.round(width * 0.47);

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: '#000a', justifyContent: 'center', alignItems: 'center',
  },
  modal: {
    width: '93%',
    maxWidth: 440,
    backgroundColor: '#232338',
    borderRadius: baseRadius * 1.2,
    padding: basePadding * 1.1,
    elevation: 10,
    alignItems: 'stretch',
    maxHeight: Math.round(width * 1.45)
  },
  title: {
    color: '#39ff14',
    fontWeight: 'bold',
    fontSize: Math.round(width * 0.053),
    textAlign: 'center',
    marginBottom: basePadding * 0.7,
  },
  section: {
    marginBottom: basePadding,
    backgroundColor: '#181829',
    borderRadius: baseRadius * 0.8,
    padding: basePadding * 0.6,
    alignItems: 'center'
  },
  label: {
    color: '#ffe46b',
    fontSize: Math.round(width * 0.046),
    fontWeight: 'bold',
    marginBottom: 3,
    textAlign: 'center',
  },
  value: {
    color: '#fff',
    fontWeight: '600',
    fontSize: Math.round(width * 0.042),
    marginBottom: 6,
    textAlign: 'center',
  },
  qrImage: {
    width: imgSize,
    height: imgSize,
    resizeMode: 'contain',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 3
  },
  tapToZoom: {
    color: '#39ff14',
    fontSize: Math.round(width * 0.038),
    marginTop: 2
  },
  noImage: {
    backgroundColor: '#444a',
    width: imgSize,
    height: imgSize,
    borderRadius: 12,
    marginTop: 3,
    justifyContent: 'center',
    alignItems: 'center'
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
  zoomOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#000d',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10
  },
  zoomImg: {
    width: width * 0.92,
    height: height * 0.7,
    alignSelf: 'center',
    borderRadius: 18,
    backgroundColor: '#fff'
  },
  zoomCloseBtn: {
    position: 'absolute',
    top: 36,
    right: 28,
    backgroundColor: '#232338cc',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  zoomCloseText: {
    color: '#ffe46b',
    fontWeight: 'bold',
    fontSize: 17
  }
});