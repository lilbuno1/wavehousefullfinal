export function formatCurrency(value) {
  if (!value) return '';
  const number = value.replace(/\D/g, '');
  if (!number) return '';
  return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}