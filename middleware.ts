import { NextRequest, NextResponse } from 'next/server';

// O middleware do Clerk foi removido. Esta é uma implementação vazia para substituí-lo
// e permitir que todas as requisições passem diretamente.
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  // Mantém o matcher para consistência estrutural, mas o middleware acima não executa nenhuma lógica de bloqueio.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
