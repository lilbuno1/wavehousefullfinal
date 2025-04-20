import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator, Dimensions, Alert, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as XLSX from 'xlsx';
import { Ionicons } from '@expo/vector-icons';

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
import BankAccountsModal from './src/modals/BankAccountsModal';
import AddBankAccountModal from './src/modals/AddBankAccountModal';

// Responsive constants
const { width } = Dimensions.get('window');
const basePadding = Math.round(width * 0.04);
const baseRadius = Math.round(width * 0.035);
const cardShadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.12,
  shadowRadius: 12,
  elevation: 7,
};

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
  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    return now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });

  // Bank accounts state
  const [bankAccounts, setBankAccounts] = useState([]);
  const [showBankModal, setShowBankModal] = useState(false);
  const [addBankModal, setAddBankModal] = useState(false);

  // Đọc dữ liệu khi mở app
  useEffect(() => {
    (async () => {
      try {
        const data = await AsyncStorage.getItem('products');
        let parsed = [];
        if (data) {
          const tmp = JSON.parse(data);
          parsed = Array.isArray(tmp) ? tmp : [];
        }
        setProducts(parsed);

        const log = await AsyncStorage.getItem('activityLog');
        if (log) setActivityLog(JSON.parse(log));
        const importHis = await AsyncStorage.getItem('importHistory');
        if (importHis) {
          const tmp = JSON.parse(importHis);
          setImportHistory(Array.isArray(tmp) ? tmp : []);
        }
        const todosStr = await AsyncStorage.getItem('todos');
        if (todosStr) {
          let tmp = JSON.parse(todosStr);
          setTodos(tmp && typeof tmp === 'object' && !Array.isArray(tmp) ? tmp : {});
        }
        const bankStr = await AsyncStorage.getItem('bankAccounts');
        if (bankStr) setBankAccounts(JSON.parse(bankStr));
      } catch (e) {}
    })();
  }, []);

  // Luôn lưu todos vào AsyncStorage khi thay đổi
  useEffect(() => {
    if (!todos || Array.isArray(todos) || typeof todos !== 'object') {
      AsyncStorage.setItem('todos', JSON.stringify({}));
    } else {
      AsyncStorage.setItem('todos', JSON.stringify(todos));
    }
  }, [todos]);

  // Luôn lưu bankAccounts
  useEffect(() => {
    AsyncStorage.setItem('bankAccounts', JSON.stringify(bankAccounts));
  }, [bankAccounts]);

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
    AsyncStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  // Đồng hồ nhỏ cập nhật mỗi giây
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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

  // --------- Backup & Restore JSON ---------
  const handleBackup = async () => {
    try {
      setProgressText('Đang tạo file backup...');
      setProgressing(true);
      const data = {
        products,
        activityLog,
        importHistory,
        todos,
        bankAccounts,
        backupAt: getNowString()
      };
      const json = JSON.stringify(data, null, 2);
      const fileUri = FileSystem.cacheDirectory + `backup_shinovn_${Date.now()}.json`;
      await FileSystem.writeAsStringAsync(fileUri, json, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(fileUri, { mimeType: 'application/json' });
      addLog('Xuất file backup JSON');
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể sao lưu dữ liệu.');
    } finally {
      setProgressing(false);
    }
  };

  const handleRestore = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
      if (res.type !== 'success') return;
      setProgressText('Đang khôi phục dữ liệu...');
      setProgressing(true);
      const content = await FileSystem.readAsStringAsync(res.uri, { encoding: FileSystem.EncodingType.UTF8 });
      const data = JSON.parse(content);
      if (data.products) setProducts(data.products);
      if (data.activityLog) setActivityLog(data.activityLog);
      if (data.importHistory) setImportHistory(data.importHistory);
      if (data.todos) setTodos(data.todos);
      if (data.bankAccounts) setBankAccounts(data.bankAccounts);
      await AsyncStorage.setItem('products', JSON.stringify(data.products || []));
      await AsyncStorage.setItem('activityLog', JSON.stringify(data.activityLog || []));
      await AsyncStorage.setItem('importHistory', JSON.stringify(data.importHistory || []));
      await AsyncStorage.setItem('todos', JSON.stringify(data.todos || {}));
      await AsyncStorage.setItem('bankAccounts', JSON.stringify(data.bankAccounts || []));
      addLog('Khôi phục dữ liệu từ backup JSON');
      Alert.alert('Thành công', 'Khôi phục dữ liệu thành công!');
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể khôi phục dữ liệu. File không hợp lệ!');
    } finally {
      setProgressing(false);
    }
  };

  // --------- Export to Excel ---------
  const handleExportExcel = async () => {
    try {
      setProgressText('Đang xuất file Excel...');
      setProgressing(true);
      // Chuẩn bị dữ liệu
      const data = products.map(p => ({
        'Tên sản phẩm': p.name,
        'Giá': p.price,
        'Quy cách': p.spec,
        'Hết hàng': p.outOfStock ? 'X' : '',
        'Ưu tiên': p.isFavorite ? 'X' : '',
        'Bán chạy': p.isHot ? 'X' : '',
        'Mã': p.id
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "SanPham");
      const wbout = XLSX.write(wb, { type: 'base64', bookType: "xlsx" });
      const fileUri = FileSystem.cacheDirectory + `products_shinovn_${Date.now()}.xlsx`;
      await FileSystem.writeAsStringAsync(fileUri, wbout, { encoding: FileSystem.EncodingType.Base64 });
      await Sharing.shareAsync(fileUri, { mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      addLog('Xuất file Excel');
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể xuất file Excel.');
    } finally {
      setProgressing(false);
    }
  };

  // --------- Import from Excel ---------
  const handleImportExcel = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'], copyToCacheDirectory: true });
      if (res.type !== 'success') return;
      setProgressText('Đang nhập dữ liệu Excel...');
      setProgressing(true);
      const b64 = await FileSystem.readAsStringAsync(res.uri, { encoding: FileSystem.EncodingType.Base64 });
      const wb = XLSX.read(b64, { type: 'base64' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws);
      // Nhập dữ liệu, giữ lại id cũ nếu có, nếu không thì tạo id mới
      const imported = data.map(row => ({
        id: row['Mã'] || String(Date.now() + Math.random()),
        name: row['Tên sản phẩm'] || '',
        price: row['Giá'] || '',
        spec: row['Quy cách'] || '',
        outOfStock: !!row['Hết hàng'],
        isFavorite: !!row['Ưu tiên'],
        isHot: !!row['Bán chạy'],
        image: ''
      }));
      setProducts(imported);
      await AsyncStorage.setItem('products', JSON.stringify(imported));
      addLog('Nhập sản phẩm từ Excel');
      Alert.alert('Thành công', 'Nhập dữ liệu từ Excel thành công!');
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể nhập file Excel hoặc định dạng không hợp lệ!');
    } finally {
      setProgressing(false);
    }
  };

  // Thêm tài khoản
  const handleAddBankAccount = (account) => {
    setBankAccounts([account, ...bankAccounts]);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#181829"
        translucent={false}
      />
      <View style={styles.container}>
        {/* Nút QR nhỏ trên góc trái */}
        <TouchableOpacity
          style={{
            position: 'absolute', left: 12, top: 16, zIndex: 99,
            backgroundColor: '#ffe46b', borderRadius: 99, width: 42, height: 42, justifyContent: 'center', alignItems: 'center', ...cardShadow
          }}
          onPress={() => setShowBankModal(true)}
        >
          <Ionicons name="qr-code" size={26} color="#181829" />
        </TouchableOpacity>

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
          <View style={styles.clockBelowDate}>
            <Ionicons name="time-outline" size={16} color="#ffe46b" style={{marginRight: 2}} />
            <Text style={styles.clockText}>{currentTime}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.headerRow}>
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
              <View style={styles.listWrapper}>
                <ProductListScreen
                  products={Array.isArray(products) ? products : []}
                  onBack={null}
                  onPressItem={handlePressItem}
                  onEditProduct={handleEditProduct}
                  onToggleOutOfStock={handleToggleOutOfStock}
                  onToggleFavorite={handleToggleFavorite}
                  onToggleHot={handleToggleHot}
                />
              </View>
              <View style={styles.actionBar}>
                <TouchableOpacity style={styles.actionBtnLeft} onPress={() => setAddModal(true)}>
                  <Text style={styles.actionBtnTxtSmall}>+ Thêm sản phẩm</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtnRight} onPress={() => setScreen('outofstock')}>
                  <Text style={styles.actionBtnTxtSmall}>DS hết hàng</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
          {screen === 'outofstock' && (
            <OutOfStockScreen
              products={Array.isArray(products) ? products : []}
              onBack={() => setScreen('home')}
              onRestore={handleToggleOutOfStock}
            />
          )}
        </View>

        {/* Các modal giữ nguyên */}
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
          products={Array.isArray(products) ? products : []}
          setProducts={persist}
          onOpenCalculator={handleOpenCalculator}
          onOpenLog={() => { setSettingsVisible(false); setTimeout(() => setLogModalVisible(true), 200); }}
          onOpenTodo={() => setTodoModal(true)}
          onExport={handleExportExcel}
          onImport={handleImportExcel}
          onBackup={handleBackup}
          onRestore={handleRestore}
          onBankAccount={() => { setSettingsVisible(false); setTimeout(() => setAddBankModal(true), 220); }}
        />
        <BankAccountsModal
          visible={showBankModal}
          accounts={bankAccounts.slice(0, 3)}
          onClose={() => setShowBankModal(false)}
        />
        <AddBankAccountModal
          visible={addBankModal}
          onClose={() => setAddBankModal(false)}
          onSave={handleAddBankAccount}
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
          history={Array.isArray(importHistory) ? importHistory : []}
          onAdd={item => {
            const newHistory = [item, ...(Array.isArray(importHistory) ? importHistory : [])];
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#181829',
  },
  container: {
    flex: 1,
    backgroundColor: '#181829',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: basePadding,
    minHeight: '100%',
  },
  neonHeader: {
    width: '100%',
    alignItems: 'center',
    marginBottom: basePadding * 0.65,
  },
  neonTitle: {
    color: '#ff003c',
    fontSize: Math.round(width * 0.08),
    fontWeight: 'bold',
    textShadowColor: '#fff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 2,
  },
  neonDate: {
    color: '#ffe46b',
    fontSize: Math.round(width * 0.045),
    fontWeight: 'bold',
    textShadowColor: '#232338',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  clockBelowDate: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
    marginBottom: 8,
    backgroundColor: '#232338',
    borderRadius: 17,
    paddingVertical: 3,
    paddingHorizontal: 10,
    minWidth: 74,
  },
  clockText: {
    fontWeight: 'bold',
    color: '#ffe46b',
    fontSize: 15,
    letterSpacing: 1,
    textShadowColor: '#232338',
    textShadowRadius: 6,
    marginLeft: 1,
  },
  card: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#232338',
    borderRadius: baseRadius * 1.2,
    ...cardShadow,
    paddingHorizontal: basePadding,
    paddingVertical: basePadding / 1.5,
    marginBottom: basePadding / 2,
    flexGrow: 1,
    flexShrink: 1,
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: basePadding / 1.9,
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#39ff14',
    fontWeight: 'bold',
    fontSize: Math.round(width * 0.055),
    flex: 1,
    textAlign: 'center',
  },
  headerBtn: {
    backgroundColor: '#39ff14',
    borderRadius: baseRadius,
    paddingHorizontal: basePadding,
    paddingVertical: basePadding / 3,
    marginLeft: basePadding / 2,
  },
  headerBtnTxt: {
    color: '#181829',
    fontWeight: 'bold',
    fontSize: Math.round(width * 0.045),
  },
  headerLSBtn: {
    backgroundColor: '#ffe46b',
    borderRadius: baseRadius,
    paddingHorizontal: basePadding,
    paddingVertical: basePadding / 3,
    marginRight: basePadding / 2,
  },
  listWrapper: {
    flexGrow: 1,
    minHeight: 220,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: basePadding * 0.7,
    marginBottom: 6,
  },
  actionBtnLeft: {
    flex: 1,
    backgroundColor: '#39ff14',
    borderRadius: baseRadius * 0.85,
    paddingHorizontal: basePadding * 0.6,
    paddingVertical: basePadding * 0.45,
    alignItems: 'center',
    marginRight: basePadding / 3,
    ...cardShadow,
    minHeight: 36,
    maxHeight: 40,
  },
  actionBtnRight: {
    flex: 1,
    backgroundColor: '#ffe46b',
    borderRadius: baseRadius * 0.85,
    paddingHorizontal: basePadding * 0.6,
    paddingVertical: basePadding * 0.45,
    alignItems: 'center',
    marginLeft: basePadding / 3,
    ...cardShadow,
    minHeight: 36,
    maxHeight: 40,
  },
  actionBtnTxtSmall: {
    color: '#181829',
    fontWeight: 'bold',
    fontSize: Math.round(width * 0.039),
    letterSpacing: 0.2,
  },
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