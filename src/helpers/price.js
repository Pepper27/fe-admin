// Pure helper for formatting/displaying product price ranges
export function getDisplayPrice(product, formatPrice) {
  const fmt = typeof formatPrice === 'function' ? formatPrice : (p) => Number(p).toLocaleString('vi-VN') + '₫';
  const prices = (product?.variants || [])
    .map((v) => Number(v?.price))
    .filter((p) => Number.isFinite(p));

  if (!prices.length) return '0₫';

  const min = Math.min(...prices);
  const max = Math.max(...prices);

  if (min === max) return fmt(min);
  return `${fmt(min)} - ${fmt(max)}`;
}
