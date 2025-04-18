import React, { useState } from 'react';
import { View, Button } from 'react-native';
import AddProductScreen from './AddProductScreen';
import ProductListScreen from './ProductListScreen';

export default function ProductManager() {
  const [products, setProducts] = useState([]);
  const [screen, setScreen] = useState('add'); // 'add' hoặc 'list'

  const handleAddProduct = (product) => {
    setProducts(prev => {
      const newList = [...prev, product];
      console.log('Danh sách sản phẩm mới:', newList);
      return newList;
    });
    setScreen('add');
  };

  return (
    <View style={{flex: 1}}>
      {screen === 'add' ? (
        <>
          <AddProductScreen
            onAddProduct={handleAddProduct}
            onCancel={() => {}}
            products={products}
          />
          <Button
            title="Xem danh sách sản phẩm"
            onPress={() => setScreen('list')}
          />
        </>
      ) : (
        <ProductListScreen
          products={products}
          onBack={() => setScreen('add')}
        />
      )}
    </View>
  );
}