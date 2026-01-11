
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Rota desativada no modo Client-Side SPA
  return NextResponse.json(
    { message: "API routes not supported in local mode." }, 
    { status: 501 }
  );
}
