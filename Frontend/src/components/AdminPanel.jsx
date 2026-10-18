import { useState } from 'react';
import * as dessertService from '../services/dessertService.js';
import { formatCOP } from '../utils/format.js';

const imageOptions = [
  { label: 'Postre de Oreo', path: '/images/Postre-oreo.png' },
  { label: 'Postre de Milo', path: '/images/Postre-Milo.png' },
  { label: 'Postre de maracuyá', path: '/images/Postre-maracuya.png' },
  { label: 'Postre de fresa', path: '/images/Postre-fresa.png' },
];
const defaultImageById = {
  oreo: '/images/Postre-oreo.png',
  milo: '/images/Postre-Milo.png',
  maracuya: '/images/Postre-maracuya.png',
  fresas: '/images/Postre-fresa.png',
};

/**
 * Not linked from the main nav on purpose — this is the operator-facing
 * surface. Visit it at /#admin. It talks only to dessertService.js, the
 * same module the public site uses, so it already works against a real
 * backend the day db.js is swapped for one.
 */
export default function AdminPanel({ desserts, onChange }) {
  const [newIngredientName, setNewIngredientName] = useState({});
  const [newDessert, setNewDessert] = useState({ id: '', name: '', price: '', description: '' });
  const [error, setError] = useState('');
  const [imageSelections, setImageSelections] = useState({});
  const [pendingImageChange, setPendingImageChange] = useState(null);

  const refresh = async () => onChange(await dessertService.getDesserts());

  const handlePriceChange = async (id, value) => {
    try {
      setError('');
      await dessertService.updateDessertPrice(id, Number(value));
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const confirmImageChange = async () => {
    if (!pendingImageChange) return;
    try {
      setError('');
      await dessertService.updateDessertImage(pendingImageChange.dessertId, pendingImageChange.image);
      await refresh();
      setPendingImageChange(null);
    } catch (err) {
      setError(err.message);
      setPendingImageChange(null);
    }
  };

  const handleAddIngredient = async (dessertId) => {
    const name = (newIngredientName[dessertId] || '').trim();
    if (!name) return;
    try {
      setError('');
      await dessertService.addIngredient(dessertId, name);
      setNewIngredientName((prev) => ({ ...prev, [dessertId]: '' }));
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveIngredient = async (dessertId, ingredientId) => {
    try {
      setError('');
      await dessertService.removeIngredient(dessertId, ingredientId);
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveDessert = async (id) => {
    try {
      setError('');
      await dessertService.removeDessert(id);
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddDessert = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await dessertService.addDessert({
        id: newDessert.id.trim(),
        name: newDessert.name.trim(),
        price: Number(newDessert.price) || 0,
        description: newDessert.description.trim(),
        ingredients: [],
      });
      setNewDessert({ id: '', name: '', price: '', description: '' });
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-canvas font-text">
      <div className="mx-auto max-w-[760px] px-5 py-10">
        <a href="#inicio" className="text-[13px] text-celeste-600 font-semibold">
          ← Volver al sitio
        </a>
        <h1 className="font-display font-semibold text-[28px] text-ink mt-3 mb-6">
          Panel de administración — Bonix
        </h1>

        {error && (
          <p className="mb-4 text-[14px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-5">
          {desserts.map((dessert) => (
            <div key={dessert.id} className="bg-paper rounded-card border border-hairline p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display font-semibold text-[18px] text-ink">{dessert.name}</h2>
                <button
                  type="button"
                  onClick={() => handleRemoveDessert(dessert.id)}
                  className="text-[13px] text-red-500 hover:underline"
                >
                  Eliminar postre
                </button>
              </div>

              <label className="flex items-center gap-2 mb-4 text-[14px] text-ink/70">
                Precio
                <input
                  type="number"
                  min="0"
                  defaultValue={dessert.price}
                  onBlur={(e) => handlePriceChange(dessert.id, e.target.value)}
                  className="w-32 rounded-lg border border-hairline px-2 py-1"
                />
                <span className="text-ink/40">{formatCOP(dessert.price)}</span>
              </label>

              <div className="mb-5">
                <p className="text-[13px] font-semibold text-ink/50 mb-2">Imagen del postre</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <img
                    src={imageSelections[dessert.id] ?? dessert.image ?? defaultImageById[dessert.id] ?? imageOptions[0].path}
                    alt={`Vista previa de ${dessert.name}`}
                    className="w-24 h-24 rounded-lg object-contain bg-celeste-50"
                  />
                  <div className="flex flex-1 flex-col sm:flex-row gap-2">
                    <select
                      value={imageSelections[dessert.id] ?? dessert.image ?? defaultImageById[dessert.id] ?? ''}
                      onChange={(e) => setImageSelections((prev) => ({ ...prev, [dessert.id]: e.target.value }))}
                      className="flex-1 rounded-lg border border-hairline px-3 py-2 text-[14px]"
                    >
                      {imageOptions.map((option) => (
                        <option key={option.path} value={option.path}>{option.label}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setPendingImageChange({
                        dessertId: dessert.id,
                        dessertName: dessert.name,
                        image: imageSelections[dessert.id] ?? dessert.image ?? defaultImageById[dessert.id] ?? imageOptions[0].path,
                      })}
                      disabled={(imageSelections[dessert.id] ?? dessert.image ?? defaultImageById[dessert.id]) === (dessert.image || defaultImageById[dessert.id])}
                      className="rounded-pill bg-celeste-500 text-white text-[13px] font-semibold px-4 py-2 hover:bg-celeste-600 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Cambiar imagen
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-[13px] font-semibold text-ink/50 mb-2">Ingredientes</p>
              <ul className="flex flex-col gap-1 mb-3">
                {dessert.ingredients.map((ingredient) => (
                  <li key={ingredient.id} className="flex items-center justify-between text-[14px] text-ink/80">
                    {ingredient.name}
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(dessert.id, ingredient.id)}
                      className="text-[12px] text-ink/40 hover:text-red-500"
                    >
                      Quitar
                    </button>
                  </li>
                ))}
              </ul>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nuevo ingrediente"
                  value={newIngredientName[dessert.id] || ''}
                  onChange={(e) =>
                    setNewIngredientName((prev) => ({ ...prev, [dessert.id]: e.target.value }))
                  }
                  className="flex-1 rounded-lg border border-hairline px-2 py-1 text-[14px]"
                />
                <button
                  type="button"
                  onClick={() => handleAddIngredient(dessert.id)}
                  className="rounded-pill bg-celeste-500 text-white text-[13px] font-semibold px-4 hover:bg-celeste-600"
                >
                  Añadir
                </button>
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={handleAddDessert}
          className="mt-8 bg-paper rounded-card border border-hairline p-5 flex flex-col gap-3"
        >
          <h2 className="font-display font-semibold text-[18px] text-ink">Agregar nuevo postre</h2>
          <input
            required
            placeholder="id (ej. chocolate)"
            value={newDessert.id}
            onChange={(e) => setNewDessert((p) => ({ ...p, id: e.target.value }))}
            className="rounded-lg border border-hairline px-3 py-2 text-[14px]"
          />
          <input
            required
            placeholder="Nombre"
            value={newDessert.name}
            onChange={(e) => setNewDessert((p) => ({ ...p, name: e.target.value }))}
            className="rounded-lg border border-hairline px-3 py-2 text-[14px]"
          />
          <input
            type="number"
            min="0"
            placeholder="Precio"
            value={newDessert.price}
            onChange={(e) => setNewDessert((p) => ({ ...p, price: e.target.value }))}
            className="rounded-lg border border-hairline px-3 py-2 text-[14px]"
          />
          <textarea
            placeholder="Descripción"
            value={newDessert.description}
            onChange={(e) => setNewDessert((p) => ({ ...p, description: e.target.value }))}
            className="rounded-lg border border-hairline px-3 py-2 text-[14px]"
          />
          <button
            type="submit"
            className="self-start rounded-pill bg-ink text-white text-[14px] font-semibold px-5 py-2"
          >
            Crear postre
          </button>
        </form>
      </div>

      {pendingImageChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4" role="presentation">
          <div className="w-full max-w-[400px] rounded-card bg-paper p-6" role="dialog" aria-modal="true" aria-labelledby="confirm-image-title">
            <h2 id="confirm-image-title" className="font-display font-semibold text-[22px] text-ink">
              ¿Seguro deseas cambiar la imagen?
            </h2>
            <p className="mt-2 text-[14px] text-ink/70">Vas a actualizar la foto de {pendingImageChange.dessertName}.</p>
            <p className="mt-2 text-[14px] font-semibold text-red-600">También se cambiará en la página principal.</p>
            <img src={pendingImageChange.image} alt={`Nueva imagen de ${pendingImageChange.dessertName}`} className="mx-auto my-5 h-44 w-44 object-contain" />
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => {
                setImageSelections((prev) => ({ ...prev, [pendingImageChange.dessertId]: desserts.find((item) => item.id === pendingImageChange.dessertId)?.image || defaultImageById[pendingImageChange.dessertId] || imageOptions[0].path }));
                setPendingImageChange(null);
              }} className="rounded-pill bg-canvas px-5 py-2.5 text-[14px] font-semibold text-ink">
                Cancelar
              </button>
              <button type="button" onClick={confirmImageChange} className="rounded-pill bg-[#0071e3] px-5 py-2.5 text-[14px] font-semibold text-white">
                Sí, cambiar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
