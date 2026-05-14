const PRODUCTS = [
  { id: 'p001', name: 'Classic White Tee',   category: 'Tops',        price: 24.99,  image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', sizes: ['XS','S','M','L','XL'] },
  { id: 'p002', name: 'Striped Linen Shirt', category: 'Tops',        price: 49.99,  image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400', sizes: ['S','M','L','XL'] },
  { id: 'p003', name: 'Slim Chino Pants',    category: 'Bottoms',     price: 59.99,  image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400', sizes: ['28','30','32','34','36'] },
  { id: 'p004', name: 'High-Rise Jeans',     category: 'Bottoms',     price: 79.99,  image: 'https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=400', sizes: ['24','26','28','30','32'] },
  { id: 'p005', name: 'Canvas Jacket',       category: 'Outerwear',   price: 119.99, image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400', sizes: ['S','M','L','XL'] },
  { id: 'p006', name: 'Wool Overcoat',       category: 'Outerwear',   price: 199.99, image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400', sizes: ['S','M','L','XL','XXL'] },
  { id: 'p007', name: 'Leather Belt',        category: 'Accessories', price: 34.99,  image: 'https://images.unsplash.com/photo-1624623278313-a930126a11c3?w=400', sizes: ['S/M','L/XL'] },
  { id: 'p008', name: 'Knit Beanie',         category: 'Accessories', price: 19.99,  image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=400', sizes: ['One Size'] },
];

function getProducts() { return PRODUCTS.slice(); }

function getProductById(id) { return PRODUCTS.find(p => p.id === id) || null; }

function getProductsByCategory(category) {
  if (!category || category === 'all') return PRODUCTS.slice();
  return PRODUCTS.filter(p => p.category === category);
}

function getCategories() {
  return ['all', ...new Set(PRODUCTS.map(p => p.category))];
}
