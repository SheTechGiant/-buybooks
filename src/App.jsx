import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Toast from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import BookDetail from './pages/BookDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Account from './pages/Account';
import CheckoutSuccess from './pages/CheckoutSuccess';
import NotFound from './pages/NotFound';

// Admin pages load only when someone opens /admin.
const AdminLayout = lazy(() => import('./admin/AdminLayout'));
const AdminOverview = lazy(() => import('./admin/AdminOverview'));
const AdminBooks = lazy(() => import('./admin/AdminBooks'));
const AdminBookForm = lazy(() => import('./admin/AdminBookForm'));
const AdminOrders = lazy(() => import('./admin/AdminOrders'));
const AdminSubscribers = lazy(() => import('./admin/AdminSubscribers'));

// Scrolls to #section links, or to the top when the page changes (not on filter changes).
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) return el.scrollIntoView({ behavior: 'smooth' });
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollManager />
      <Header />
      <main>
        <Suspense fallback={<p className="page-loading">Loading…</p>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<Catalog />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="books" element={<AdminBooks />} />
            <Route path="books/new" element={<AdminBookForm key="new" />} />
            <Route path="books/:id" element={<AdminBookForm />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="subscribers" element={<AdminSubscribers />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </main>
      <Footer />
      <Toast />
    </>
  );
}
