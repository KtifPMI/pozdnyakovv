import { NextResponse } from 'next/server';
import initSqlJs from 'sql.js';

let db: any = null;

async function getDb() {
  if (db) return db;
  
  const SQL = await initSqlJs({
    locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
  });
  
  db = new SQL.Database();
  return db;
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const database = await getDb();
    const body = await request.json();
    const { title, price, description, image, in_stock } = body;
    
    database.run(
      'UPDATE products SET title = ?, price = ?, description = ?, image = ?, in_stock = ? WHERE id = ?',
      [title, price, description, image, in_stock ? 1 : 0, id]
    );
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update product', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const database = await getDb();
    database.run('DELETE FROM products WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete product', details: error.message }, { status: 500 });
  }
}
