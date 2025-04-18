import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Dimensions } from 'react-native';

export default function ProductListScreen({
  products,
  onPressItem,
  onEditProduct,
  onToggleOutOfStock,
  onToggleFavorite,
  onToggleHot,
}) {
  const [search, setSearch] = useState('');
  const [searchFocus, setSearchFocus] = useState(false);

  // Normalize for Vietnamese search
  function normalize(str) {
    return (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9 ]/g, '');
  }
  const searchNorm = normalize(search);

  const filtered = products.filter(item => {
    if (!searchNorm) return true;
    return (
      normalize(item.name).includes(searchNorm) ||
      normalize(item.id + '').includes(searchNorm) ||
      normalize(item.spec).includes(searchNorm)
    );
  });

  // Xác định top 5 sản phẩm bán chạy nhất (theo trường isHot hoặc số lượng bán nếu có)
  const hotProducts = filtered.filter(p => p.isHot).slice(0, 5);
  const hotIds = hotProducts.map(p => p.id);

  // Sắp xếp lại: 5 bán chạy nhất ở trên cùng (theo thứ tự), sau đó ưu tiên, còn lại
  const restProducts = filtered.filter(p => !hotIds.includes(p.id));
  // Ưu tiên sản phẩm ưu tiên ở trên, còn lại giữ nguyên thứ tự
  const sortedRest = [...restProducts].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return 0;
  });

  // Responsive width
  const screenWidth = Dimensions.get('window').width;
  const itemWidth = Math.max((screenWidth - 40) / 2, 160); // 2 cột, padding 10*2, margin 10*2

  // Handler bỏ bán chạy: không cho tick nếu đã có 5 sản phẩm bán chạy
  const handleHotPress = id => {
    const isHot = products.find(p => p.id === id)?.isHot;
    if (isHot) {
      // Bỏ được, luôn cho phép bỏ
      onToggleHot(id);
    } else {
      // Thêm mới, chỉ cho nếu < 5 sản phẩm bán chạy
      const numberOfHot = products.filter(p => p.isHot).length;
      if (numberOfHot >= 5) {
        alert('Chỉ cho phép tối đa 5 sản phẩm bán chạy cùng lúc!');
      } else {
        onToggleHot(id);
      }
    }
  };

  // Danh sách hiển thị: 5 bán chạy nhất lên đầu, rồi các sản phẩm còn lại
  const displayList = [...hotProducts, ...sortedRest];

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.searchWrap}>
        <TextInput
          style={[
            styles.searchInput,
            searchFocus && { borderColor: '#39ff14' },
          ]}
          value={search}
          onChangeText={setSearch}
          placeholder="Tìm kiếm sản phẩm, mã, quy cách..."
          placeholderTextColor="#aaa"
          onFocus={() => setSearchFocus(true)}
          onBlur={() => setSearchFocus(false)}
          returnKeyType="search"
        />
        {search !== '' && (
          <TouchableOpacity style={styles.clearBtn} onPress={() => setSearch('')}>
            <Text style={{ color: '#ff003c', fontWeight: 'bold', fontSize: 18 }}>×</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={displayList}
        keyExtractor={item => item.id + ''}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.item,
              { width: itemWidth },
              item.isFavorite && styles.favoriteBorder,
              item.isHot && styles.hotBg,
            ]}
            onPress={() => onPressItem(item)}
            activeOpacity={0.82}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
              <TouchableOpacity onPress={() => onToggleFavorite(item.id)}>
                <Text style={{ fontSize: 19, marginRight: 4 }}>
                  {item.isFavorite ? '⭐' : '☆'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleHotPress(item.id)}>
                <Text style={{ fontSize: 17, marginRight: 4, color: item.isHot ? '#ff6600' : '#ffe46b' }}>
                  {item.isHot ? '🔥' : '♨️'}
                </Text>
              </TouchableOpacity>
              <Text
                style={[
                  styles.name,
                  item.isHot && { color: '#ff6600' },
                  { fontSize: 14, flex: 1 },
                ]}
                numberOfLines={1}
              >
                {item.name}
              </Text>
            </View>
            <Text style={styles.price} numberOfLines={1}>Giá: {Number(item.price).toLocaleString()} ₫</Text>
            {item.spec ? <Text style={styles.spec} numberOfLines={1}>Q.cách: {item.spec}</Text> : null}
            <View style={{ flexDirection: 'row', marginTop: 2, flexWrap: 'wrap' }}>
              <TouchableOpacity onPress={() => onEditProduct(item)}>
                <Text style={styles.actionBtn}>Sửa</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onToggleOutOfStock(item)}>
                <Text style={styles.actionBtn}>
                  {item.outOfStock ? 'Phục hồi' : 'Hết hàng'}
                </Text>
              </TouchableOpacity>
              {item.isFavorite && <Text style={styles.badge}>Ưu tiên</Text>}
              {item.isHot && <Text style={styles.badgeHot}>Bán chạy</Text>}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ color: '#999', textAlign: 'center', marginTop: 32 }}>Không có sản phẩm phù hợp</Text>}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#232338',
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 12,
    marginHorizontal: 0,
    borderRadius: 12,
    marginBottom: 6,
    borderWidth: 2,
    borderColor: '#29293e',
  },
  searchInput: {
    flex: 1,
    color: '#ffe46b',
    fontSize: 16,
    paddingVertical: 4,
    paddingHorizontal: 5,
    backgroundColor: 'transparent',
    borderColor: '#232338',
    borderWidth: 1,
    borderRadius: 8,
  },
  clearBtn: {
    marginLeft: 4,
    padding: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(255,0,60,0.07)',
  },
  item: {
    backgroundColor: '#29293e',
    borderRadius: 10,
    marginBottom: 14,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
    marginHorizontal: 0,
    minHeight: 92,
    minWidth: 150,
    maxWidth: 260,
  },
  favoriteBorder: {
    borderWidth: 2,
    borderColor: '#39ff14',
  },
  hotBg: {
    borderWidth: 2,
    borderColor: '#ff6600',
    backgroundColor: '#3a2a1e',
  },
  name: {
    fontWeight: 'bold',
    color: '#39ff14',
    flex: 1,
  },
  price: { color: '#ffe46b', marginTop: 1, fontSize: 13 },
  spec: { color: '#aaa', marginTop: 1, fontSize: 12 },
  actionBtn: {
    backgroundColor: '#39ff14',
    color: '#181829',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 5,
    fontWeight: 'bold',
    fontSize: 12,
    overflow: 'hidden',
  },
  badge: {
    backgroundColor: '#39ff14',
    color: '#181829',
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 1,
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 11,
    overflow: 'hidden',
  },
  badgeHot: {
    backgroundColor: '#ff6600',
    color: '#fff',
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 1,
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 11,
    overflow: 'hidden',
  },
});