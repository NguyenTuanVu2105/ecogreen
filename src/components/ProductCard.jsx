import { useMemo } from 'react';
import { useLocale } from '../i18n/LocaleContext.jsx';
import { IconCart, IconCompare, IconHeart, IconLock, IconStar } from './icons.jsx';

function ProductCard({ product, layout = 'grid', onClick }) {
  const { t } = useLocale();
  const { name, price, oldPrice, rating, reviews, image, status, featured } = product;

  const { statusBadge, isOutOfStock } = useMemo(() => {
    if (status === 'out-of-stock') {
      return {
        statusBadge: {
          label: t('common.outOfStock'),
          className: 'bg-slate-900 text-white'
        },
        isOutOfStock: true
      };
    }
    if (status === 'discount') {
      return {
        statusBadge: {
          label: t('common.sale'),
          className: 'bg-rose-500 text-white'
        },
        isOutOfStock: false
      };
    }
    return { statusBadge: null, isOutOfStock: false };
  }, [status, t]);

  const containerClasses = [
    'group relative overflow-hidden rounded-[28px] border border-slate-200 bg-white transition duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-[0_20px_40px_rgba(59,183,126,0.15)]',
    layout === 'list'
      ? 'flex flex-col gap-6 p-6 md:flex-row md:items-center'
      : 'flex flex-col p-6'
  ].join(' ');

  const imageWrapperClasses = [
    'relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white',
    layout === 'list' ? 'h-56 w-full md:w-60' : 'h-60 w-full'
  ].join(' ');

  const contentClasses =
    layout === 'list'
      ? 'flex flex-1 flex-col justify-between gap-4'
      : 'mt-5 flex flex-1 flex-col gap-4';

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && onClick) {
      onClick();
    }
  };

  return (
    <div
      className={containerClasses}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <div className={imageWrapperClasses}>
        {statusBadge ? (
          <span
            className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold ${
              statusBadge.className
            }`}
          >
            {statusBadge.label}
          </span>
        ) : null}
        {featured ? (
          <span className="absolute left-4 top-4 translate-y-10 rounded-full border border-primary/10 bg-white/90 px-3 py-1 text-xs font-semibold text-primary shadow-sm">
            Featured
          </span>
        ) : null}
        <div className="absolute right-4 top-4 flex flex-col items-center gap-2 opacity-0 transition group-hover:opacity-100">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-primary hover:text-primary"
            aria-label={t('common.addToWishlist')}
          >
            <IconHeart className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-primary hover:text-primary"
            aria-label={t('common.compare')}
          >
            <IconCompare className="h-4 w-4" />
          </button>
        </div>

        <img
          src={image}
          alt={name}
          className="h-full w-full object-contain transition duration-200 group-hover:scale-105"
          loading="lazy"
        />
        {isOutOfStock ? (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]" />
        ) : null}
      </div>

      <div className={contentClasses}>
        <div>
          <h4 className="text-lg font-semibold text-slate-900">{name}</h4>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-lg font-semibold text-slate-900">${price.toFixed(2)}</span>
            {oldPrice ? (
              <span className="text-sm text-slate-400 line-through">
                ${oldPrice.toFixed(2)}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-400">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <IconStar
                key={`${product.id}-star-${index}`}
                className={`h-3.5 w-3.5 ${
                  rating >= index + 1 ? 'text-amber-400' : 'text-slate-200'
                }`}
              />
            ))}
          </div>
          <span className="text-slate-500">{rating.toFixed(1)}</span>
          <span>({reviews})</span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-slate-500">{t('common.inStock') ?? 'In stock'}</span>
          <button
            type="button"
            disabled={isOutOfStock}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full transition ${
              isOutOfStock
                ? 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
                : 'bg-primary text-white hover:bg-primary-dark'
            }`}
            aria-label={t('common.addToCart')}
          >
            {isOutOfStock ? <IconLock className="h-5 w-5" /> : <IconCart className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
