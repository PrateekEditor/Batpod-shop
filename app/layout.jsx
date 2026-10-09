import './globals.css';
import { CartProvider } from '../lib/cart';
import { AuthProvider } from '../lib/auth';
import Header from '../components/Header';
import { ThemeProvider, THEME_BOOT_SCRIPT } from '../lib/theme';
import { TransitionProvider } from '../lib/transitions';

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

export default function RootLayout({ children }) {
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
        <TransitionProvider>
        <AuthProvider>
        <CartProvider>
          <Header />
          <main>{children}</main>
          <footer className="site-footer">
            <div className="container inner">
              <span>Batpod Labs — printed to order in Pune.</span>
              <span className="mono">Prices in ₹, inclusive of taxes.</span>
            </div>
          </footer>
        </CartProvider>
        </AuthProvider>
        </TransitionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
