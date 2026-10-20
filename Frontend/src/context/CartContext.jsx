import { useMemo, useState, useCallback } from 'react';
import { ContextoCanasta } from './cartStore.js';
import { agregarElementoCanasta, obtenerTotalesCanasta, fijarCantidadElementoCanasta } from '../utils/cart.js';

export function ProveedorCanasta({ children }) {
  const [elementos, fijarElementos] = useState([]); // { id, name, price, quantity }
  const [estaAbierto, fijarEstaAbierto] = useState(false);

  const agregarElemento = useCallback((postre, cantidad) => {
    fijarElementos((elementosPrevios) => agregarElementoCanasta(elementosPrevios, postre, cantidad));
  }, []);

  const quitarElemento = useCallback((id) => {
    fijarElementos((elementosPrevios) => elementosPrevios.filter((elemento) => elemento.id !== id));
  }, []);

  const actualizarCantidad = useCallback((id, cantidad) => {
    fijarElementos((elementosPrevios) => fijarCantidadElementoCanasta(elementosPrevios, id, cantidad));
  }, []);

  const vaciarCanasta = useCallback(() => fijarElementos([]), []);
  const abrirCanasta = useCallback(() => fijarEstaAbierto(true), []);
  const cerrarCanasta = useCallback(() => fijarEstaAbierto(false), []);
  const alternarCanasta = useCallback(() => fijarEstaAbierto((abiertoPrevio) => !abiertoPrevio), []);

  const { count: cantidadTotal, price: precioTotal } = useMemo(() => obtenerTotalesCanasta(elementos), [elementos]);

  const valorContexto = {
    elementos,
    estaAbierto,
    cantidadTotal,
    precioTotal,
    agregarElemento,
    quitarElemento,
    actualizarCantidad,
    vaciarCanasta,
    abrirCanasta,
    cerrarCanasta,
    alternarCanasta,
  };

  return <ContextoCanasta.Provider value={valorContexto}>{children}</ContextoCanasta.Provider>;
}
