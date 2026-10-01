import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import BookCover from '../components/BookCover';
import { supabase } from '../lib/supabase';
import { refreshBooks } from '../lib/catalog';
import { CATEGORY_NAMES } from '../../shared/shop';

const EMPTY = {
  id: '', title: '', author: '', category: CATEGORY_NAMES[0], description: '',
  pages: '', published_year: new Date().getFullYear(), language: 'English',
  paperback_price: '', paperback_stock: 0, ebook_price: '', ebook_file: null,
  cover_url: null, cover_bg: '#F2B705', cover_fg: '#1F1A0E',
  bestseller: false, is_new: true, rating: '', active: true,
};

const slugify = s => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);

// Empty inputs → null so the database stores "not sold" / "unknown" correctly.
const num = v => (v === '' || v == null ? null : Number(v));

export default function AdminBookForm() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const [book, setBook] = useState(isNew ? EMPTY : null);
  const [sellPaperback, setSellPaperback] = useState(true);
  const [sellEbook, setSellEbook] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (isNew) return;
    supabase.from('books').select('*').eq('id', id).single().then(({ data, error }) => {
      if (error) return setError('Book not found.');
      setBook({ ...EMPTY, ...data, pages: data.pages ?? '', rating: data.rating ?? '', paperback_price: data.paperback_price ?? '', ebook_price: data.ebook_price ?? '' });
      setSellPaperback(data.paperback_price != null);
      setSellEbook(data.ebook_price != null);
    });
  }, [id, isNew]);

  if (!book) return error ? <p className="form-error">{error}</p> : <p className="muted">Loading…</p>;

  const set = (field, value) => setBook(b => ({ ...b, [field]: value }));
  const bookId = isNew ? slugify(book.id || book.title) : book.id;

  async function upload(kind, file) {
    if (!file) return;
    setError('');
    setNotice('');
    if (!bookId) return setError('Enter the title first, so the file can be named after the book.');
    const ext = file.name.split('.').pop().toLowerCase();
    setBusy(kind);
    try {
      if (kind === 'cover') {
        // New name each time so browsers don't keep showing an old cached cover.
        const path = `${bookId}-${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from('covers').upload(path, file, { contentType: file.type });
        if (error) throw error;
        set('cover_url', supabase.storage.from('covers').getPublicUrl(path).data.publicUrl);
        setNotice('Cover uploaded — press Save to keep it.');
      } else {
        const path = `${bookId}.${ext}`;
        const { error } = await supabase.storage.from('ebooks').upload(path, file, { upsert: true, contentType: file.type || (ext === 'pdf' ? 'application/pdf' : 'application/epub+zip') });
        if (error) throw error;
        set('ebook_file', path);
        setNotice('eBook file uploaded — press Save to keep it.');
      }
    } catch (err) {
      setError(`Upload failed: ${err.message}`);
    } finally {
      setBusy('');
    }
  }

  async function save(e) {
    e.preventDefault();
    setError('');
    setNotice('');
    if (!sellPaperback && !sellEbook) return setError('Sell the book as a paperback, an eBook, or both.');
    if (!CATEGORY_NAMES.includes(book.category)) return setError('Choose a category.');
    if (!bookId) return setError('Please enter a title.');

    const row = {
      ...book,
      id: bookId,
      title: book.title.trim(),
      author: book.author.trim(),
      pages: num(book.pages),
      published_year: num(book.published_year),
      rating: num(book.rating),
      paperback_price: sellPaperback ? num(book.paperback_price) : null,
      paperback_stock: sellPaperback ? Number(book.paperback_stock) || 0 : 0,
      ebook_price: sellEbook ? num(book.ebook_price) : null,
    };
    delete row.created_at;
    if (sellPaperback && row.paperback_price == null) return setError('Enter the paperback price.');
    if (sellEbook && row.ebook_price == null) return setError('Enter the eBook price.');

    setBusy('save');
    const { error } = isNew
      ? await supabase.from('books').insert(row)
      : await supabase.from('books').update(row).eq('id', id);
    setBusy('');
    if (error) {
      return setError(error.code === '23505' ? 'A book with this web address already exists — change the title or web address.' : error.message);
    }
    refreshBooks();
    if (isNew) navigate(`/admin/books/${bookId}`, { replace: true });
    setNotice('Saved ✓ — the shop now shows this version.');
  }

  async function remove() {
    if (!window.confirm(`Delete “${book.title}” permanently?`)) return;
    setBusy('delete');
    const { error } = await supabase.from('books').delete().eq('id', id);
    setBusy('');
    if (error) {
      return setError(error.code === '23503'
        ? 'This book has been ordered before, so it can’t be deleted (customers’ order history needs it). Untick “Show in shop” instead to hide it.'
        : error.message);
    }
    refreshBooks();
    navigate('/admin/books', { replace: true });
  }

  return (
    <form className="admin-form" onSubmit={save}>
      <div className="admin-form-main">
        <div className="dash-card">
          <h3>Book details</h3>
          <label>Title *<input required value={book.title} onChange={e => set('title', e.target.value)} /></label>
          {isNew && (
            <label>
              Web address
              <div className="slug-field"><span>/books/</span><input value={book.id} placeholder={slugify(book.title) || 'made-from-the-title'} onChange={e => set('id', slugify(e.target.value))} /></div>
              <small className="muted">Leave empty to make it from the title. Can’t be changed later.</small>
            </label>
          )}
          <div className="form-row">
            <label>Author *<input required value={book.author} onChange={e => set('author', e.target.value)} /></label>
            <label>
              Category *
              <select required value={CATEGORY_NAMES.includes(book.category) ? book.category : ''} onChange={e => set('category', e.target.value)}>
                {!CATEGORY_NAMES.includes(book.category) && <option value="" disabled>Choose a category…</option>}
                {CATEGORY_NAMES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          </div>
          <label>Description<textarea rows={5} value={book.description || ''} onChange={e => set('description', e.target.value)} /></label>
          <div className="form-row three">
            <label>Pages<input type="number" min="1" value={book.pages} onChange={e => set('pages', e.target.value)} /></label>
            <label>Year published<input type="number" min="1000" max="2100" value={book.published_year ?? ''} onChange={e => set('published_year', e.target.value)} /></label>
            <label>Language<input value={book.language || ''} onChange={e => set('language', e.target.value)} /></label>
          </div>
        </div>

        <div className="dash-card">
          <h3>Formats &amp; prices</h3>
          <div className="format-box">
            <label className="check"><input type="checkbox" checked={sellPaperback} onChange={e => setSellPaperback(e.target.checked)} /> Sell as paperback</label>
            {sellPaperback && (
              <div className="form-row">
                <label>Price ($) *<input type="number" min="0" step="0.01" value={book.paperback_price} onChange={e => set('paperback_price', e.target.value)} /></label>
                <label>Copies in stock<input type="number" min="0" step="1" value={book.paperback_stock} onChange={e => set('paperback_stock', e.target.value)} /></label>
              </div>
            )}
          </div>
          <div className="format-box">
            <label className="check"><input type="checkbox" checked={sellEbook} onChange={e => setSellEbook(e.target.checked)} /> Sell as eBook</label>
            {sellEbook && (
              <>
                <label>Price ($) *<input type="number" min="0" step="0.01" value={book.ebook_price} onChange={e => set('ebook_price', e.target.value)} /></label>
                <div className="file-row">
                  <span>
                    {book.ebook_file ? <>📄 <strong>{book.ebook_file}</strong></> : <span className="badge-warn">No eBook file yet — buyers can’t download it</span>}
                  </span>
                  <label className="btn btn-outline btn-sm file-btn">
                    {busy === 'ebook' ? 'Uploading…' : book.ebook_file ? 'Replace file' : 'Upload EPUB / PDF'}
                    <input type="file" accept=".epub,.pdf,application/epub+zip,application/pdf" hidden disabled={!!busy} onChange={e => upload('ebook', e.target.files[0])} />
                  </label>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <aside className="admin-form-side">
        <div className="dash-card">
          <h3>Cover</h3>
          <div className="cover-preview"><BookCover book={{ ...book, title: book.title || 'Book title', author: book.author || 'Author' }} size="lg" /></div>
          <label className="btn btn-outline btn-block file-btn">
            {busy === 'cover' ? 'Uploading…' : book.cover_url ? 'Replace cover image' : 'Upload cover image'}
            <input type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={!!busy} onChange={e => upload('cover', e.target.files[0])} />
          </label>
          {book.cover_url ? (
            <button type="button" className="link-btn" onClick={() => set('cover_url', null)}>Remove image (use drawn cover)</button>
          ) : (
            <div className="form-row">
              <label>Cover colour<input type="color" value={book.cover_bg || '#F2B705'} onChange={e => set('cover_bg', e.target.value)} /></label>
              <label>Text colour<input type="color" value={book.cover_fg || '#1F1A0E'} onChange={e => set('cover_fg', e.target.value)} /></label>
            </div>
          )}
          <small className="muted">JPG, PNG or WebP, up to 5 MB. Tall images (2:3) look best.</small>
        </div>

        <div className="dash-card">
          <h3>In the shop</h3>
          <label className="check"><input type="checkbox" checked={book.active} onChange={e => set('active', e.target.checked)} /> Show in shop</label>
          <label className="check"><input type="checkbox" checked={book.bestseller} onChange={e => set('bestseller', e.target.checked)} /> Bestseller label</label>
          <label className="check"><input type="checkbox" checked={book.is_new} onChange={e => set('is_new', e.target.checked)} /> “New” label</label>
          <label>Star rating (0–5)<input type="number" min="0" max="5" step="0.1" value={book.rating} onChange={e => set('rating', e.target.value)} /></label>
        </div>

        <div className="admin-actions">
          {error && <p className="form-error">{error}</p>}
          {notice && <p className="form-notice">{notice}</p>}
          <button className="btn btn-primary btn-block btn-lg" disabled={!!busy}>{busy === 'save' ? 'Saving…' : isNew ? 'Add book' : 'Save changes'}</button>
          {!isNew && <Link to={`/books/${id}`} className="btn btn-outline btn-block" target="_blank">View in shop ↗</Link>}
          <Link to="/admin/books" className="continue-link">← Back to all books</Link>
          {!isNew && <button type="button" className="link-btn danger" onClick={remove} disabled={!!busy}>Delete book</button>}
        </div>
      </aside>
    </form>
  );
}
