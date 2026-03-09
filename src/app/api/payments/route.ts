import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';
import type { Payment } from '@/types';

// In-memory payments storage (would be in database in production)
const payments: Payment[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get('invoiceId');
    
    let result = payments;
    if (invoiceId) {
      result = payments.filter(p => p.invoiceId === invoiceId);
    }
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoiceId, amount, method, reference, notes, paidAt, receivedBy } = body;
    
    // Get invoice
    const invoice = db.getInvoice(invoiceId);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    
    // Create payment record
    const payment = {
      id: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      invoiceId,
      amount,
      method,
      reference,
      notes,
      paidAt,
      receivedBy,
      createdAt: new Date().toISOString(),
    };
    
    payments.push(payment);
    
    // Update invoice
    const newPaidAmount = invoice.paidAmount + amount;
    const newBalance = invoice.total - newPaidAmount;
    const newStatus = newBalance <= 0 ? 'Paid' : newPaidAmount > 0 ? 'Partial' : invoice.status;
    
    db.updateInvoice(invoiceId, {
      paidAmount: newPaidAmount,
      balance: newBalance,
      status: newStatus,
      payments: [...(invoice.payments || []), payment],
    });
    
    // Add activity
    db.addActivity({
      type: 'billing',
      title: 'Payment received',
      description: `$${amount.toFixed(2)} payment for ${invoice.invoiceNumber}`,
      department: 'Billing',
    });
    
    return NextResponse.json(payment);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 });
  }
}
