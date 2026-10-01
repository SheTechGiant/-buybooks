// Sample catalog. All titles, authors and descriptions are fictional placeholders.
// Used as-is when Supabase isn't connected, and uploaded to Supabase by `npm run seed`.
// Field names match the `books` table in supabase/schema.sql.
//   category: must be one of CATEGORIES in shared/shop.js
//   paperback_price / ebook_price: null = format not sold
//   ebook_file: path of the eBook file in the private "ebooks" storage bucket (upload it in Admin)
//   cover_url: optional real cover image; otherwise a cover is drawn from cover_bg / cover_fg

export const BOOKS = [
  // ---------- Self-Help ----------
  {
    id: 'ten-quiet-minutes', title: 'Ten Quiet Minutes', author: 'Leila Haddad',
    category: 'Self-Help', pages: 192, published_year: 2024, language: 'English',
    description: 'Short daily practices to calm a busy mind, sleep better and find focus — in less time than it takes to make tea.',
    paperback_price: 14.49, paperback_stock: 45, ebook_price: 5.49, ebook_file: null,
    cover_bg: '#DCEBE0', cover_fg: '#2C4A36', bestseller: true, is_new: false, rating: 4.6,
  },
  {
    id: 'the-gentle-reset', title: 'The Gentle Reset', author: 'Naomi Achterberg',
    category: 'Self-Help', pages: 228, published_year: 2026, language: 'English',
    description: 'How to rebuild your routines after burnout without guilt: small habits for rest, boundaries and energy that actually stick.',
    paperback_price: 15.99, paperback_stock: 30, ebook_price: 6.49, ebook_file: null,
    cover_bg: '#F7E9D7', cover_fg: '#7A4B1E', bestseller: false, is_new: true, rating: 4.5,
  },
  {
    id: 'unstuck-in-thirty-days', title: 'Unstuck in Thirty Days', author: 'Samuel Ofori',
    category: 'Self-Help', pages: 210, published_year: 2025, language: 'English',
    description: 'A practical month-long workbook for breaking procrastination, clearing mental clutter and finishing what you start.',
    paperback_price: 13.99, paperback_stock: 40, ebook_price: 4.99, ebook_file: null,
    cover_bg: '#1F3A5F', cover_fg: '#F2B705', bestseller: true, is_new: false, rating: 4.4,
  },

  // ---------- Motivational ----------
  {
    id: 'start-before-youre-ready', title: "Start Before You're Ready", author: 'Marcus Bell',
    category: 'Motivational', pages: 240, published_year: 2025, language: 'English',
    description: 'Why waiting for confidence keeps you stuck, and a simple framework for taking the first imperfect step on the things that matter.',
    paperback_price: 16.99, paperback_stock: 0, ebook_price: 6.99, ebook_file: null,
    cover_bg: '#F2B705', cover_fg: '#111111', bestseller: false, is_new: false, rating: 4.2,
  },
  {
    id: 'rise-anyway', title: 'Rise Anyway', author: 'Ebo Quansah',
    category: 'Motivational', pages: 256, published_year: 2026, language: 'English',
    description: 'True-to-life lessons on turning setbacks into fuel — for anyone who has been knocked down and is ready to get back up stronger.',
    paperback_price: 17.49, paperback_stock: 35, ebook_price: 6.99, ebook_file: null,
    cover_bg: '#111111', cover_fg: '#F2B705', bestseller: true, is_new: true, rating: 4.8,
  },
  {
    id: 'small-wins-big-life', title: 'Small Wins, Big Life', author: 'Hannah Kwarteng',
    category: 'Motivational', pages: 184, published_year: 2024, language: 'English',
    description: 'Celebrate the little victories and watch them add up. A warm, encouraging guide to momentum, gratitude and daily progress.',
    paperback_price: 12.99, paperback_stock: 50, ebook_price: 4.49, ebook_file: null,
    cover_bg: '#FFF1C2', cover_fg: '#A85A00', bestseller: false, is_new: false, rating: 4.5,
  },

  // ---------- Financial ----------
  {
    id: 'money-without-fear', title: 'Money Without Fear', author: 'David Okafor',
    category: 'Financial', pages: 224, published_year: 2026, language: 'English',
    description: 'A friendly guide to budgeting, saving and investing for people who were never taught how — and are tired of feeling anxious about it.',
    paperback_price: 18.99, paperback_stock: 35, ebook_price: 8.49, ebook_file: null,
    cover_bg: '#1E5631', cover_fg: '#FFFFFF', bestseller: true, is_new: true, rating: 4.5,
  },
  {
    id: 'the-debt-free-table', title: 'The Debt-Free Table', author: 'Priscilla Annan',
    category: 'Financial', pages: 200, published_year: 2025, language: 'English',
    description: 'A step-by-step plan for families to pay off debt, build an emergency fund and talk about money without arguments.',
    paperback_price: 16.49, paperback_stock: 28, ebook_price: 6.99, ebook_file: null,
    cover_bg: '#FFFFFF', cover_fg: '#1E5631', bestseller: false, is_new: false, rating: 4.6,
  },

  // ---------- Business ----------
  {
    id: 'the-small-shop-playbook', title: 'The Small Shop Playbook', author: 'Grace Mensah',
    category: 'Business', pages: 256, published_year: 2025, language: 'English',
    description: 'Practical, no-jargon steps for turning a side hustle into a profitable small business — pricing, cash flow, customers and calm.',
    paperback_price: 21.99, paperback_stock: 30, ebook_price: 9.99, ebook_file: null,
    cover_bg: '#FFFFFF', cover_fg: '#1F1A0E', bestseller: true, is_new: false, rating: 4.7,
  },
  {
    id: 'the-market-stall-ceo', title: 'The Market Stall CEO', author: 'Kofi Adjei',
    category: 'Business', pages: 272, published_year: 2026, language: 'English',
    description: 'From one table at the market to a growing brand: real-world lessons on sourcing, selling, hiring and scaling on a tight budget.',
    paperback_price: 19.99, paperback_stock: 22, ebook_price: 8.99, ebook_file: null,
    cover_bg: '#8B1E1E', cover_fg: '#FFE7A3', bestseller: false, is_new: true, rating: 4.6,
  },
  {
    id: 'pitch-it-plain', title: 'Pitch It Plain', author: 'Rebecca Lindqvist',
    category: 'Business', pages: 176, published_year: 2024, language: 'English',
    description: 'How to explain your idea in one minute, win over customers and investors, and stop drowning people in slides.',
    paperback_price: 15.49, paperback_stock: 18, ebook_price: 5.99, ebook_file: null,
    cover_bg: '#2F5D62', cover_fg: '#F7C873', bestseller: false, is_new: false, rating: 4.3,
  },

  // ---------- Girled Up ----------
  {
    id: 'she-leads-the-room', title: 'She Leads the Room', author: 'Adwoa Sarpong',
    category: 'Girled Up', pages: 232, published_year: 2026, language: 'English',
    description: 'A confidence playbook for young women: speaking up, negotiating, leading teams and owning your space at school and work.',
    paperback_price: 16.99, paperback_stock: 40, ebook_price: 6.99, ebook_file: null,
    cover_bg: '#F6D5DA', cover_fg: '#7A2E3A', bestseller: true, is_new: true, rating: 4.9,
  },
  {
    id: 'crown-yourself', title: 'Crown Yourself', author: 'Zainab Bello',
    category: 'Girled Up', pages: 168, published_year: 2025, language: 'English',
    description: 'Letters of encouragement for girls growing up — on self-worth, friendship, dreams and loving the skin you are in.',
    paperback_price: 12.99, paperback_stock: 55, ebook_price: 4.99, ebook_file: null,
    cover_bg: '#F2B705', cover_fg: '#4A1E3A', bestseller: true, is_new: false, rating: 4.8,
  },
  {
    id: 'bold-bright-brilliant', title: 'Bold, Bright & Brilliant', author: 'Efua Mensah-Bonsu',
    category: 'Girled Up', pages: 144, published_year: 2026, language: 'English',
    description: 'Stories of everyday women who built businesses, careers and communities — with activities to help readers plan their own path.',
    paperback_price: 14.99, paperback_stock: 32, ebook_price: 5.49, ebook_file: null,
    cover_bg: '#4A1E3A', cover_fg: '#FFD6E0', bestseller: false, is_new: true, rating: 4.7,
  },
];
