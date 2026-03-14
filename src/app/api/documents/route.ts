import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';
import { Document } from '@/types';

// Initialize global fileStore if not exists
declare global {
  var documentFileStore: Map<string, { buffer: Buffer; filename: string; mimetype: string }> | undefined;
}

// Get or create the global file store
function getFileStore(): Map<string, { buffer: Buffer; filename: string; mimetype: string }> {
  if (!globalThis.documentFileStore) {
    globalThis.documentFileStore = new Map();
  }
  return globalThis.documentFileStore;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const patientId = searchParams.get('patientId');
    const category = searchParams.get('category');
    
    if (id) {
      const document = db.getDocument(id);
      return NextResponse.json(document || { error: 'Document not found' }, { 
        status: document ? 200 : 404 
      });
    }
    
    let documents = db.getDocuments();
    
    if (patientId) {
      documents = documents.filter(d => d.patientId === patientId);
    }
    
    if (category) {
      documents = documents.filter(d => d.category === category);
    }
    
    return NextResponse.json(documents);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const patientId = formData.get('patientId') as string;
    const patientName = formData.get('patientName') as string;
    const category = formData.get('category') as string;
    const tags = formData.get('tags') as string;
    const accessLevel = formData.get('accessLevel') as string;
    const notes = formData.get('notes') as string;
    const uploadedBy = formData.get('uploadedBy') as string;
    const uploadedById = formData.get('uploadedById') as string;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Read file content
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileId = `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Store file in memory
    const fileStore = getFileStore();
    fileStore.set(fileId, {
      buffer,
      filename: file.name,
      mimetype: file.type,
    });
    
    // Determine document type
    const extension = file.name.split('.').pop()?.toLowerCase();
    let type: 'pdf' | 'image' | 'spreadsheet' | 'document' | 'video' | 'audio' | 'other' = 'other';
    
    if (extension === 'pdf') type = 'pdf';
    else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension || '')) type = 'image';
    else if (['xls', 'xlsx', 'csv'].includes(extension || '')) type = 'spreadsheet';
    else if (['doc', 'docx', 'txt', 'rtf'].includes(extension || '')) type = 'document';
    else if (['mp4', 'mov', 'avi', 'mkv'].includes(extension || '')) type = 'video';
    else if (['mp3', 'wav', 'ogg'].includes(extension || '')) type = 'audio';
    
    // Create document record
    const document = db.addDocument({
      name: file.name,
      type,
      category: (category as Document['category']) || 'Other',
      size: file.size,
      mimeType: file.type,
      url: `/api/documents/download?id=${fileId}`,
      patientId: patientId || undefined,
      patientName: patientName || undefined,
      uploadedBy: uploadedBy || 'System',
      uploadedById: uploadedById || 'system',
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      accessLevel: (accessLevel as Document['accessLevel']) || 'Internal',
      notes: notes || undefined,
    });
    
    // Add activity
    db.addActivity({
      type: 'document',
      title: 'Document uploaded',
      description: `${file.name} uploaded${patientName ? ` for ${patientName}` : ''}`,
      department: 'Records',
    });
    
    return NextResponse.json(document);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
    }
    
    const deleted = db.deleteDocument(id);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
