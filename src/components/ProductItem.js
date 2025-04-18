import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Button } from 'react-native';

export default function ProductItem({ item, onEdit, onReview, onDelete }) {
  return (
    <View style={styles.item}>
      {/* Ấn vào hình ảnh để xem review nếu có */}
      {item.image ? (
        <TouchableOpacity onPress={onReview} activeOpacity={0.8}>
          <Image source={{ uri: item.image }} style={styles.productImageSmall} />
        </TouchableOpacity>
      ) : (
        <View style={styles.productImageSmallNoImg}><Text style={styles.noImageTxt}>Chưa cập nhật</Text></View>
      )}
      <TouchableOpacity style={{ flex: 1 }} activeOpacity={0.7} onPress={onReview}>
        <View>
          <Text style={styles.itemText}>{item.name}</Text>
          <Text style={styles.infoText}>Giá: <Text style={{color: '#fff'}}>{item.price} VND</Text></Text>
          <Text style={styles.infoText}>Quy cách: <Text style={{color: '#fff'}}>{item.spec}</Text></Text>
          <Text style={styles.infoText}>Nhập: <Text style={{color: '#fff'}}>{item.date}</Text></Text>
        </View>
      </TouchableOpacity>
      <View style={{alignItems: 'flex-end', gap: 6}}>
        <TouchableOpacity onPress={onEdit} style={styles.editBtn}>
          <Text style={styles.editBtnText}>Sửa</Text>
        </TouchableOpacity>
        <Button title="Xóa" color="#ff3c6f" onPress={onDelete} />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', marginVertical: 6, padding: 12, borderBottomWidth: 1, borderBottomColor: '#26263d', backgroundColor: '#232338', borderRadius: 8, gap: 8 },
  productImageSmall: { width: 60, height: 46, borderRadius: 6, marginRight: 8, resizeMode: 'cover', backgroundColor: '#19191f' },
  productImageSmallNoImg: { width: 60, height: 46, borderRadius: 6, marginRight: 8, backgroundColor: '#19191f', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#444' },
  noImageTxt: { color: '#999', fontSize: 12, textAlign: 'center' },
  itemText: { color: '#ff3c6f', fontWeight: 'bold', fontSize: 17, textShadowColor: '#fff', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 7 },
  infoText: { color: '#ff3c6f', fontSize: 14, marginTop: 2 },
  editBtn: { backgroundColor: '#39ff14', paddingVertical: 2, paddingHorizontal: 12, borderRadius: 6, marginBottom: 2, alignSelf: 'flex-end' },
  editBtnText: { color: '#161622', fontWeight: 'bold', fontSize: 15, letterSpacing: 1 },
});