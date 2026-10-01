import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import BookCard from '../components/BookCard';
import { useBooks, formatsOf, lowestPrice } from '../lib/catalog';
import { CATEGORY_NAMES } from '../../shared/shop';

const SORTS = {
  featured: ['Featured', (a, b) => (b.bestseller - a.bestseller) || b.rating - a.rating],
  bestsellers: ['Bestsellers first', (a, b) => (b.bestseller - a.bestseller) || b.rating - a.rating],
  newest: ['Newest', (a, b) => (b.is_new - a.is_new) || b.published_year - a.published_year],
  'price-asc': ['Price: low to high', (a, b) => lowestPrice(a) - lowestPrice(b)],
  'price-desc': ['Price: high to low', (a, b) => lowestPrice(b) - lowestPrice(a)],
  rating: ['Top rated', (a, b) => b.rating - a.rating],
};

export default function Catalog() {
  const { books, loading, error } = useBooks();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const category = params.get('category') || '';
  const format = params.get('format') || '';
  const sort = SORTS[params.get('sort')] ? params.get('sort') : 'featured';

  function update(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  }

  const results = useMemo(() => {
    const needle = q.toLowerCase();
    return books
      .filter(b => !needle || `${b.title} ${b.author} ${b.category}`.toLowerCase().includes(needle))
      .filter(b => !category || b.category === category)
      .filter(b => !format || formatsOf(b).includes(format))
      .sort(SORTS[sort][1]);
  }, [books, q, category, format, sort]);

  const categories = CATEGORY_NAMES;
  const heading = q ? `Results for “${q}”` : category || (format === 'ebook' ? 'eBooks' : format === 'paperback' ? 'Paperbacks' : 'All books');

  return (
    <section className="catalog">
      <div className="container catalog-inner">
        <aside className="filters">
          <div className="filter-group">
            <h3>Category</h3>
            <button className={`filter-opt${!category ? ' active' : ''}`} onClick={() => update('category', '')}>All categories</button>
            {categories.map(c => (
              <button key={c} className={`filter-opt${category === c ? ' active' : ''}`} onClick={() => update('category', c)}>{c}</button>
            ))}
          </div>
          <div className="filter-group">
            <h3>Format</h3>
            {[['', 'Any format'], ['paperback', 'Paperback'], ['ebook', 'eBook']].map(([v, label]) => (
              <button key={label} className={`filter-opt${format === v ? ' active' : ''}`} onClick={() => update('format', v)}>{label}</button>
            ))}
          </div>
        </aside>

        <div className="catalog-main">
          <div className="catalog-head">
            <div>
              <h1>{heading}</h1>
              <p className="muted">{loading ? 'Loading…' : `${results.length} book${results.length === 1 ? '' : 's'}`}</p>
            </div>
            <div className="catalog-controls">
              <select className="mobile-only" value={category} onChange={e => update('category', e.target.value)} aria-label="Category">
                <option value="">All categories</option>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
              <select className="mobile-only" value={format} onChange={e => update('format', e.target.value)} aria-label="Format">
                <option value="">Any format</option>
                <option value="paperback">Paperback</option>
                <option value="ebook">eBook</option>
              </select>
              <select value={sort} onChange={e => update('sort', e.target.value)} aria-label="Sort by">
                {Object.entries(SORTS).map(([key, [label]]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </div>
          </div>

          {(q || category || format) && (
            <div className="active-filters">
              {q && <button onClick={() => update('q', '')}>“{q}” ✕</button>}
              {category && <button onClick={() => update('category', '')}>{category} ✕</button>}
              {format && <button onClick={() => update('format', '')}>{format === 'ebook' ? 'eBook' : 'Paperback'} ✕</button>}
              <button className="clear" onClick={() => setParams({}, { replace: true })}>Clear all</button>
            </div>
          )}

          {error && <p className="form-error">{error}</p>}
          {!loading && !results.length && (
            <div className="empty-state">
              <span>📚</span>
              <h3>No books found</h3>
              <p className="muted">Try a different search or remove a filter.</p>
            </div>
          )}

          <div className="book-grid">
            {results.map(b => <BookCard key={b.id} book={b} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
