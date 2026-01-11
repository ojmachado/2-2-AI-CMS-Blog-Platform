// ==================================================================================
// MODO LOCAL ATIVADO: O serviço de conexão com o banco de dados foi desativado.
// A aplicação agora opera 100% no client-side usando o localStorage do navegador.
// Toda a lógica de dados foi movida para /services/dbService.ts.
// ==================================================================================

export const db = undefined;
export const isDbReady = false;

export const getDebugInfo = () => ({
    isReady: false,
    initError: "Database connection is disabled in local-only mode.",
    activeKey: "N/A",
    envStatus: {},
    driver: 'Disabled'
});

export async function initDb() {
  return ['Database initialization is disabled in local-only mode.'];
}
