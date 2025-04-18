import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { formatVNDCurrency } from '../utils/format';

export default function OutOfStockScreen({ products = [], onBack }) {
  const data = Array.isArray(products) ? products.filter(item => item.outOfStock) : [];

  if (data.length === 0) {
    return (
      <View style={styles.screen}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backTxt}>{'<'} Quay lại</Text>
        </TouchableOpacity>
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Không có sản phẩm nào hết hàng.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backTxt}>{'<'} Quay lại</Text>
      </TouchableOpacity>
      <FlatList
        data={data}
        keyExtractor={item => '' + item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>{formatVNDCurrency(item.price)}</Text>
            <Text style={styles.spec}>{item.spec}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#181829' },
  backBtn: { marginTop: 20, marginBottom: 10, marginLeft: 18, alignSelf: 'flex-start', backgroundColor: '#ffe46b', borderRadius: 8, paddingHorizontal: 18, paddingVertical: 7 },
  backTxt: { color: '#181829', fontSize: 15, fontWeight: 'bold' },
  item: { backgroundColor: '#232338', marginBottom: 10, borderRadius: 8, padding: 15, marginHorizontal: 12 },
  name: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  price: { color: '#ff3c6f', fontWeight: 'bold', fontSize: 16, marginTop: 2 },
  spec: { color: '#ffe46b', fontSize: 13, marginTop: 2 },
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#fff', fontSize: 16, opacity: 0.7 }
});