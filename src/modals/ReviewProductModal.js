import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import ImageView from "react-native-image-viewing";

export default function ReviewProductModal({ visible, item, onClose }) {
  const [showImageZoom, setShowImageZoom] = useState(false);

  if (!item) return null;
  const images = item.image
    ? [{ uri: item.image }]
    : [];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>{item.name}</Text>
          <View style={styles.imageBox}>
            {item.image ? (
              <>
                <TouchableOpacity onPress={() => setShowImageZoom(true)}>
                  <View style={{height: 220, width: 220, borderRadius: 16, overflow: 'hidden', backgroundColor: '#292941', alignItems: 'center', justifyContent: 'center'}}>
                    <ImageView
                      images={images}
                      imageIndex={0}
                      visible={showImageZoom}
                      onRequestClose={() => setShowImageZoom(false)}
                    />
                    <Text style={{position:'absolute',color:'#eee',bottom:8,fontSize:13}}>Nhấn để xem lớn</Text>
                  </View>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.noImage}>Chưa cập nhật hình</Text>
            )}
          </View>
          <Text style={styles.text}>
            Giá: <Text style={styles.bold}>{item.price || 'Chưa cập nhật'}</Text>
          </Text>
          <Text style={styles.text}>
            Quy cách: <Text style={styles.bold}>{item.spec || 'Chưa cập nhật'}</Text>
          </Text>
          {item.outOfStock && (
            <Text style={styles.outTag}>SẢN PHẨM NÀY ĐANG HẾT HÀNG</Text>
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
  overlay:{flex:1,backgroundColor:'#000a',justifyContent:'center',alignItems:'center'},
  content:{backgroundColor:'#232338',padding:18,borderRadius:14,width:'88%',alignItems:'center'},
  title:{color:'#39ff14',fontWeight:'bold',fontSize:20,marginBottom:12},
  imageBox:{width: '100%', alignItems: 'center', marginBottom: 12},
  noImage:{color:'#aaa',marginVertical:10},
  text:{color:'#fff',fontSize:15,marginTop:4},
  bold:{color:'#ffe46b',fontWeight:'bold'},
  outTag:{color:'#ff3c6f',fontWeight:'bold',marginTop:8,fontSize:15},
  closeBtn:{marginTop:16,backgroundColor:'#ff3c6f',paddingVertical:7,paddingHorizontal:24,borderRadius:10},
  closeTxt:{color:'#fff',fontWeight:'bold',fontSize:15}
});