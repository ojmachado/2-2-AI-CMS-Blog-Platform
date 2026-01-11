import { Pool, PoolConfig } from 'pg';

// Estende o tipo global para evitar erros de TS no Singleton (HMR Fix)
declare global {
  var _postgresPool: Pool | undefined;
}

let pool: Pool | undefined;
let initError: string | null = null;
let activeKey: string | null = null;

// Standard Vercel/Neon environment variables.
const URL_KEYS = ['POSTGRES_URL', 'DATABASE_URL'];

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
        isReady: !!pool,
        initError,
        activeKey,
        envStatus,
        isSingleton: !!globalThis._postgresPool
    };
};

const createPool = (): Pool | undefined => {
  let connectionString: string | undefined;
  
  // Find the primary connection string from standard variables
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

  // Auto-append SSL for Neon compatibility if not present
  if (connectionString.includes('.neon.tech') && !connectionString.includes('sslmode')) {
    connectionString += (connectionString.includes('?') ? '&' : '?') + 'sslmode=require';
    console.log('[Database] Auto-appended sslmode=require for Neon compatibility.');
  }

  try {
    const newPool = new Pool({
      connectionString,
      max: 1, // Recommended for serverless environments to avoid exhausting connections.
      connectionTimeoutMillis: 15000,
      idleTimeoutMillis: 15000,
    });
    
    newPool.on('error', (err) => {
      console.error('[Database] Idle pool client error:', err.message, err.stack);
      initError = `Pool Error: ${err.message}`;
    });

    return newPool;

  } catch (error: any) {
    initError = `Failed to create database pool: ${error.message}`;
    console.error(`[Database] ${initError}`);
    return undefined;
  }
};

// Singleton implementation for development (HMR) vs production
if (process.env.NODE_ENV === 'production') {
  pool = createPool();
} else {
  if (!globalThis._postgresPool) {
    console.log('[Database] Initializing Singleton Pool (Dev Mode)...');
    globalThis._postgresPool = createPool();
  } else {
    console.log('[Database] Reusing existing Singleton connection.');
  }
  pool = globalThis._postgresPool;
}

export const db = pool;
export const isDbReady = !!pool;

export async function initDb() {
  if (!pool) return ['Database pool not ready. Check environment variables.'];
  
  const client = await pool.connect();
  const logs: string[] = [];

  try {
    logs.push("Starting Schema Check...");

    // --- 1. Tabela POSTS ---
    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id VARCHAR(255) PRIMARY KEY, 
        slug VARCHAR(255) UNIQUE NOT NULL, 
        title TEXT NOT NULL, 
        content TEXT, 
        summary TEXT, 
        tags TEXT[], 
        status VARCHAR(50), 
        author VARCHAR(255), 
        created_at TIMESTAMPTZ DEFAULT NOW(), 
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    logs.push("Table 'posts' verified.");
    
    // Migrações Explícitas para POSTS
    const postMigrations = [
        "ALTER TABLE posts ADD COLUMN IF NOT EXISTS seo_data JSONB",
        "ALTER TABLE posts ADD COLUMN IF NOT EXISTS cover_image TEXT",
        "ALTER TABLE posts ADD COLUMN IF NOT EXISTS social_image TEXT",
        "ALTER TABLE posts ADD COLUMN IF NOT EXISTS thumbnail_image TEXT",
        "ALTER TABLE posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()"
    ];

    for (const query of postMigrations) {
        try {
            await client.query(query);
            logs.push(`Migration Success: ${query.split('ADD COLUMN IF NOT EXISTS ')[1]}`);
        } catch (e: any) {
            logs.push(`Migration Note: Column likely exists. (${query.substring(0, 50)}...)`);
        }
    }

    // --- 2. Tabela APP_DATA (Configurações) ---
    await client.query(`
      CREATE TABLE IF NOT EXISTS app_data (
        key VARCHAR(255) PRIMARY KEY, 
        data JSONB, 
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    logs.push("Table 'app_data' verified.");

    // --- 3. Tabela LEADS ---
    await client.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id VARCHAR(255) PRIMARY KEY, 
        email VARCHAR(255) UNIQUE NOT NULL, 
        name TEXT, 
        phone VARCHAR(50), 
        status VARCHAR(50), 
        source VARCHAR(100), 
        pipeline_stage VARCHAR(50), 
        external_id VARCHAR(255), 
        tags TEXT[], 
        notes TEXT, 
        created_at TIMESTAMPTZ DEFAULT NOW(), 
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    
    const leadMigrations = [
        "ALTER TABLE leads ADD COLUMN IF NOT EXISTS pipeline_stage VARCHAR(50)",
        "ALTER TABLE leads ADD COLUMN IF NOT EXISTS external_id VARCHAR(255)",
        "ALTER TABLE leads ADD COLUMN IF NOT EXISTS tags TEXT[]"
    ];
    for (const query of leadMigrations) {
        try { await client.query(query); } catch (e) {}
    }
    logs.push("Table 'leads' verified.");

    // --- 4. Tabelas de FUNIL ---
    await client.query(`
      CREATE TABLE IF NOT EXISTS funnels (
        id VARCHAR(255) PRIMARY KEY,
        name TEXT,
        trigger VARCHAR(255),
        is_active BOOLEAN,
        nodes JSONB,
        start_node_id VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS funnel_executions (
        id VARCHAR(255) PRIMARY KEY,
        funnel_id VARCHAR(255),
        lead_id VARCHAR(255),
        current_node_id VARCHAR(255),
        status VARCHAR(50),
        next_run_at TIMESTAMPTZ,
        history JSONB,
        context JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    logs.push("Tables 'funnels' & 'funnel_executions' verified.");

    // --- 5. Tabelas de TEMPLATES ---
    await client.query(`
      CREATE TABLE IF NOT EXISTS templates (
        id VARCHAR(255) PRIMARY KEY,
        title TEXT,
        content TEXT,
        type VARCHAR(50),
        category VARCHAR(50),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    logs.push("Table 'templates' verified.");

    // --- 6. Tabela de Teste ---
    await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        comment TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    logs.push("Schema Check Completed Successfully.");
    return logs;

  } catch (e: any) {
      console.error("[Database Init Error]", e);
      logs.push(`CRITICAL ERROR: ${e.message}`);
      throw new Error(`Schema Init Failed: ${e.message}`);
  } finally {
    client.release();
  }
}
