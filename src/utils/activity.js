const ACTIVITY_KEY = 'activity_log';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function addActivityLog(action, detail) {
  const now = new Date();
  const log = {
    time: now.toISOString(),
    action,
    detail,
  };
  let logs = [];
  try {
    const raw = await AsyncStorage.getItem(ACTIVITY_KEY);
    if (raw) logs = JSON.parse(raw);
  } catch {}
  logs.unshift(log); // newest first
  await AsyncStorage.setItem(ACTIVITY_KEY, JSON.stringify(logs.slice(0, 100)));
}

export async function getActivityLog() {
  try {
    const raw = await AsyncStorage.getItem(ACTIVITY_KEY);
    if (raw) return JSON.parse(raw);
    return [];
  } catch {
    return [];
  }
}

/**
 * So sánh và trả về chi tiết thay đổi (old, new là object sản phẩm, trả về chuỗi)
 */
export function getEditDetails(oldItem, newItem) {
  const changed = [];
  if (oldItem.name !== newItem.name)
    changed.push(`Tên: ${oldItem.name} → ${newItem.name}`);
  if (oldItem.price !== newItem.price)
    changed.push(`Giá: ${oldItem.price} → ${newItem.price}`);
  if (oldItem.spec !== newItem.spec)
    changed.push(`Quy cách: ${oldItem.spec} → ${newItem.spec}`);
  if (oldItem.date !== newItem.date)
    changed.push(`Ngày nhập: ${oldItem.date} → ${newItem.date}`);
  // Ảnh chỉ log nếu có thay đổi thực sự
  if (oldItem.image !== newItem.image)
    changed.push('Ảnh sản phẩm đã cập nhật');
  return changed.length ? changed.join(' | ') : 'Không thay đổi gì';
}