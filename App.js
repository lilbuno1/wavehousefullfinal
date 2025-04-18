import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';

import ProductListScreen from './src/screens/ProductListScreen';
import OutOfStockScreen from './src/screens/OutOfStockScreen';
import AddProductModal from './src/modals/AddProductModal';
import EditProductModal from './src/modals/EditProductModal';
import ProductDetailModal from './src/modals/ProductDetailModal';
import SettingsModal from './src/modals/SettingsModal';
import CalculatorModal from './src/modals/CalculatorModal';
import ActivityLogModal from './src/modals/ActivityLogModal';
import ImportHistoryModal from './src/modals/ImportHistoryModal';
import TodoListModal from './src/modals/TodoListModal';

function getNowString() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

function getEditLog(oldProd, newProd) {
  const changes = [];
  if (oldProd.name !== newProd.name)
    changes.push(`Tên: "${oldProd.name}" \u2794 "${newProd.name}"`);
  if (oldProd.price !== newProd.price)
    changes.push(`Giá: "${formatVNDCurrency(oldProd.price)}" \u2794 "${formatVNDCurrency(newProd.price)}"`);
  if (oldProd.spec !== newProd.spec)
    changes.push(`Quy cách: "${oldProd.spec}" \u2794 "${newProd.spec}"`);
  if (oldProd.image !== newProd.image)
    changes.push('Đổi hình ảnh');
  if (oldProd.isFavorite !== newProd.isFavorite)
    changes.push(`Ưu tiên: ${oldProd.isFavorite ? 'Bỏ ưu tiên' : 'Đánh dấu ưu tiên'}`);
  if (oldProd.isHot !== newProd.isHot)
    changes.push(`Bán chạy: ${oldProd.isHot ? 'Bỏ bán chạy' : 'Đánh dấu bán chạy'}`);
  if (!changes.length) return null;
  return `Sửa sản phẩm [${oldProd.name}]: ` + changes.join(', ');
}

function formatVNDCurrency(val) {
  if (typeof val !== "number" && typeof val !== "string") return "";
  let str = String(val).replace(/\D/g, '');
  if (!str) return '';
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [screen, setScreen] = useState('home');
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [detailModal, setDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [calculatorVisible, setCalculatorVisible] = useState(false);

  const [activityLog, setActivityLog] = useState([]);
  const [logModalVisible, setLogModalVisible] = useState(false);

  const [importHistory, setImportHistory] = useState([]);
  const [importHistoryModal, setImportHistoryModal] = useState(false);

  const [progressText, setProgressText] = useState('');
  const [progressing, setProgressing] = useState(false);

  // Todo List State
  const [todoModal, setTodoModal] = useState(false);
  const [todos, setTodos] = useState({});

  const [dateString, setDateString] = useState('');
  useEffect(() => {
    function getVNDayString() {
      const now = new Date();
      const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
      const day = days[now.getDay()];
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const yyyy = now.getFullYear();
      return `${day}, ${dd}/${mm}/${yyyy}`;
    }
    setDateString(getVNDayString());
    const interval = setInterval(() => setDateString(getVNDayString()), 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const data = await AsyncStorage.getItem('products');
        if (data) setProducts(JSON.parse(data));
        const log = await AsyncStorage.getItem('activityLog');
        if (log) setActivityLog(JSON.parse(log));
        const importHis = await AsyncStorage.getItem('importHistory');
        if (importHis) setImportHistory(JSON.parse(importHis));
        const todosStr = await AsyncStorage.getItem('todos');
        if (todosStr) setTodos(JSON.parse(todosStr));
      } catch (e) {}
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    AsyncStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  const persist = async (newProducts, newLog) => {
    setProducts(newProducts);
    await AsyncStorage.setItem('products', JSON.stringify(newProducts));
    if (newLog) {
      setActivityLog(newLog);
      await AsyncStorage.setItem('activityLog', JSON.stringify(newLog));
    }
  };

  const saveImportHistory = data => {
    setImportHistory(data);
    AsyncStorage.setItem('importHistory', JSON.stringify(data));
  };

  const addLog = async (text) => {
    const log = [{ text, time: getNowString() }, ...activityLog].slice(0, 100);
    setActivityLog(log);
    await AsyncStorage.setItem('activityLog', JSON.stringify(log));
  };

  // Excel Export
  const handleExport = async () => {
    try {
      if (!products.length) {
        Alert.alert('Thông báo', 'Không có sản phẩm để export!');
        return;
      }
      setProgressing(true);
      setProgressText('Đang xuất file Excel...');
      const wsData = [
        ["ID", "Tên sản phẩm", "Giá", "Quy cách", "Link ảnh", "Hết hàng", "Ưu tiên", "Bán chạy"],
        ...products.map(p => [
          p.id,
          p.name,
          formatVNDCurrency(p.price),
          p.spec,
          p.image,
          p.outOfStock ? 'Có' : 'Không',
          p.isFavorite ? 'Có' : 'Không',
          p.isHot ? 'Có' : 'Không'
        ])
      ];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws['!cols'] = [
        { wch: 16 }, { wch: 25 }, { wch: 16 }, { wch: 18 }, { wch: 22 }, { wch: 10 }, { wch: 10 }, { wch: 10 }
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "SanPham");
      const wbout = XLSX.write(wb, { type: 'base64', bookType: "xlsx" });

      setProgressText('Đang lưu file...');
      const fileUri = FileSystem.cacheDirectory + `shino_products_${Date.now()}.xlsx`;
      await FileSystem.writeAsStringAsync(fileUri, wbout, { encoding: FileSystem.EncodingType.Base64 });

      setProgressText('Đang chia sẻ file...');
      await Sharing.shareAsync(fileUri, { mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', dialogTitle: 'Chia sẻ file Excel sản phẩm' });

      setProgressing(false);
      setProgressText('');
      Alert.alert('Thành công', `Export thành công ${products.length} sản phẩm!`);
      addLog(`Export Excel thành công (${products.length} sản phẩm)`);
    } catch (e) {
      setProgressing(false);
      setProgressText('');
      Alert.alert('Lỗi', 'Không thể export file Excel.');
    }
  };

  // Excel Import
  const handleImport = async () => {
    try {
      setProgressing(true);
      setProgressText('Đang chọn file Excel...');
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel'
        ],
        copyToCacheDirectory: true
      });
      let fileUri;
      if (result.assets && result.assets.length > 0) {
        fileUri = result.assets[0].uri;
      } else if (result.uri) {
        fileUri = result.uri;
      } else {
        setProgressing(false);
        setProgressText('');
        setTimeout(() => {
          Alert.alert('Thông báo', 'Bạn đã huỷ hoặc không chọn file!');
        }, 300);
        return;
      }
      setProgressText('Đang đọc file...');
      const bstr = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
      setProgressText('Đang xử lý dữ liệu...');
      const workbook = XLSX.read(bstr, { type: "base64" });
      const wsname = workbook.SheetNames[0];
      const ws = workbook.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

      let headerRow = 0;
      while (
        headerRow < data.length &&
        (!data[headerRow] || data[headerRow].filter(x => x).length < 2)
      ) headerRow++;
      if (headerRow >= data.length) throw new Error("File không hợp lệ");

      const header = data[headerRow].map(h => String(h).toLowerCase().trim());
      const idx = {
        id: header.findIndex(h => h === 'id'),
        name: header.findIndex(h => h.includes('tên')),
        price: header.findIndex(h => h.includes('giá')),
        spec: header.findIndex(h => h.includes('quy cách') || h === 'quycach'),
        image: header.findIndex(h => h.includes('ảnh') || h.includes('img')),
        outOfStock: header.findIndex(h => h.includes('hết hàng') || h === 'hethang'),
        isFavorite: header.findIndex(h => h.includes('ưu tiên')),
        isHot: header.findIndex(h => h.includes('bán chạy')),
      };

      let imported = [];
      for (let i = headerRow + 1; i < data.length; ++i) {
        const row = data[i];
        if (!row || row.length < 2) continue;
        imported.push({
          id: idx.id >= 0 ? row[idx.id] : Date.now() + i,
          name: idx.name >= 0 ? row[idx.name] || '' : '',
          price: idx.price >= 0 ? Number(String(row[idx.price]).replace(/\D/g, '')) || 0 : 0,
          spec: idx.spec >= 0 ? row[idx.spec] || '' : '',
          image: idx.image >= 0 ? row[idx.image] || '' : '',
          outOfStock: idx.outOfStock >= 0 ? (String(row[idx.outOfStock]).toLowerCase().includes('có') || row[idx.outOfStock] === 1) : false,
          isFavorite: idx.isFavorite >= 0 ? (String(row[idx.isFavorite]).toLowerCase().includes('có') || row[idx.isFavorite] === 1) : false,
          isHot: idx.isHot >= 0 ? (String(row[idx.isHot]).toLowerCase().includes('có') || row[idx.isHot] === 1) : false,
        });
      }
      setProgressing(false);
      setProgressText('');
      if (imported.length) {
        await persist(
          imported,
          [{ text: `Import Excel thành công (${imported.length} sản phẩm)`, time: getNowString() }, ...activityLog]
        );
        setTimeout(() => {
          Alert.alert('Thành công', `Import thành công ${imported.length} sản phẩm!`);
        }, 100);
      } else {
        Alert.alert('Lỗi', 'File không hợp lệ hoặc không có dữ liệu!');
      }
    } catch (e) {
      setProgressing(false);
      setProgressText('');
      Alert.alert('Lỗi', 'Không thể import file Excel.\n' + e.message);
    }
  };

  // Backup JSON (cả ảnh base64)
  const handleBackupJson = async () => {
    try {
      setProgressing(true);
      setProgressText('Đang chuẩn bị dữ liệu backup...');
      const productsForBackup = await Promise.all(products.map(async p => {
        let imageBase64 = '';
        if (p.image && p.image.startsWith('file://')) {
          try {
            imageBase64 = await FileSystem.readAsStringAsync(p.image, { encoding: FileSystem.EncodingType.Base64 });
          } catch (e) { imageBase64 = ''; }
        }
        return {
          ...p,
          imageBase64,
        };
      }));

      const json = JSON.stringify(productsForBackup, null, 2);
      const fileUri = FileSystem.cacheDirectory + 'products_backup_' + Date.now() + '.json';
      await FileSystem.writeAsStringAsync(fileUri, json, { encoding: FileSystem.EncodingType.UTF8 });
      setProgressText('Đang chia sẻ file backup...');
      await Sharing.shareAsync(fileUri, { mimeType: 'application/json', dialogTitle: 'Chia sẻ file JSON backup' });
      setProgressing(false);
      setProgressText('');
      Alert.alert('Thành công', 'Đã backup dữ liệu sản phẩm!');
      addLog('Backup dữ liệu sản phẩm (JSON)');
    } catch (e) {
      setProgressing(false);
      setProgressText('');
      Alert.alert('Lỗi', 'Backup thất bại: ' + e.message);
    }
  };

  // Restore JSON (cả ảnh base64)
  const handleRestoreJson = async () => {
    try {
      setProgressing(true);
      setProgressText('Đang chọn file backup...');
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true
      });
      let fileUri;
      if (result.assets && result.assets.length > 0) {
        fileUri = result.assets[0].uri;
      } else if (result.uri) {
        fileUri = result.uri;
      } else {
        setProgressing(false);
        setProgressText('');
        setTimeout(() => {
          Alert.alert('Thông báo', 'Bạn đã huỷ hoặc không chọn file backup nào!');
        }, 300);
        return;
      }

      setProgressText('Đang đọc file backup...');
      let jsonString;
      try {
        jsonString = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.UTF8 });
      } catch (e) {
        setProgressing(false);
        setTimeout(() => {
          Alert.alert('Lỗi', 'Không đọc được file backup!\n' + e.message);
        }, 300);
        return;
      }
      let data;
      try {
        data = JSON.parse(jsonString);
      } catch (e) {
        setProgressing(false);
        setTimeout(() => {
          Alert.alert('Lỗi', 'File không đúng định dạng JSON!');
        }, 300);
        return;
      }
      setProgressText('Đang khôi phục dữ liệu...');
      const restored = await Promise.all(data.map(async p => {
        let image = p.image;
        if (p.imageBase64 && p.imageBase64.length > 100) {
          const fileName = `product_img_${Date.now()}_${Math.floor(Math.random() * 10000)}.jpg`;
          const fileUri = FileSystem.cacheDirectory + fileName;
          try {
            await FileSystem.writeAsStringAsync(fileUri, p.imageBase64, { encoding: FileSystem.EncodingType.Base64 });
            image = fileUri;
          } catch (e) {
            image = '';
          }
        }
        return { ...p, image };
      }));

      await persist(
        restored.map(({imageBase64, ...rest}) => rest),
        [{ text: `Khôi phục backup JSON (${restored.length} sản phẩm)`, time: getNowString() }, ...activityLog]
      );

      setProgressing(false);
      setProgressText('');
      setSettingsVisible(false);
      setTimeout(() => {
        Alert.alert('Thành công', `Khôi phục thành công ${restored.length} sản phẩm!`);
      }, 300);
      addLog('Khôi phục dữ liệu sản phẩm từ backup JSON');
    } catch (e) {
      setProgressing(false);
      setProgressText('');
      setTimeout(() => {
        Alert.alert('Lỗi', 'Không thể khôi phục file backup.\n' + e.message);
      }, 300);
    }
  };

  const handleAdd = async (prod) => {
    const newProducts = [prod, ...products];
    await persist(newProducts, [{ text: `Thêm sản phẩm: ${prod.name}`, time: getNowString() }, ...activityLog]);
    setAddModal(false);
  };

  const handleEdit = async (prod) => {
    const oldProd = products.find(p => p.id === prod.id);
    const logText = getEditLog(oldProd, prod);
    const newProducts = products.map(p =>
      p.id === prod.id ? { ...prod } : p
    );
    if (logText) {
      await persist(newProducts, [{ text: logText, time: getNowString() }, ...activityLog]);
    } else {
      await persist(newProducts);
    }
    setEditModal(false);
    setEditingProduct(null);
  };

  const handleDelete = async (prod) => {
    const newProducts = products.filter(p => p.id !== prod.id);
    await persist(newProducts, [{ text: `Xóa sản phẩm: ${prod.name}`, time: getNowString() }, ...activityLog]);
    setEditModal(false);
    setEditingProduct(null);
  };

  const handleToggleOutOfStock = async (prod) => {
    const newProducts = products.map(p =>
      p.id === prod.id ? { ...p, outOfStock: !p.outOfStock } : p
    );
    await persist(
      newProducts,
      [{
        text: `${prod.outOfStock ? 'Phục hồi hàng' : 'Đánh dấu hết hàng'}: ${prod.name}`,
        time: getNowString()
      }, ...activityLog]
    );
  };

  const handlePressItem = prod => {
    setSelectedProduct(prod);
    setDetailModal(true);
  };

  const handleEditProduct = prod => {
    setEditingProduct(prod);
    setEditModal(true);
  };

  // Đánh dấu ưu tiên
  const handleToggleFavorite = async (id) => {
    const newProducts = products.map(p =>
      p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
    );
    setProducts(newProducts);
    await AsyncStorage.setItem('products', JSON.stringify(newProducts));
  };

  // Đánh dấu bán chạy
  const handleToggleHot = async (id) => {
    const newProducts = products.map(p =>
      p.id === id ? { ...p, isHot: !p.isHot } : p
    );
    setProducts(newProducts);
    await AsyncStorage.setItem('products', JSON.stringify(newProducts));
  };

  // Ghi log khi mở máy tính
  const handleOpenCalculator = () => {
    setSettingsVisible(false);
    setTimeout(() => setCalculatorVisible(true), 200);
    addLog('Mở máy tính');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#181829' }}>
      <StatusBar barStyle="light-content" />
      {progressing && (
        <View style={styles.progressOverlay}>
          <View style={styles.progressBox}>
            <ActivityIndicator size="large" color="#39ff14" />
            <Text style={styles.progressText}>{progressText || "Đang xử lý..."}</Text>
          </View>
        </View>
      )}

      <View style={styles.neonHeader}>
        <Text style={styles.neonTitle}>ShinoVN App!</Text>
        <Text style={styles.neonDate}>{dateString}</Text>
      </View>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerLSBtn} onPress={() => setImportHistoryModal(true)}>
          <Text style={styles.headerBtnTxt}>LS nhập</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý Sản phẩm</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={() => setSettingsVisible(true)}>
          <Text style={styles.headerBtnTxt}>☰</Text>
        </TouchableOpacity>
      </View>

      {screen === 'home' && (
        <>
          <ProductListScreen
            products={products}
            onBack={null}
            onPressItem={handlePressItem}
            onEditProduct={handleEditProduct}
            onToggleOutOfStock={handleToggleOutOfStock}
            onToggleFavorite={handleToggleFavorite}
            onToggleHot={handleToggleHot}
          />
          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.addBtn} onPress={() => setAddModal(true)}>
              <Text style={styles.addBtnTxt}>+ Thêm sản phẩm</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.outStockBtn} onPress={() => setScreen('outofstock')}>
              <Text style={styles.outStockBtnTxt}>Danh sách hết hàng</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {screen === 'outofstock' && (
        <OutOfStockScreen
          products={products}
          onBack={() => setScreen('home')}
        />
      )}

      <AddProductModal
        visible={addModal}
        onClose={() => setAddModal(false)}
        onAdd={handleAdd}
      />
      <EditProductModal
        item={editingProduct}
        onClose={() => { setEditModal(false); setEditingProduct(null); }}
        onSave={handleEdit}
        onDelete={handleDelete}
      />
      <ProductDetailModal
        visible={detailModal}
        item={selectedProduct}
        onClose={() => setDetailModal(false)}
      />
      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        products={products}
        setProducts={persist}
        onOpenCalculator={handleOpenCalculator}
        onExport={handleExport}
        onImport={handleImport}
        onBackup={handleBackupJson}
        onRestore={handleRestoreJson}
        onOpenLog={() => { setSettingsVisible(false); setTimeout(() => setLogModalVisible(true), 200); }}
        onOpenTodo={() => setTodoModal(true)}
      />
      <CalculatorModal
        visible={calculatorVisible}
        onClose={() => setCalculatorVisible(false)}
      />
      <ActivityLogModal
        visible={logModalVisible}
        onClose={() => setLogModalVisible(false)}
        activityLog={activityLog}
      />
      <ImportHistoryModal
        visible={importHistoryModal}
        onClose={() => setImportHistoryModal(false)}
        history={importHistory}
        onAdd={item => {
          const newHistory = [item, ...importHistory];
          saveImportHistory(newHistory);
          addLog(`Nhập hàng: ${item.productName} | SL: ${item.quantity} | Giá: ${item.price} | Quy cách: ${item.spec || ''}`);
        }}
      />
      <TodoListModal
        visible={todoModal}
        onClose={() => setTodoModal(false)}
        todos={todos}
        setTodos={setTodos}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  neonHeader: {
    paddingTop: 38,
    paddingBottom: 8,
    backgroundColor: '#181829',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#ff003c99',
    shadowColor: '#ff003c',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 10
  },
  neonTitle: {
    color: '#ff003c',
    fontSize: 28,
    fontWeight: 'bold',
    textShadowColor: '#fff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
    letterSpacing: 1.5,
    textAlign: 'center',
    textShadow: '0 0 22px #ff003c, 0 0 18px #fff',
  },
  neonDate: {
    color: '#ffe46b',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
    textShadowColor: '#232338',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#232338', paddingHorizontal: 16, paddingVertical: 18, elevation: 8 },
  headerTitle: { color: '#39ff14', fontWeight: 'bold', fontSize: 22, flex: 1, textAlign: 'center' },
  headerBtn: { backgroundColor: '#39ff14', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 4 },
  headerBtnTxt: { color: '#181829', fontWeight: 'bold', fontSize: 17 },
  headerLSBtn: { backgroundColor: '#ffe46b', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 4, marginRight: 8 },
  bottomBar: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, backgroundColor: '#232338' },
  addBtn: { backgroundColor: '#39ff14', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  addBtnTxt: { color: '#181829', fontWeight: 'bold', fontSize: 15 },
  outStockBtn: { backgroundColor: '#ffe46b', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  outStockBtnTxt: { color: '#181829', fontWeight: 'bold', fontSize: 15 },
  progressOverlay: {
    position: 'absolute',
    zIndex: 999,
    backgroundColor: '#000a',
    width: '100%',
    height: '100%',
    justifyContent: 'center', alignItems: 'center'
  },
  progressBox: {
    backgroundColor: '#232338',
    padding: 30,
    borderRadius: 14,
    minWidth: 220,
    alignItems: 'center',
    elevation: 10,
  },
  progressText: { color: '#ffe46b', fontSize: 17, marginTop: 18, textAlign: 'center', fontWeight: 'bold' }
});