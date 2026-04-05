import { NextResponse } from 'next/server';
import { kv, isKVAvailable } from '@onreza/runtime/kv';

const DEFAULT_PRODUCTS = [
  { id: 1, title: 'Classic White Tee', price: 2500, description: 'Базовая белая футболка из 100% хлопка', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600', in_stock: true },
  { id: 2, title: 'Essential Black', price: 2800, description: 'Минималистичная черная футболка', image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600', in_stock: true },
  { id: 3, title: 'Urban Grey', price: 3200, description: 'Серая футболка с урбан дизайном', image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600', in_stock: false },
  { id: 4, title: 'Premium Cotton', price: 4500, description: 'Премиальная из органического хлопка', image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600', in_stock: true },
];

async function getProducts() {
  if (!isKVAvailable()) {
    return DEFAULT_PRODUCTS;
  }
  
  const cached = await kv.get('products', { type: 'json' });
  if (cached) return cached;
  
  await kv.set('products', JSON.stringify(DEFAULT_PRODUCTS));
  return DEFAULT_PRODUCTS;
}

async function saveProducts(products: any[]) {
  if (isKVAvailable()) {
    await kv.set('products', JSON.stringify(products));
  }
}

export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json(DEFAULT_PRODUCTS);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const products = await getProducts();
    const newProduct = { ...body, id: Date.now(), in_stock: true };
    products.push(newProduct);
    await saveProducts(products);
    return NextResponse.json(newProduct);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create product', details: error.message }, { status: 500 });
  }
}
