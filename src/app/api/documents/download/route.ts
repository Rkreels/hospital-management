import { NextRequest, NextResponse } from 'next/server';
import { fileStore } from '../route';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id || !fileStore.has(id)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    const file = fileStore.get(id)!;
    
    return new NextResponse(file.buffer, {
      headers: {
        'Content-Type': file.mimetype,
        'Content-Disposition': `attachment; filename="${file.filename}"`,
        'Content-Length': file.buffer.length.toString(),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
  }
}
