'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from './Motion';

/**
 * Small confirmations in the corner: "Added to cart · View cart". The pattern
 * every storefront uses because a button that only changes its own label is
 * easy to miss when the cart is off-screen.
 */
const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const seq = useRef(0);
  const dismiss = useCallback((id) => setItems((cur) => cur.filter((t) => t.id !== id)), []);
  const show = useCallback(
    ({ text, kind = 'good', action, ttl = 3200 }) => {
      const id = (seq.current += 1);
      setItems((cur) => [...cur.slice(-2), { id, text, kind, action }]);
      window.setTimeout(() => dismiss(id), ttl);
    },
    [dismiss]
  );
  const value = useMemo(() => ({ show, dismiss }), [show, dismiss]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite">
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.id}
              className={`toast ${t.kind}`}
              role="status"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 500, damping: 32 }}
            >
              <span>{t.text}</span>
              {t.action && (
                <Link href={t.action.href} onClick={() => dismiss(t.id)}>
                  {t.action.label}
                </Link>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext) || { show: () => {}, dismiss: () => {} };
}
