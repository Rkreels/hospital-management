import { NextRequest, NextResponse } from 'next/server';

// Declare global fileStore
declare global {
  // eslint-disable-next-line no-var
  var documentFileStore: Map<string, { buffer: Buffer; filename: string; mimetype: string }> | undefined;
}

// Get the global file store
function getFileStore(): Map<string, { buffer: Buffer; filename: string; mimetype: string }> {
  return globalThis.documentFileStore || new Map();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    const fileStore = getFileStore();
    
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
