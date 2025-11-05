import { useLocale } from '../i18n/LocaleContext.jsx';

const footerColumns = [
  {
    titleKey: 'common.footerColumnTitles.account',
    links: [
      { key: 'common.footerLinks.myAccount', slug: 'my-account' },
      { key: 'common.footerLinks.orderHistory', slug: 'order-history' },
      { key: 'common.footerLinks.shoppingCart', slug: 'shopping-cart' }
    ]
  },
  {
    titleKey: 'common.footerColumnTitles.help',
    links: [
      { key: 'common.footerLinks.contact', slug: 'contact' },
      { key: 'common.footerLinks.faqs', slug: 'faqs' },
      { key: 'common.footerLinks.terms', slug: 'terms' }
    ]
  },
  {
    titleKey: 'common.footerColumnTitles.information',
    links: [
      { key: 'common.footerLinks.about', slug: 'about' },
      { key: 'common.footerLinks.shop', slug: 'shop' },
      { key: 'common.footerLinks.product', slug: 'product' }
    ]
  },
  {
    titleKey: 'common.footerColumnTitles.categories',
    links: [
      { key: 'common.footerLinks.fruitVeg', slug: 'fruit-vegetables' },
      { key: 'common.footerLinks.meatFish', slug: 'meat-fish' },
      { key: 'common.footerLinks.breadBakery', slug: 'bread-bakery' }
    ]
  }
];

function AppFooter() {
  const { t } = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-200">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-8 md:grid-cols-[minmax(200px,280px)_repeat(4,minmax(140px,1fr))]">
          <div className="flex flex-col gap-4">
            <div className="text-2xl font-semibold text-primary">Ecobazar</div>
            <p className="text-sm leading-relaxed text-slate-400">
              {t('common.footerDescription')}
            </p>
          </div>
          {footerColumns.map((column) => (
            <div key={column.titleKey} className="flex flex-col gap-3">
              <h5 className="text-sm font-semibold uppercase tracking-wide text-white">
                {t(column.titleKey)}
              </h5>
              <nav>
                {column.links.map((link) => (
                  <a
                    href={`#${link.slug}`}
                    key={link.key}
                    className="block py-1 text-sm text-slate-400 transition hover:text-primary"
                  >
                    {t(link.key)}
                  </a>
                ))}
              </nav>
            </div>
          ))}
        </div>

        <div className="mt-10 h-px bg-slate-800" />

        <div className="mt-8 flex flex-col gap-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <span>{t('common.footerBottom', { year })}</span>
          <div className="flex flex-wrap items-center gap-4">
            <a href="#privacy" className="transition hover:text-primary">
              {t('common.footerPolicies.privacy')}
            </a>
            <a href="#terms" className="transition hover:text-primary">
              {t('common.footerPolicies.terms')}
            </a>
            <a href="#sitemap" className="transition hover:text-primary">
              {t('common.footerPolicies.sitemap')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default AppFooter;
