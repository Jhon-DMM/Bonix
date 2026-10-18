import DessertIllustration from './DessertIllustration.jsx';
import { formatCOP } from '../utils/format.js';
import { useEffect, useRef, useState } from 'react';

export default function DessertSection({ dessert, index }) {
  const ingredientsRef = useRef(null);
  const [ingredientsVisible, setIngredientsVisible] = useState(false);

  useEffect(() => {
    const list = ingredientsRef.current;
    if (!list || !('IntersectionObserver' in window)) {
      setIngredientsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIngredientsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.15 });
    observer.observe(list);
    return () => observer.disconnect();
  }, []);
  const imageOnRight = index % 2 === 1; // alterna lado de la imagen en cada sección
  const bandBg = 'bg-celeste-50';

  const ImageBlock = (
    <div className="flex justify-center">
      <div
        className="rounded-card p-10 flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${dessert.colors.from}22, ${dessert.colors.to}33)`,
        }}
      >
        <DessertIllustration dessert={dessert} size={220} />
      </div>
    </div>
  );

  const TextBlock = (
    <div>
      <p className="font-text text-[13px] font-semibold text-celeste-600 mb-2">
        {formatCOP(dessert.price)}
      </p>
      <h2 className="font-display font-semibold text-[32px] sm:text-[39px] text-ink mb-3 tracking-tight">
        {dessert.name}
      </h2>
      <p className="font-text text-[17px] text-ink/70 max-w-[420px] mb-6">
        {dessert.description}
      </p>

      <p className="font-text text-[14px] font-semibold text-ink/60 mb-3">Ingredientes</p>
      <ul ref={ingredientsRef} className="flex flex-col gap-2 max-w-[360px]">
        {dessert.ingredients.map((ingredient, ingredientIndex) => (
          <li
            key={ingredient.id}
            className={`ingredient-reveal flex items-center gap-3 font-text text-[15px] text-ink/80 py-2 border-b border-hairline last:border-b-0 ${ingredientsVisible ? 'is-visible' : ''}`}
            style={{ transitionDelay: ingredientsVisible ? `${Math.min(ingredientIndex, 7) * 110}ms` : '0ms' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-celeste-400 shrink-0" />
            {ingredient.name}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <section id={`postre-${dessert.id}`} className={`${bandBg} py-20`}>
      <div className="mx-auto max-w-[1000px] px-5 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {imageOnRight ? (
          <>
            <div className="order-2 md:order-1">{TextBlock}</div>
            <div className="order-1 md:order-2">{ImageBlock}</div>
          </>
        ) : (
          <>
            {ImageBlock}
            {TextBlock}
          </>
        )}
      </div>
    </section>
  );
}
