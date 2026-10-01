// POST /api/ebook-download  { bookId }
// Checks the user has a paid order containing this eBook, then returns a download link
// to the file in the private "ebooks" storage bucket that expires after 5 minutes.
import { supabaseAdmin, getUserFromRequest, methodNotAllowed } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res);

  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Please sign in first.' });

    const bookId = req.body?.bookId;
    if (typeof bookId !== 'string') return res.status(400).json({ error: 'Unknown book.' });

    const { data: owned, error: ownedError } = await supabaseAdmin
      .from('order_items')
      .select('id, orders!inner(user_id, status)')
      .eq('book_id', bookId)
      .eq('format', 'ebook')
      .eq('orders.user_id', user.id)
      .in('orders.status', ['paid', 'shipped'])
      .limit(1);
    if (ownedError) throw ownedError;
    if (!owned.length) return res.status(403).json({ error: "You haven't bought this eBook yet." });

    const { data: book, error: bookError } = await supabaseAdmin
      .from('books')
      .select('title, ebook_file')
      .eq('id', bookId)
      .single();
    if (bookError) throw bookError;
    if (!book.ebook_file) return res.status(404).json({ error: 'This eBook file is not available yet. Please contact support.' });

    const { data: signed, error: signError } = await supabaseAdmin.storage
      .from('ebooks')
      .createSignedUrl(book.ebook_file, 300, {
        download: `${book.title}.${book.ebook_file.toLowerCase().endsWith('.pdf') ? 'pdf' : 'epub'}`,
      });
    if (signError) {
      console.error('Signed URL failed:', signError);
      return res.status(404).json({ error: 'This eBook file is not available yet. Please contact support.' });
    }

    return res.status(200).json({ url: signed.signedUrl });
  } catch (err) {
    console.error('ebook-download failed:', err);
    return res.status(500).json({ error: 'Could not prepare your download. Please try again.' });
  }
}
