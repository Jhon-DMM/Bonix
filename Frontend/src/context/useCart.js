import { useContext } from 'react';
import { ContextoCanasta } from './cartStore.js';

export function useCanasta() {
  const contexto = useContext(ContextoCanasta);
  if (!contexto) throw new Error('useCanasta debe usarse dentro de <ProveedorCanasta>');
  return contexto;
}
