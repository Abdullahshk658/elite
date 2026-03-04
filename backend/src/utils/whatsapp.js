export const buildOrderNotification = (order) => {
  const itemLines = order.items
    .map((item) => `- ${item.qty}x ${item.product?.name || 'Product'} (${item.size})`)
    .join('%0A');

  return `New EliteKicks Order%0AID: ${order._id}%0ACustomer: ${order.customer.name}%0APhone: ${order.customer.phone}%0ATotal: PKR ${order.total}%0AItems:%0A${itemLines}`;
};

export const buildWaMeLink = (number, message) => `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
