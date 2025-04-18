// Định dạng giá VND: 1.000.000 VND
export function formatVNDCurrency(value) {
  if (value === undefined || value === null || value === '') return '';
  const num = parseInt(String(value).replace(/\D/g, ''), 10);
  if (isNaN(num)) return '';
  return num.toLocaleString('vi-VN') + ' VND';
}

// Định dạng giá cho input khi nhập (có dấu chấm, không có VND)
export function formatVNDCurrencyInput(str) {
  if (!str) return '';
  // Loại bỏ ký tự không phải số
  const num = String(str).replace(/\D/g, '');
  // Format dấu chấm
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}