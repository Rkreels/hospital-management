import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    
    if (id) {
      const item = db.getInventoryItem(id);
      return NextResponse.json(item || { error: 'Inventory item not found' }, { status: item ? 200 : 404 });
    }
    
    let inventory = db.getInventory();
    
    if (category && category !== 'all') {
      inventory = inventory.filter(i => i.category === category);
    }
    
    if (status && status !== 'all') {
      inventory = inventory.filter(i => i.status === status);
    }
    
    return NextResponse.json(inventory);
  } catch (error) {
    console.error('Failed to fetch inventory:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }
    
    // Recalculate total value if quantity or unitCost is updated
    if (updates.quantity !== undefined || updates.unitCost !== undefined) {
      const existingItem = db.getInventoryItem(id);
      if (existingItem) {
        const quantity = updates.quantity ?? existingItem.quantity;
        const unitCost = updates.unitCost ?? existingItem.unitCost;
        updates.totalValue = quantity * unitCost;
        
        // Auto-update status based on quantity
        if (quantity === 0) {
          updates.status = 'Out of Stock';
        } else if (quantity < existingItem.minStock) {
          updates.status = 'Low Stock';
        } else if (existingItem.status === 'Out of Stock' || existingItem.status === 'Low Stock') {
          updates.status = 'In Stock';
        }
      }
    }
    
    const item = db.updateInventoryItem(id, updates);
    return NextResponse.json(item || { error: 'Inventory item not found' }, { status: item ? 200 : 404 });
  } catch (error) {
    console.error('Failed to update inventory:', error);
    return NextResponse.json({ error: 'Failed to update inventory item' }, { status: 500 });
  }
}
