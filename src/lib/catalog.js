import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { BOOKS } from '../data/books';

// Loads the catalog once per visit: from Supabase when connected, otherwise the sample data.
let cache = null;

function loadBooks() {
  if (!cache) {
    cache = supabase
      ? supabase
          .from('books')
          .select('*')
          .eq('active', true)
          .order('title')
          .then(({ data, error }) => {
            if (error) throw error;
            return data;
          })
      : Promise.resolve(BOOKS.filter(b => b.active !== false));
    cache.catch(() => { cache = null; });
  }
  return cache;
}

// Called after an admin changes books so the shop shows the latest data.
export function refreshBooks() {
  cache = null;
}

export function useBooks() {
  const [state, setState] = useState({ books: [], loading: true, error: null });

  useEffect(() => {
    let alive = true;
    loadBooks()
      .then(books => alive && setState({ books, loading: false, error: null }))
      .catch(() => alive && setState({ books: [], loading: false, error: 'Could not load books. Please refresh.' }));
    return () => { alive = false; };
  }, []);

  return state;
}


export const formatsOf = book =>
  [book.paperback_price != null && 'paperback', book.ebook_price != null && 'ebook'].filter(Boolean);

export const inStock = (book, format) => format !== 'paperback' || book.paperback_stock > 0;

export const lowestPrice = book =>
  Math.min(...formatsOf(book).map(f => (f === 'paperback' ? book.paperback_price : book.ebook_price)));
