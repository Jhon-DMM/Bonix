export function agregarElementoCanasta(elementos, postre, cantidad) {
  const existing = elementos.find((elemento) => elemento.id === postre.id);
  if (existing) {
    return elementos.map((elemento) => elemento.id === postre.id
      ? { ...elemento, quantity: elemento.quantity + cantidad }
      : elemento);
  }
  return [...elementos, { id: postre.id, name: postre.name, price: postre.price, quantity: cantidad }];
}

export function fijarCantidadElementoCanasta(elementos, id, cantidad) {
  return cantidad <= 0
    ? elementos.filter((elemento) => elemento.id !== id)
    : elementos.map((elemento) => elemento.id === id ? { ...elemento, quantity: cantidad } : elemento);
}

export function obtenerTotalesCanasta(elementos) {
  return elementos.reduce((totals, elemento) => ({
    count: totals.count + elemento.quantity,
    price: totals.price + elemento.price * elemento.quantity,
  }), { count: 0, price: 0 });
}
