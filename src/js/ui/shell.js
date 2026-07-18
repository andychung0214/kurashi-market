import { createSafeStorage } from '../core/storage.js';
import { applyTheme, normalizeTheme } from './theme.js';

const navItems = [
  ['home', '首頁', 'index.html'],
  ['products', '選物', 'products.html'],
  ['favorites', '收藏', 'favorites.html'],
  ['about', '關於暮集', 'about.html'],
  ['faq', '購物說明', 'faq.html']
];

function navMarkup(active) {
  return navItems.map(([id, label, href]) =>
    `<a href="${href}"${active === id ? ' aria-current="page"' : ''}>${label}</a>`).join('');
}

export function shellMarkup({ active = '', cartCount = 0 } = {}) {
  return {
    header: `
      <a class="skip-link" href="#main-content">跳至主要內容</a>
      <div class="notice-bar"><span>滿 NT$2,000 免運</span><span>靜態展示商店・付款皆為測試模擬</span></div>
      <div class="site-header__inner page-shell">
        <a class="brand" href="index.html" aria-label="暮集選物所首頁">
          <span class="brand__mark" aria-hidden="true">暮</span>
          <span><strong>KURASHI</strong><small>暮集選物所</small></span>
        </a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">選單</button>
        <nav id="site-nav" class="site-nav" aria-label="主要導覽">${navMarkup(active)}</nav>
        <div class="header-actions">
          <details class="theme-menu">
            <summary>色</summary>
            <div class="theme-menu__panel" aria-label="選擇主題">
              <button type="button" data-theme-choice="forest"><span class="swatch swatch--forest"></span>森林綠</button>
              <button type="button" data-theme-choice="wine"><span class="swatch swatch--wine"></span>酒紅色</button>
              <button type="button" data-theme-choice="london"><span class="swatch swatch--london"></span>倫敦藍</button>
              <button type="button" data-theme-choice="yellow"><span class="swatch swatch--yellow"></span>聰穎黃</button>
            </div>
          </details>
          <a class="cart-link" href="cart.html">購物車 <span data-cart-count aria-label="${cartCount} 件商品">${cartCount}</span></a>
        </div>
      </div>`,
    footer: `
      <div class="footer-grid page-shell">
        <div><p class="footer-brand">暮集選物所</p><p>把被好好製作的物件，帶進每天的生活。</p></div>
        <nav aria-label="頁尾導覽"><a href="products.html">所有選物</a><a href="about.html">選物原則</a><a href="faq.html">購物說明</a><a href="account.html">本機帳戶</a></nav>
        <div class="footer-note"><strong>測試商店</strong><p>付款功能僅供流程展示，未產生真實交易。</p></div>
      </div>
      <p class="copyright page-shell">© 2026 KURASHI MARKET</p>`,
    mobileCart: `<a class="mobile-cart" href="cart.html"><span>查看購物車</span><strong><span data-cart-count>${cartCount}</span> 件</strong></a>`
  };
}

function cartCount(storage) {
  return storage.get('kurashi.cart', []).reduce((sum, item) => sum + item.quantity, 0);
}

export function initShell({ active = '' } = {}) {
  const storage = createSafeStorage();
  const markup = shellMarkup({ active, cartCount: cartCount(storage) });
  const header = document.querySelector('[data-site-header]');
  const footer = document.querySelector('[data-site-footer]');
  if (header) header.innerHTML = markup.header;
  if (footer) footer.innerHTML = markup.footer;
  document.body.insertAdjacentHTML('beforeend', markup.mobileCart);

  const storedTheme = normalizeTheme(storage.get('kurashi.theme', 'forest'));
  applyTheme(storedTheme);
  document.querySelectorAll('[data-theme-choice]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.themeChoice === storedTheme));
    button.addEventListener('click', () => {
      const selected = applyTheme(button.dataset.themeChoice);
      storage.set('kurashi.theme', selected);
      document.querySelectorAll('[data-theme-choice]').forEach((choice) =>
        choice.setAttribute('aria-pressed', String(choice.dataset.themeChoice === selected)));
    });
  });

  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('#site-nav');
  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    nav?.classList.toggle('is-open', !open);
  });

  window.addEventListener('kurashi:state-change', () => {
    const count = cartCount(storage);
    document.querySelectorAll('[data-cart-count]').forEach((node) => { node.textContent = String(count); });
  });
}
