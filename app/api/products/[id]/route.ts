import { NextResponse } from 'next/server';
import { kv, isKVAvailable } from '@onreza/runtime/kv';

async function getProducts() {
  if (!isKVAvailable()) return [];
  const cached = await kv.get('products', { type: 'json' });
  return cached || [];
}

async function saveProducts(products: any[]) {
  if (isKVAvailable()) {
    await kv.set('products', JSON.stringify(products));
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    let products = await getProducts();
    products = products.map((p: any) => p.id.toString() === id ? { ...p, ...body } : p);
    await saveProducts(products);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update product', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    let products = await getProducts();
    products = products.filter((p: any) => p.id.toString() !== id);
    await saveProducts(products);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete product', details: error.message }, { status: 500 });
  }
}
