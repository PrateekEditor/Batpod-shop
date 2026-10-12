'use client';

import Link from 'next/link';
import { motion, MotionConfig, AnimatePresence } from 'motion/react';

/**
 * Buttons that respond to the hand.
 *
 * Every primary action in the shop is one of these: a slight lift on hover, a
 * press on tap, both on a spring so they feel physical rather than timed.
 * Built on the `motion` library (motion.dev) — the React successor to Framer
 * Motion — and wrapped in MotionConfig with `reducedMotion="user"` so anyone
 * who has asked their OS for less movement gets none of it.
 */
const SPRING = { type: 'spring', stiffness: 520, damping: 28, mass: 0.6 };

export const press = {
  whileHover: { y: -1.5, scale: 1.015 },
  whileTap: { scale: 0.965, y: 0 },
  transition: SPRING,
};

export function MotionProvider({ children }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/** A <button> with the press behaviour. Takes every prop a button does. */
export function Pressable({ className = 'btn', ...rest }) {
  return <motion.button className={className} {...press} {...rest} />;
}

/** A Next.js <Link> styled as a button, with the same press. */
const MotionLink = motion.create(Link);
export function PressableLink({ className = 'btn', ...rest }) {
  return <MotionLink className={className} {...press} {...rest} />;
}

/** A plain <a> (external, tel:, mailto:, upi:) with the same press. */
export function PressableA({ className = 'btn', ...rest }) {
  return <motion.a className={className} {...press} {...rest} />;
}

export { motion, AnimatePresence };
