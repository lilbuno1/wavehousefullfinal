import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import XLSX from 'xlsx';
import * as DocumentPicker from 'expo-document-picker';
// import { zip } from 'react-native-zip-archive'; // Chỉ dùng được nếu eject sang Bare workflow

// Xuất dữ liệu sang file Excel
export async function exportToExcel(products) {
  try {
    const ws = XLSX.utils.json_to_sheet(products);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    const fileUri = FileSystem.documentDirectory + 'warehouse.xlsx';
    await FileSystem.writeAsStringAsync(fileUri, wbout, { encoding: FileSystem.EncodingType.Base64 });
    await Sharing.shareAsync(fileUri);
  } catch (e) {
    alert('Lỗi xuất Excel: ' + e);
  }
}

// Nhập dữ liệu từ file Excel
export async function importFromExcel() {
  try {
    const res = await DocumentPicker.getDocumentAsync({ type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'] });
    if (res.canceled || !res.assets || !res.assets[0]) return [];
    const fileUri = res.assets[0].uri;
    const data = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
    const workbook = XLSX.read(data, { type: 'base64' });
    const wsname = workbook.SheetNames[0];
    const ws = workbook.Sheets[wsname];
    const products = XLSX.utils.sheet_to_json(ws);
    alert('Đã nhập thành công!');
    return products;
  } catch (e) {
    alert('Lỗi nhập Excel: ' + e);
    return [];
  }
}

// Xuất file ZIP (data + ảnh) -- LƯU Ý: Expo Managed chỉ zip được file JSON, không zip được ảnh trừ khi eject
export async function exportToZip(products) {
  try {
    // Lưu file warehouse.json
    const jsonStr = JSON.stringify(products);
    const jsonPath = FileSystem.documentDirectory + 'warehouse.json';
    await FileSystem.writeAsStringAsync(jsonPath, jsonStr);

    // Chỉ zip file JSON (nếu muốn zip cả ảnh, phải eject dự án!)
    // Nếu eject, dùng react-native-zip-archive để zip cả folder
    // await zip(FileSystem.documentDirectory, FileSystem.documentDirectory + 'warehouse.zip');
    // await Sharing.shareAsync(FileSystem.documentDirectory + 'warehouse.zip');

    // Expo Managed: chỉ share file JSON
    await Sharing.shareAsync(jsonPath);
    alert("Expo Managed chỉ cho phép xuất file JSON. Nếu muốn zip cả ảnh, cần eject sang Bare workflow.");
  } catch (e) {
    alert('Lỗi xuất ZIP: ' + e);
  }
}