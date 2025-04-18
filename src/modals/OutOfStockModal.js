import React, { useState, useEffect, useContext } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, TextInput, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addActivityLog } from '../utils/activity';
import { ActivityContext } from '../context/ActivityContext';

const OUT_OF_STOCK_KEY = 'out_of_stock_products';

async function getOutOfStockList() {
  try {
    const raw = await AsyncStorage.getItem(OUT_OF_STOCK_KEY);
    if (raw) return JSON.parse(raw);
    return [];
  } catch {
    return [];
  }
}
async function saveOutOfStockList(list) {
  await AsyncStorage.setItem(OUT_OF_STOCK_KEY, JSON.stringify(list));
}

export default function OutOfStockModal({ visible, onClose, products }) {
  const [search, setSearch] = useState('');
  const [outList, setOutList] = useState([]);
  const { reload } = useContext(ActivityContext);

  useEffect(() => {
    if (visible) {
      getOutOfStockList().then(setOutList);
      setSearch('');
    }
  }, [visible]);

  // Lọc sản phẩm có id hợp lệ và chưa hết hàng, đồng thời phòng trường hợp thiếu id
  const filteredProducts = Array.isArray(products)
    ? products.filter(
        (p) =>
          p &&
          p.id !== undefined && p.id !== null &&
          !outList.includes(p.id) &&
          ((p.name || '').toLowerCase().includes((search || '').toLowerCase()))
      )
    : [];

  // Hàm lấy tên sản phẩm, an toàn với trường hợp không tìm thấy hoặc bị lỗi id
  const getName = (id) => {
    if (id === null || id === undefined) return '(Không rõ)';
    const found = products.find((p) => p.id === id);
    return (found && found.name) ? found.name : '(Đã xóa)';
  };

  // Thêm vào hết hàng + log hoạt động
  const handleAdd = async (id) => {
    if (id === null || id === undefined) return;
    const newList = [id, ...outList];
    setOutList(newList);
    await saveOutOfStockList(newList);
    await addActivityLog('Hết hàng', `Đánh dấu hết hàng: ${getName(id)}`);
    if (reload) reload();
  };

  // Xoá khỏi hết hàng + log hoạt động
  const handleRemove = (id) => {
    if (id === null || id === undefined) return;
    Alert.alert(
      'Hủy hết hàng',
      `Sản phẩm "${getName(id)}" đã có hàng lại?`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Đồng ý',
          style: 'destructive',
          onPress: async () => {
            const newList = outList.filter((oid) => oid !== id);
            setOutList(newList);
            await saveOutOfStockList(newList);
            await addActivityLog('Có hàng lại', `Bỏ đánh dấu hết hàng: ${getName(id)}`);
            if (reload) reload();
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Quản lý sản phẩm hết hàng</Text>

          <Text style={styles.headerLabel}>Thêm sản phẩm hết hàng:</Text>
          <TextInput
            style={styles.input}
            placeholder="Tìm sản phẩm..."
            placeholderTextColor="#aaa"
            value={search}
            onChangeText={setSearch}
          />
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) =>
              item && item.id !== undefined && item.id !== null
                ? String(item.id)
                : Math.random().toString()
            }
            style={styles.foundList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.foundItem}
                onPress={() => handleAdd(item.id)}
              >
                <Text style={styles.foundText}>{item.name || '(Không tên)'}</Text>
                <Text style={styles.addBtn}>+ Thêm</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={{ color: '#aaa', fontStyle: 'italic', textAlign: 'center', padding: 8 }}>
                Không tìm thấy sản phẩm phù hợp
              </Text>
            }
            keyboardShouldPersistTaps="handled"
          />
          <View style={{ height: 12 }} />
          <Text style={styles.headerLabel}>Danh sách sản phẩm hết hàng:</Text>
          <FlatList
            data={outList}
            keyExtractor={(id) =>
              id !== undefined && id !== null ? String(id) : Math.random().toString()
            }
            style={styles.outList}
            renderItem={({ item }) => (
              <View style={styles.outItem}>
                <Text style={styles.outText}>{getName(item)}</Text>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => handleRemove(item)}
                >
                  <Text style={styles.removeBtnText}>Có hàng lại</Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <Text style={{ color: '#aaa', fontStyle: 'italic', textAlign: 'center', padding: 8 }}>
                (Không có sản phẩm hết hàng)
              </Text>
            }
          />
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#000b', justifyContent: 'center', alignItems: 'center' },
  content: { backgroundColor: '#232338', borderRadius: 14, padding: 16, width: '94%', maxHeight: '95%', elevation: 10 },
  title: { color: '#ff3c6f', fontWeight: 'bold', fontSize: 20, letterSpacing: 1, textAlign: 'center', marginBottom:10 },
  headerLabel: { color: '#39ff14', marginTop: 8, fontWeight: 'bold', marginBottom: 2, fontSize: 15 },
  input: { borderColor: '#444', borderWidth: 1, padding: 8, borderRadius: 6, color: '#fff', backgroundColor: '#19191f', fontSize: 15, marginBottom: 4 },
  foundList: { maxHeight: 120, backgroundColor:'#2b2b3a', borderRadius:7, marginBottom:5 },
  foundItem: { flexDirection: 'row', justifyContent:'space-between', alignItems:'center', paddingVertical:6, paddingHorizontal:10, borderBottomWidth:1, borderBottomColor:'#333' },
  foundText: { color:'#fff', fontSize: 15 },
  addBtn: { color:'#39ff14', fontWeight:'bold', fontSize:16 },
  outList: { maxHeight: 140, backgroundColor:'#2b2b3a', borderRadius:7, marginBottom:5 },
  outItem: { flexDirection: 'row', justifyContent:'space-between', alignItems:'center', paddingVertical:7, paddingHorizontal:10, borderBottomWidth:1, borderBottomColor:'#333' },
  outText: { color:'#fff', fontSize: 15 },
  removeBtn: { backgroundColor:'#ffe46b', borderRadius:7, paddingHorizontal:12, paddingVertical:4, marginLeft:10 },
  removeBtnText: { color:'#232338', fontWeight:'bold', fontSize:14 },
  closeBtn: { marginTop: 12, backgroundColor: '#ff3c6f', paddingVertical: 8, paddingHorizontal: 28, borderRadius: 10, alignSelf:'center' },
  closeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
});