import * as FileSystem from 'expo-file-system';
const FILE_URI = FileSystem.documentDirectory + 'warehouse.json';

export async function loadProducts() {
  try {
    const file = await FileSystem.getInfoAsync(FILE_URI);
    if (file.exists) {
      const data = await FileSystem.readAsStringAsync(FILE_URI);
      return JSON.parse(data);
    }
    return [];
  } catch {
    return [];
  }
}

export async function saveProducts(data) {
  await FileSystem.writeAsStringAsync(FILE_URI, JSON.stringify(data));
}