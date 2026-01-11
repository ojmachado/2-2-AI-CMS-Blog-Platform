import { neon } from '@neondatabase/serverless';

// Variáveis para armazenar o estado da conexão
let initError: string | null = null;
let activeKey: string | null = null;
let sql: any = null;

const URL_KEYS = ['POSTGRES_URL', 'DATABASE_URL'];

// Função para obter a string de conexão e garantir SSL para o Neon
const getConnectionString = (): string | undefined => {
  let connectionString: string | undefined;
  
  for (const key of URL_KEYS) {
    if (process.env[key]) {
      connectionString = process.env[key];
      activeKey = key;
      break;
    }
  }

  if (!connectionString) {
    initError = `Database connection failed: Please set the ${URL_KEYS[0]} environment variable in your Vercel project.`;
    console.error(`[Database] ${initError}`);
    return undefined;
  }

  console.log(`[Database] Attempting to connect via: ${activeKey}`);

  if (connectionString.includes('.neon.tech') && !connectionString.includes('sslmode')) {
    connectionString += (connectionString.includes('?') ? '&' : '?') + 'sslmode=require';
    console.log('[Database] Auto-appended sslmode=require for Neon compatibility.');
  }
  
  return connectionString;
};

// Inicializa a conexão
try {
  const connectionString = getConnectionString();
  if (connectionString) {
    sql = neon(connectionString);
    initError = null;
  }
} catch (error: any) {
  initError = `Failed to create database connection: ${error.message}`;
  console.error(`[Database] ${initError}`);
}

// Wrapper para manter compatibilidade com a API do 'pg' (pool.query)
// O driver 'neon' retorna as linhas diretamente, 'pg' retorna um objeto { rows: [...] }
export const db = sql ? {
  query: async (queryText: string, values?: any[]) => {
    try {
      const rows = await sql(queryText, values || []);
      return { rows, rowCount: rows.length }; // Mimic 'pg' result object
    } catch (e: any) {
      console.error("[Database Query Error]", e);
      // Propaga o erro para ser tratado no endpoint da API
      throw new Error(e.message);
    }
  }
} : undefined;

export const isDbReady = !!db;

export const getDebugInfo = () => {
    const envStatus: Record<string, string> = {};
    URL_KEYS.forEach(k => {
        const val = process.env[k];
        if (val) {
            if (val.startsWith('postgres')) {
                const hasSSL = val.includes('sslmode=require');
                envStatus[k] = `Set. Valid format. ${hasSSL ? '[SSL OK]' : '[SSL Missing]'}`;
            } else {
                envStatus[k] = `Set, but format is invalid. Must start with 'postgres://'.`;
            }
        } else {
            envStatus[k] = 'Missing';
        }
    });

    return {
        isReady: isDbReady,
        initError,
        activeKey,
        envStatus,
        driver: '@neondatabase/serverless'
    };
};

export async function initDb() {
  if (!db) return ['Database connection is not ready. Check environment variables.'];
  
  const logs: string[] = [];

  try {
    logs.push("Starting Schema Check with @neondatabase/serverless...");

    // Todas as chamadas agora usam o wrapper, que é assíncrono
    await db.query(`CREATE TABLE IF NOT EXISTS posts (id VARCHAR(255) PRIMARY KEY, slug VARCHAR(255) UNIQUE NOT NULL, title TEXT NOT NULL, content TEXT, summary TEXT, tags TEXT[], status VARCHAR(50), author VARCHAR(255), created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());`);
    logs.push("Table 'posts' verified.");
    
    const postMigrations = ["ALTER TABLE posts ADD COLUMN IF NOT EXISTS seo_data JSONB", "ALTER TABLE posts ADD COLUMN IF NOT EXISTS cover_image TEXT", "ALTER TABLE posts ADD COLUMN IF NOT EXISTS social_image TEXT", "ALTER TABLE posts ADD COLUMN IF NOT EXISTS thumbnail_image TEXT", "ALTER TABLE posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()"];
    for (const query of postMigrations) {
        try { await db.query(query); logs.push(`Migration Success: ${query.split('ADD COLUMN IF NOT EXISTS ')[1]}`); } catch (e: any) { logs.push(`Migration Note: Column likely exists.`); }
    }

    await db.query(`CREATE TABLE IF NOT EXISTS app_data (key VARCHAR(255) PRIMARY KEY, data JSONB, updated_at TIMESTAMPTZ DEFAULT NOW());`);
    logs.push("Table 'app_data' verified.");

    await db.query(`CREATE TABLE IF NOT EXISTS leads (id VARCHAR(255) PRIMARY KEY, email VARCHAR(255) UNIQUE NOT NULL, name TEXT, phone VARCHAR(50), status VARCHAR(50), source VARCHAR(100), pipeline_stage VARCHAR(50), external_id VARCHAR(255), tags TEXT[], notes TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());`);
    const leadMigrations = ["ALTER TABLE leads ADD COLUMN IF NOT EXISTS pipeline_stage VARCHAR(50)", "ALTER TABLE leads ADD COLUMN IF NOT EXISTS external_id VARCHAR(255)", "ALTER TABLE leads ADD COLUMN IF NOT EXISTS tags TEXT[]"];
    for (const query of leadMigrations) { try { await db.query(query); } catch (e) {} }
    logs.push("Table 'leads' verified.");

    await db.query(`CREATE TABLE IF NOT EXISTS funnels (id VARCHAR(255) PRIMARY KEY, name TEXT, trigger VARCHAR(255), is_active BOOLEAN, nodes JSONB, start_node_id VARCHAR(255), created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());`);
    await db.query(`CREATE TABLE IF NOT EXISTS funnel_executions (id VARCHAR(255) PRIMARY KEY, funnel_id VARCHAR(255), lead_id VARCHAR(255), current_node_id VARCHAR(255), status VARCHAR(50), next_run_at TIMESTAMPTZ, history JSONB, context JSONB, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());`);
    logs.push("Tables 'funnels' & 'funnel_executions' verified.");

    await db.query(`CREATE TABLE IF NOT EXISTS templates (id VARCHAR(255) PRIMARY KEY, title TEXT, content TEXT, type VARCHAR(50), category VARCHAR(50), created_at TIMESTAMPTZ DEFAULT NOW());`);
    logs.push("Table 'templates' verified.");
    
    await db.query(`CREATE TABLE IF NOT EXISTS comments (id SERIAL PRIMARY KEY, comment TEXT, created_at TIMESTAMPTZ DEFAULT NOW());`);

    logs.push("Schema Check Completed Successfully.");
    return logs;

  } catch (e: any) {
      console.error("[Database Init Error]", e);
      logs.push(`CRITICAL ERROR: ${e.message}`);
      throw new Error(`Schema Init Failed: ${e.message}`);
  }
}
