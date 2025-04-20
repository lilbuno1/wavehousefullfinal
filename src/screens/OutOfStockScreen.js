import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const basePadding = Math.round(width * 0.04);
const baseRadius = Math.round(width * 0.035);

export default function OutOfStockScreen({ products, onBack, onRestore }) {
  const outOfStockProducts = Array.isArray(products)
    ? products.filter(p => p.outOfStock)
    : [];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnTxt}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Danh sách hết hàng</Text>
        <View style={{ width: 40 }} />
      </View>
      <FlatList
        data={outOfStockProducts}
        keyExtractor={item => item.id + ''}
        renderItem={({ item }) => (
          <View style={styles.productItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.productName}>{item.name}</Text>
              {item.spec ? <Text style={styles.productSpec}>{item.spec}</Text> : null}
            </View>
            <TouchableOpacity
              style={styles.restoreBtn}
              onPress={() => onRestore && onRestore(item)}
            >
              <Text style={styles.restoreBtnTxt}>Phục hồi</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ color: '#aaa', textAlign: 'center', marginTop: 32 }}>
            Không có sản phẩm nào hết hàng.
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181829',
    paddingTop: basePadding,
    paddingHorizontal: basePadding,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: basePadding * 0.7,
    justifyContent: 'space-between',
  },
  backBtn: {
    backgroundColor: '#39ff14',
    borderRadius: baseRadius,
    paddingHorizontal: basePadding * 0.7,
    paddingVertical: basePadding / 3,
  },
  backBtnTxt: {
    color: '#181829',
    fontWeight: 'bold',
    fontSize: Math.round(width * 0.05),
  },
  headerTitle: {
    color: '#ffe46b',
    fontWeight: 'bold',
    fontSize: Math.round(width * 0.06),
    flex: 1,
    textAlign: 'center',
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#232338',
    borderRadius: baseRadius,
    padding: basePadding * 0.8,
    marginBottom: basePadding * 0.5,
    elevation: 2,
  },
  productName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: Math.round(width * 0.048),
  },
  productSpec: {
    color: '#aaa',
    fontSize: Math.round(width * 0.038),
    marginTop: 2,
  },
  restoreBtn: {
    backgroundColor: '#39ff14',
    borderRadius: baseRadius,
    paddingHorizontal: basePadding,
    paddingVertical: basePadding * 0.4,
    marginLeft: basePadding / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restoreBtnTxt: {
    color: '#181829',
    fontWeight: 'bold',
    fontSize: Math.round(width * 0.045),
  },
});