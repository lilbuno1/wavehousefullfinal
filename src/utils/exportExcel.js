import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';
import * as DocumentPicker from 'expo-document-picker';
import { formatVNDCurrency } from './format';

// Xuất toàn bộ sản phẩm ra file Excel
export async function exportProductsToExcel(products) {
  const now = new Date();
  const pad = n => (n < 10 ? '0' + n : n);
  const dateStr = `${pad(now.getDate())}${pad(now.getMonth() + 1)}${now.getFullYear()}`;
  const fileName = `ShinoVNAPP_${dateStr}.xlsx`;
  const fileUri = FileSystem.cacheDirectory + fileName;

  const worksheet = XLSX.utils.json_to_sheet(
    products.map(p => ({
      "ID": p.id ?? "",
      "Tên sản phẩm": p.name ?? "",
      "Giá": formatVNDCurrency(p.price ?? ""),
      "Quy cách": p.spec ?? "",
      "Tình trạng": p.outOfStock ? "Hết hàng" : "Còn hàng",
      "Hình ảnh": p.image ?? "",
    }))
  );
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

  const wbout = XLSX.write(workbook, { type: 'base64', bookType: "xlsx" });
  await FileSystem.writeAsStringAsync(fileUri, wbout, { encoding: FileSystem.EncodingType.Base64 });
  await Sharing.shareAsync(fileUri, {
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    dialogTitle: "Xuất file Excel"
  });

  return fileUri;
}

// Nhập danh sách sản phẩm từ file Excel, có callback tiến trình
export async function importProductsFromExcel(setProducts, onProgress) {
  try {
    const pickerResult = await DocumentPicker.getDocumentAsync({
      type: [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (pickerResult.canceled) return;

    let fileUri = '';
    if (pickerResult.assets && pickerResult.assets.length > 0) {
      fileUri = pickerResult.assets[0].uri;
    } else if (pickerResult.uri) {
      fileUri = pickerResult.uri;
    } else {
      alert('Không tìm thấy file!');
      return;
    }

    const fileData = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
    const workbook = XLSX.read(fileData, { type: 'base64' });
    const wsname = workbook.SheetNames[0];
    const ws = workbook.Sheets[wsname];
    const data = XLSX.utils.sheet_to_json(ws);

    let successCount = 0;
    let failCount = 0;
    const products = [];

    for (let idx = 0; idx < data.length; idx++) {
      const row = data[idx];
      // Validate các trường bắt buộc: name
      if (!row['Tên sản phẩm'] || typeof row['Tên sản phẩm'] !== 'string') {
        failCount++;
        if (onProgress) onProgress(idx + 1, data.length, successCount, failCount);
        continue;
      }
      let priceValue = row['Giá'];
      // Nếu chuỗi, loại bỏ " VND" và chấm, chuyển thành số
      if (typeof priceValue === 'string') {
        priceValue = priceValue.replace(/\s?VND/i, '').replace(/\./g, '').trim();
      }
      products.push({
        id: row['ID'] ?? Date.now() + idx,
        name: row['Tên sản phẩm'] ?? '',
        price: priceValue ?? '',
        spec: row['Quy cách'] ?? '',
        outOfStock: row['Tình trạng'] === 'Hết hàng',
        image: row['Hình ảnh'] ?? '',
      });
      successCount++;
      if (onProgress) onProgress(idx + 1, data.length, successCount, failCount);
    }

    setProducts(products);
    if (onProgress) onProgress(data.length, data.length, successCount, failCount, true);
  } catch (e) {
    if (onProgress) onProgress(0, 0, 0, 0, true, 'Lỗi nhập Excel: ' + e.message);
    else alert('Lỗi nhập Excel: ' + e.message);
  }
}