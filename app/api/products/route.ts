import { NextResponse } from 'next/server';

const PRODUCTS = [
  { id: 1, title: 'Classic White Tee', price: 2500, description: 'Базовая белая футболка из 100% хлопка', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600', in_stock: true },
  { id: 2, title: 'Essential Black', price: 2800, description: 'Минималистичная черная футболка', image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600', in_stock: true },
  { id: 3, title: 'Urban Grey', price: 3200, description: 'Серая футболка с урбан дизайном', image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600', in_stock: false },
  { id: 4, title: 'Premium Cotton', price: 4500, description: 'Премиальная из органического хлопка', image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600', in_stock: true },
];

export async function GET() {
  return NextResponse.json(PRODUCTS);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newProduct = { ...body, id: Date.now(), in_stock: true };
  return NextResponse.json(newProduct);
}
