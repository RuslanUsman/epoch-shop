export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export function calculateTotal(cartItems, isVip) {
  const discount = isVip ? 0.1 : 0

  return cartItems.reduce((sum, item) => {
    const price = Number(item.priceRub) || 0
    const discounted = price * (1 - discount)
    return sum + discounted * item.quantity
  }, 0)
}
