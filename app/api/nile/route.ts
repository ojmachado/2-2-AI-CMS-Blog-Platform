import { NextRequest, NextResponse } from 'next/server';

// ==================================================================================
// MODO LOCAL ATIVADO: A API de banco de dados foi desativada.
// A aplicação agora opera 100% no client-side usando o localStorage do navegador.
// Toda a lógica de dados foi movida para /services/dbService.ts.
// ==================================================================================

export async function POST(req: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Backend API is disabled.',
      message: 'Application is running in local storage mode. Data logic has been moved to services/dbService.ts.' 
    }, 
    { status: 418 } // "I'm a teapot" - indicates the server refuses to brew coffee because it is a teapot.
  );
}
