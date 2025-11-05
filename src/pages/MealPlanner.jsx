import { useMemo, useState } from 'react';
import ProductCard from '../components/ProductCard.jsx';
import { useLocale } from '../i18n/LocaleContext.jsx';
import { IconInfo, IconSearch } from '../components/icons.jsx';

function MealPlanner({ products, loading }) {
  const { t, locale } = useLocale();
  const [prompt, setPrompt] = useState('');
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ budget: null, vegetarian: false, keywords: [] });
  const [suggestions, setSuggestions] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const availableProducts = useMemo(
    () => products.filter((item) => (item.stock ?? 0) > 0),
    [products]
  );

  const parsePrompt = (value) => {
    const normalized = value.toLowerCase();
    const budgetMatch = normalized.match(/(\d+(?:[,.]\d+)?)k/);
    const budget = budgetMatch ? parseFloat(budgetMatch[1].replace(',', '.')) * 1000 : null;
    const vegetarian = /chay|vegetarian|vegan/.test(normalized);
    const keywords = normalized
      .replace(/[^a-z0-9\sáàạảãâầậẩẫăằắặẳẵéèẹẻẽêềệểễíìịỉĩóòọỏõôồộổỗơờợởỡúùụủũưừựửữýỳỵỷỹ]/gi, ' ')
      .split(/\s+/)
      .filter((token) => token.length > 3 && !/(trong|buổi|bữa|gia|đình|người|cho|với|dưới)/.test(token));

    return { budget, vegetarian, keywords };
  };

  const runSearch = (values) => {
    const parsed = parsePrompt(values);
    setFilters(parsed);
    setSubmitting(true);
    setQuery(values);

    const filtered = availableProducts
      .map((product) => {
        const matchesVeg = parsed.vegetarian
          ? product.tags?.some((tag) => tag.toLowerCase().includes('vegetarian'))
          : true;
        const matchesBudget = parsed.budget ? product.price * 24000 <= parsed.budget : true;
        const keywordScore = parsed.keywords.reduce((score, keyword) => {
          const nameHit = product.name.toLowerCase().includes(keyword);
          const tagHit = product.tags?.some((tag) => tag.toLowerCase().includes(keyword));
          return score + (nameHit || tagHit ? 1 : 0);
        }, 0);
        const matchesKeywords = parsed.keywords.length ? keywordScore > 0 : true;

        if (!matchesVeg || !matchesBudget || !matchesKeywords) {
          return null;
        }

        return {
          product,
          score: keywordScore + (matchesVeg ? 1 : 0) + (matchesBudget ? 1 : 0)
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.product);

    setTimeout(() => {
      setSuggestions(filtered.slice(0, 6));
      setSubmitting(false);
    }, 400);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!prompt.trim()) {
      return;
    }
    runSearch(prompt);
  };

  const handleSample = (value) => {
    setPrompt(value);
    runSearch(value);
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.8fr)]">
        <section className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold text-slate-900">{t('mealPlanner.title')}</h1>
            <p className="text-sm text-slate-600">{t('mealPlanner.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-600">
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                rows={5}
                className="rounded-3xl border border-slate-200 px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder={t('mealPlanner.form.placeholder')}
              />
            </label>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
              disabled={submitting}
            >
              {submitting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <IconSearch className="h-4 w-4" />
                  {t('mealPlanner.form.submit')}
                </>
              )}
            </button>
          </form>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t('mealPlanner.sampleTitle')}
            </p>
            <div className="flex flex-wrap gap-2">
              {t('mealPlanner.samples').map((sample) => (
                <button
                  type="button"
                  key={sample}
                  onClick={() => handleSample(sample)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:border-primary hover:text-primary"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-4 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {t('mealPlanner.inventory.title')}
              </h2>
              <p className="text-sm text-slate-500">
                {t('mealPlanner.inventory.description')}
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold text-primary">
              <IconInfo className="h-4 w-4" />
              {availableProducts.length} {t('mealPlanner.inventory.items')}
            </span>
          </div>
          <ul className="space-y-3 text-sm text-slate-600">
            {availableProducts.slice(0, 5).map((product) => (
              <li
                key={product.id}
                className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3"
              >
                <span className="font-medium text-slate-700">{product.name}</span>
                <span className="text-xs text-slate-500">
                  {t('mealPlanner.stockLabel', { stock: product.stock ?? 0 })}
                </span>
              </li>
            ))}
            {availableProducts.length > 5 ? (
              <li className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                +{availableProducts.length - 5} {t('mealPlanner.inventory.more')}
              </li>
            ) : null}
          </ul>
        </aside>
      </div>

      {submitting ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-[32px] border border-slate-200 bg-white">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : suggestions.length ? (
        <section className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                {t('mealPlanner.resultsTitle')}
              </h2>
              <p className="text-sm text-slate-500">{query}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {suggestions.length} Product{suggestions.length !== 1 ? 's' : ''}
              </span>
              {filters.budget ? (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {t('mealPlanner.budgetChip', {
                    budget: new Intl.NumberFormat(
                      locale === 'vi' ? 'vi-VN' : 'en-US'
                    ).format(filters.budget)
                  })}
                </span>
              ) : null}
              {filters.vegetarian ? (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-600">
                  {t('mealPlanner.vegetarianChip')}
                </span>
              ) : null}
              {filters.keywords.length ? (
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-600">
                  {t('mealPlanner.keywordsChip', {
                    keywords: filters.keywords.join(', ')
                  })}
                </span>
              ) : null}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : query ? (
        <section className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-base font-semibold text-slate-700">
            {t('mealPlanner.noResults')}
          </p>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-500">
              {t('mealPlanner.fallbackTitle')}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {availableProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {loading && !products.length ? (
        <div className="flex min-h-[160px] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : null}
    </div>
  );
}

export default MealPlanner;
