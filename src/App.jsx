import { useEffect, useMemo, useState } from 'react';
import AppHeader from './components/AppHeader.jsx';
import AppFooter from './components/AppFooter.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Shop from './pages/Shop.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import MealPlanner from './pages/MealPlanner.jsx';
import BMI from './pages/BMI.jsx'
import EatClean from './pages/EatClean.jsx';
import { LocaleProvider, useLocale } from './i18n/LocaleContext.jsx';

function AppInner() {
  const { t } = useLocale();
  const [activePage, setActivePage] = useState('home');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch('/mock/products.json');
        if (!response.ok) {
          throw new Error('load-error');
        }
        const payload = await response.json();
        setProducts(payload);
        setError('');
      } catch (fetchError) {
        setError(fetchError.message || 'load-error');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const applyRoute = () => {
      const { page, productId } = parseHash(window.location.hash);
      setActivePage(page);
      setSelectedProductId(productId ?? null);
    };

    applyRoute();
    window.addEventListener('hashchange', applyRoute);
    return () => window.removeEventListener('hashchange', applyRoute);
  }, []);

  const resolvedError =
    error === 'load-error' ? t('common.alertErrorDescription') : error || '';

  const selectedProduct = useMemo(
    () => products.find((item) => item.id === selectedProductId),
    [products, selectedProductId]
  );

  const relatedProducts = useMemo(() => {
    if (!selectedProduct) return [];
    return products
      .filter(
        (item) =>
          item.id !== selectedProduct.id && item.category === selectedProduct.category
      )
      .slice(0, 4);
  }, [products, selectedProduct]);

  useEffect(() => {
    if (activePage === 'product' && !loading && !selectedProduct) {
      setActivePage('shop');
    }
  }, [activePage, loading, selectedProduct]);

  const navigateTo = (pageKey, options = {}) => {
    if (pageKey === 'product' && options.productId) {
      window.location.hash = `product/${options.productId}`;
    } else if (pageKey === 'home') {
      window.location.hash = '';
    } else {
      window.location.hash = pageKey;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (pageKey) => {
    navigateTo(pageKey);
  };

  const handleViewProduct = (product) => {
    if (!product) return;
    navigateTo('product', { productId: product.id });
  };

  const handleBackToShop = () => {
    navigateTo('shop');
  };

  const renderContent = () => {
    switch (activePage) {
      case 'home':
        return (
          <Home
            products={products}
            loading={loading}
            errorMessage={resolvedError}
            onExploreShop={() => handleNavigate('shop')}
          />
        );
      case 'about':
        return <About />;
      case 'contact':
        return <Contact />;
      case 'mealPlanner':
        return <MealPlanner products={products} loading={loading} />;
      case 'shop':
        return (
          <Shop
            products={products}
            loading={loading}
            error={resolvedError}
            onViewProduct={handleViewProduct}
          />
        );
      case 'product':
        return (
          <ProductDetail
            product={selectedProduct}
            relatedProducts={relatedProducts}
            onBack={handleBackToShop}
            onProductClick={handleViewProduct}
          />
        );
        case'bmi':
        return <BMI/>
        case 'eatClean':
        return <EatClean/>;
      default:
        return (
          <Shop
            products={products}
            loading={loading}
            error={resolvedError}
            onViewProduct={handleViewProduct}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <AppHeader
        activePage={activePage === 'product' ? 'shop' : activePage}
        onNavigate={handleNavigate}
      />
      <main
        className={`flex-1 ${
          ['home', 'about', 'contact', 'product'].includes(activePage)
            ? ''
            : 'px-4 py-10 md:px-12 lg:px-16'
        }`}
      >
        {renderContent()}
      </main>
      <AppFooter />
    </div>
  );
}

function App() {
  return (
    <LocaleProvider>
      <AppInner />
    </LocaleProvider>
  );
}

export default App;

function parseHash(hash) {
  const clean = hash.replace(/^#/, '');
  if (!clean || clean === 'home') {
    return { page: 'home' };
  }
  if (clean.startsWith('product/')) {
    const [, productId] = clean.split('/');
    return { page: 'product', productId };
  }
  const allowed = new Set(['shop', 'about', 'contact', 'mealPlanner','bmi','eatClean']);
  if (allowed.has(clean)) {
    return { page: clean };
  }
  return { page: 'home' };
}
