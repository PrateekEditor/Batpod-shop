import './globals.css';
import { CartProvider } from '../lib/cart';
import { AuthProvider } from '../lib/auth';
import Header from '../components/Header';
import { ThemeProvider, THEME_BOOT_SCRIPT } from '../lib/theme';
import { TransitionProvider } from '../lib/transitions';
import ShopGate from '../components/ShopGate';
import SiteFooter from '../components/SiteFooter';
import CookieConsent from '../components/CookieConsent';
import { MotionProvider } from '../components/Motion';
import { CategoriesProvider } from '../lib/categories';
import { ToastProvider } from '../components/Toast';
import { getCategories } from '../lib/api';

export const metadata = {
  title: {
    default: 'Batpod Labs — 3D printed gear for riders, desks and daily life',
    template: '%s · Batpod Labs',
  },
  description:
    'Designed and printed in India. Bike and rider gear, tabletop pieces, and small fixes for everyday annoyances.',
  openGraph: {
    title: 'Batpod Labs',
    description: 'Designed and printed in India — bike gear, tabletop pieces and daily fixes.',
    type: 'website',
  },
};

export default async function RootLayout({ children }) {
  // The ranges drive the nav. Cached for a minute by lib/api; if the API is
  // down at render time the layout still renders with the built-in list.
  let categories = [];
  try {
    categories = await getCategories();
  } catch {
    categories = [];
  }
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Applies the saved theme before the first paint, so dark mode never flashes white. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700&family=Public+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap"
        />
      </head>
      <body>
        <ThemeProvider>
        <MotionProvider>
        <CategoriesProvider categories={categories}>
        <ToastProvider>
        <TransitionProvider>
        <AuthProvider>
        <CartProvider>
          <Header />
          <main><ShopGate>{children}</ShopGate></main>
          <SiteFooter />
          <CookieConsent />
        </CartProvider>
        </AuthProvider>
        </TransitionProvider>
        </ToastProvider>
        </CategoriesProvider>
        </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
