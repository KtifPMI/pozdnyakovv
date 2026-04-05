"use client";

import { useState, useEffect } from 'react';

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  image: string;
  in_stock: boolean;
}

const DEFAULT_PRODUCTS: Product[] = [
  { id: 1, title: 'Classic White Tee', price: 2500, description: 'Базовая белая футболка из 100% хлопка', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600', in_stock: true },
  { id: 2, title: 'Essential Black', price: 2800, description: 'Минималистичная черная футболка', image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600', in_stock: true },
  { id: 3, title: 'Urban Grey', price: 3200, description: 'Серая футболка с урбан дизайном', image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600', in_stock: false },
  { id: 4, title: 'Premium Cotton', price: 4500, description: 'Премиальная из органического хлопка', image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600', in_stock: true },
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderData, setOrderData] = useState({ name: '', phone: '', email: '', comment: '' });
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  const [logoClicks, setLogoClicks] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState({ title: '', price: '', description: '', image: '' });

  useEffect(() => {
    const saved = localStorage.getItem('tshop_products');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProducts(parsed);
        setAdminProducts(parsed);
      } catch {}
    }
    setLoading(false);
  }, []);

  const saveProducts = (prods: Product[]) => {
    localStorage.setItem('tshop_products', JSON.stringify(prods));
    setProducts(prods);
    setAdminProducts(prods);
  };

  const showToast = (message: string, type = '') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredProducts = products.filter(p => {
    if (filter === 'available') return p.in_stock;
    if (filter === 'out') return !p.in_stock;
    return true;
  });

  const handleLogoClick = () => {
    const newClicks = logoClicks + 1;
    setLogoClicks(newClicks);
    if (newClicks >= 5) {
      setLogoClicks(0);
      setShowLogin(true);
    }
  };

  const handleLogin = () => {
    if (adminPassword === 'admin123') {
      setIsAdmin(true);
      setShowLogin(false);
      showToast('Добро пожаловать!', 'success');
    } else {
      showToast('Неверный пароль');
    }
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: selectedProduct?.title + ' - ' + selectedProduct?.price + ' ₽',
          ...orderData,
        }),
      });
      showToast('Заявка отправлена! Мы свяжемся с вами', 'success');
      setShowOrderForm(false);
      setSelectedProduct(null);
      setOrderData({ name: '', phone: '', email: '', comment: '' });
    } catch (e) {
      showToast('Ошибка отправки');
    }
  };

  const addProduct = () => {
    if (!newProduct.title || !newProduct.price) {
      showToast('Заполните название и цену');
      return;
    }
    
    const newProd: Product = {
      id: Date.now(),
      title: newProduct.title,
      price: parseInt(newProduct.price) || 0,
      description: newProduct.description,
      image: newProduct.image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
      in_stock: true,
    };
    
    saveProducts([...products, newProd]);
    setNewProduct({ title: '', price: '', description: '', image: '' });
    showToast('Товар добавлен!', 'success');
  };

  const toggleStock = (product: Product) => {
    const updated = products.map(p => p.id === product.id ? { ...p, in_stock: !p.in_stock } : p);
    saveProducts(updated);
  };

  const deleteProduct = (id: number) => {
    if (!confirm('Удалить товар?')) return;
    saveProducts(products.filter(p => p.id !== id));
    showToast('Товар удален');
  };

  if (loading) {
    return (
      <div style={styles.loader}>
        <div style={styles.loaderText}>T-SHOP</div>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div style={styles.adminContainer}>
        <header style={styles.header}>
          <div style={styles.logo} onClick={() => setIsAdmin(false)}>T-SHOP</div>
          <nav>
            <a style={styles.navLink} onClick={() => setIsAdmin(false)}>На главную</a>
            <a style={styles.navLink} onClick={() => setIsAdmin(false)}>Выйти</a>
          </nav>
        </header>
        <div style={styles.adminPanel}>
          <h1 style={styles.adminTitle}>ПАНЕЛЬ АДМИНА</h1>
          
          <div style={styles.addForm}>
            <h3>ДОБАВИТЬ ТОВАР</h3>
            <div style={styles.addFormGrid}>
              <input style={styles.input} placeholder="URL изображения" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} />
              <input style={styles.input} placeholder="Название" value={newProduct.title} onChange={e => setNewProduct({...newProduct, title: e.target.value})} />
              <input style={styles.input} placeholder="Цена" type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
              <input style={styles.input} placeholder="Описание" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
            </div>
            <button style={styles.btn} onClick={addProduct}>Добавить товар</button>
          </div>

          <div style={styles.adminList}>
            {adminProducts.map(product => (
              <div key={product.id} style={styles.adminItem}>
                <img src={product.image} alt={product.title} style={styles.adminImg} />
                <div style={styles.adminItemInfo}>
                  <h3>{product.title}</h3>
                  <p>{product.price} ₽ — {product.in_stock ? 'В наличии' : 'Нет в наличии'}</p>
                </div>
                <div style={styles.adminActions}>
                  <button style={{...styles.adminBtn, ...(product.in_stock ? styles.btnOut : styles.btnIn)}} onClick={() => toggleStock(product)}>
                    {product.in_stock ? 'Нет в наличии' : 'В наличии'}
                  </button>
                  <button style={{...styles.adminBtn, ...styles.btnDelete}} onClick={() => deleteProduct(product.id)}>Удалить</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        {toast && <div style={styles.toast}>{toast.message}</div>}
      </div>
    );
  }

  return (
    <div>
      <header style={styles.header}>
        <div style={styles.logo} onClick={handleLogoClick}>T-SHOP</div>
        <nav>
          <a style={styles.navLink}>Каталог</a>
        </nav>
      </header>

      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>T-SHOP</h1>
        <p style={styles.heroSubtitle}>Премиальные футболки с уникальным дизайном</p>
      </section>

      <div style={styles.filters}>
        {['all', 'available', 'out'].map(f => (
          <button key={f} style={{...styles.filterBtn, ...(filter === f ? styles.filterBtnActive : {})}} onClick={() => setFilter(f)}>
            {f === 'all' ? 'Все' : f === 'available' ? 'В наличии' : 'Нет в наличии'}
          </button>
        ))}
      </div>

      <div style={styles.catalog}>
        {filteredProducts.map((product, i) => (
          <div key={product.id} style={{...styles.productCard, opacity: product.in_stock ? 1 : 0.6}} onClick={() => setSelectedProduct(product)}>
            <div style={styles.productImageWrap}>
              <img src={product.image} alt={product.title} style={{...styles.productImage, filter: product.in_stock ? 'none' : 'grayscale(100%)'}} />
            </div>
            <div style={styles.productInfo}>
              <h3 style={styles.productTitle}>{product.title}</h3>
              <div style={styles.productPrice}>{product.price} ₽</div>
              <span style={{...styles.productStatus, background: product.in_stock ? 'rgba(68,255,136,0.15)' : 'rgba(255,68,68,0.15)', color: product.in_stock ? '#44ff88' : '#ff4444'}}>
                {product.in_stock ? 'В наличии' : 'Нет в наличии'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {selectedProduct && !showOrderForm && (
        <div style={styles.modalOverlay} onClick={() => setSelectedProduct(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <button style={styles.modalClose} onClick={() => setSelectedProduct(null)}>✕</button>
            <img src={selectedProduct.image} alt={selectedProduct.title} style={styles.modalImage} />
            <div style={styles.modalContent}>
              <h2 style={styles.modalTitle}>{selectedProduct.title}</h2>
              <div style={styles.modalPrice}>{selectedProduct.price} ₽</div>
              <p style={styles.modalDesc}>{selectedProduct.description}</p>
              <button style={{...styles.btn, ...(selectedProduct.in_stock ? {} : styles.btnDisabled)}} disabled={!selectedProduct.in_stock} onClick={() => setShowOrderForm(true)}>
                {selectedProduct.in_stock ? 'Купить' : 'Нет в наличии'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showOrderForm && selectedProduct && (
        <div style={styles.modalOverlay} onClick={() => setShowOrderForm(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <button style={styles.modalClose} onClick={() => setShowOrderForm(false)}>✕</button>
            <div style={styles.modalContent}>
              <h2 style={styles.modalTitle}>ОФОРМЛЕНИЕ ЗАКАЗА</h2>
              <p style={styles.modalDesc}>{selectedProduct.title} — {selectedProduct.price} ₽</p>
              <form onSubmit={handleOrder}>
                <div style={styles.formGroup}>
                  <label>Имя</label>
                  <input style={styles.input} required value={orderData.name} onChange={e => setOrderData({...orderData, name: e.target.value})} />
                </div>
                <div style={styles.formGroup}>
                  <label>Телефон</label>
                  <input style={styles.input} required type="tel" value={orderData.phone} onChange={e => setOrderData({...orderData, phone: e.target.value})} />
                </div>
                <div style={styles.formGroup}>
                  <label>Email</label>
                  <input style={styles.input} required type="email" value={orderData.email} onChange={e => setOrderData({...orderData, email: e.target.value})} />
                </div>
                <div style={styles.formGroup}>
                  <label>Комментарий</label>
                  <textarea style={styles.textarea} value={orderData.comment} onChange={e => setOrderData({...orderData, comment: e.target.value})} />
                </div>
                <button type="submit" style={styles.btn}>Отправить заявку</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {showLogin && (
        <div style={styles.modalOverlay}>
          <div style={styles.loginForm}>
            <h2>ВХОД</h2>
            <input style={styles.input} type="password" placeholder="Пароль" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} />
            <button style={styles.btn} onClick={handleLogin}>Войти</button>
          </div>
        </div>
      )}

      {toast && <div style={styles.toast}>{toast.message}</div>}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  loader: { position: 'fixed', inset: 0, background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  loaderText: { fontFamily: 'var(--font-bebas)', fontSize: '48px', letterSpacing: '8px' },
  header: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(10,10,10,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #2a2a2a' },
  logo: { fontFamily: 'var(--font-bebas)', fontSize: '32px', letterSpacing: '4px', cursor: 'pointer' },
  navLink: { color: '#888', fontSize: '14px', fontWeight: 500, marginLeft: '30px', cursor: 'pointer' },
  hero: { padding: '180px 40px 80px', textAlign: 'center' },
  heroTitle: { fontFamily: 'var(--font-bebas)', fontSize: 'clamp(48px, 10vw, 120px)', letterSpacing: '12px', lineHeight: 1 },
  heroSubtitle: { color: '#888', fontSize: '16px', marginTop: '20px' },
  filters: { padding: '0 40px', marginBottom: '40px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' },
  filterBtn: { background: '#141414', border: '1px solid #2a2a2a', color: '#888', padding: '12px 24px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.3s' },
  filterBtnActive: { background: '#fff', color: '#0a0a0a', borderColor: '#fff' },
  catalog: { padding: '0 40px 80px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px', maxWidth: '1400px', margin: '0 auto' },
  productCard: { background: '#141414', border: '1px solid #2a2a2a', cursor: 'pointer', transition: 'all 0.4s' },
  productImageWrap: { position: 'relative', aspectRatio: '1', overflow: 'hidden', background: '#0a0a0a' },
  productImage: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s' },
  productInfo: { padding: '20px' },
  productTitle: { fontSize: '16px', fontWeight: 600, marginBottom: '8px' },
  productPrice: { fontFamily: 'var(--font-bebas)', fontSize: '28px', letterSpacing: '2px' },
  productStatus: { display: 'inline-block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', padding: '4px 10px', marginTop: '12px' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  modal: { background: '#141414', border: '1px solid #2a2a2a', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' },
  modalClose: { position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#888', fontSize: '24px', cursor: 'pointer', zIndex: 10 },
  modalImage: { width: '100%', aspectRatio: '1', objectFit: 'cover' },
  modalContent: { padding: '30px' },
  modalTitle: { fontFamily: 'var(--font-bebas)', fontSize: '32px', letterSpacing: '2px', marginBottom: '10px' },
  modalPrice: { fontSize: '28px', fontWeight: 700, marginBottom: '20px' },
  modalDesc: { color: '#888', fontSize: '14px', lineHeight: 1.6, marginBottom: '30px' },
  btn: { background: '#fff', color: '#0a0a0a', border: 'none', padding: '16px 32px', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '2px', cursor: 'pointer', width: '100%' },
  btnDisabled: { background: '#2a2a2a', color: '#888', cursor: 'not-allowed' },
  formGroup: { marginBottom: '20px' },
  input: { width: '100%', background: '#0a0a0a', border: '1px solid #2a2a2a', color: '#fff', padding: '14px 16px', fontSize: '14px' },
  textarea: { width: '100%', background: '#0a0a0a', border: '1px solid #2a2a2a', color: '#fff', padding: '14px 16px', fontSize: '14px', minHeight: '100px', resize: 'vertical' },
  loginForm: { background: '#141414', border: '1px solid #2a2a2a', padding: '40px', maxWidth: '400px', width: '100%' },
  toast: { position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', background: '#141414', border: '1px solid #2a2a2a', padding: '16px 32px', zIndex: 300 },
  adminContainer: { minHeight: '100vh', background: '#0a0a0a' },
  adminPanel: { padding: '120px 40px 80px', maxWidth: '1200px', margin: '0 auto' },
  adminTitle: { fontFamily: 'var(--font-bebas)', fontSize: '48px', letterSpacing: '4px', marginBottom: '40px' },
  addForm: { background: '#141414', border: '1px solid #2a2a2a', padding: '30px', marginBottom: '40px' },
  addFormGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '20px' },
  adminList: { display: 'grid', gap: '20px' },
  adminItem: { background: '#141414', border: '1px solid #2a2a2a', padding: '20px', display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: '20px', alignItems: 'center' },
  adminImg: { width: '80px', height: '80px', objectFit: 'cover' },
  adminItemInfo: { flex: 1 },
  adminActions: { display: 'flex', gap: '10px' },
  adminBtn: { background: '#0a0a0a', border: '1px solid #2a2a2a', color: '#888', padding: '10px 16px', fontSize: '12px', fontWeight: 500, cursor: 'pointer' },
  btnIn: { background: 'rgba(68,255,136,0.15)', borderColor: '#44ff88', color: '#44ff88' },
  btnOut: { background: 'rgba(255,68,68,0.15)', borderColor: '#ff4444', color: '#ff4444' },
  btnDelete: { borderColor: '#ff4444', color: '#ff4444' },
};
