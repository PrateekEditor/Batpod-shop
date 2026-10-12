'use client';

import { createContext, useContext } from 'react';
import { RANGES } from './profile';

/**
 * The ranges, from the database.
 *
 * The root layout fetches `/api/categories` on the server (cached a minute)
 * and hands the list down here, so the header tabs, the mobile drawer, the
 * footer and the signup questions all follow whatever is in the admin — add
 * a category there and it appears everywhere on the next build/revalidate.
 * The static RANGES list is only the fallback for when the API is down.
 */
const CategoriesContext = createContext(null);

export function CategoriesProvider({ categories, children }) {
  const list = Array.isArray(categories) && categories.length
    ? categories.map((c) => ({ slug: c.slug, name: c.name, blurb: c.tagline || c.description || '', accent: c.accent, count: c.productCount }))
    : RANGES;
  return <CategoriesContext.Provider value={list}>{children}</CategoriesContext.Provider>;
}

export function useCategories() {
  return useContext(CategoriesContext) || RANGES;
}
