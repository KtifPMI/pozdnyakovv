import { NextResponse } from 'next/server';
import { kv } from '@onreza/runtime/kv';

async function getProducts() {
  try {
    const data = await kv.get('products');
    if (data) return JSON.parse(data as string);
    return [];
  } catch {
    return [];
  }
}

async function saveProducts(products: any[]) {
  try {
    await kv.set('products', JSON.stringify(products));
  } catch {}
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const products = await getProducts();
    const index = products.findIndex((p: any) => p.id.toString() === id);
    if (index === -1) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    products[index] = { ...products[index], ...body };
    await saveProducts(products);
    return NextResponse.json(products[index]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const products = await getProducts();
    const filtered = products.filter((p: any) => p.id.toString() !== id);
    await saveProducts(filtered);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
