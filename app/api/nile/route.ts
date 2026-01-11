import { NextRequest, NextResponse } from 'next/server';
import { db, initDb, getDebugInfo } from '../../../lib/nile';

// Helper to map snake_case DB result to camelCase for frontend
const toCamel = (o: any): any => {
  if (o === null || o === undefined) return o;
  if (Array.isArray(o)) return o.map(toCamel);
  if (o instanceof Date) return o;
  if (typeof o === 'object') {
    const n: any = {};
    Object.keys(o).forEach((k) => {
      // Very basic snake to camel
      const ck = k.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      n[ck] = toCamel(o[k]);
    });
    return n;
  }
  return o;
};

// Helper for mapping frontend camelCase to DB snake_case for INSERT/UPDATE
const toSnake = (key: string) => key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { collection, action, data, id } = body;

    // System Debug & Migration
    if (collection === 'system') {
        if (action === 'debug') {
            const debugInfo = getDebugInfo();
            let dbStatus = {
                connected: false,
                version: null,
                database: null,
                error: debugInfo.initError
            };

            if (db) {
                try {
                    const result = await db.query('SELECT current_database() as db, version() as v');
                    dbStatus.connected = true;
                    dbStatus.database = result.rows[0]?.db;
                    dbStatus.version = result.rows[0]?.v;
                    dbStatus.error = null;
                } catch (e: any) {
                    dbStatus.error = e.message;
                }
            }
            return NextResponse.json({ ...dbStatus, diagnostics: debugInfo });
        }
        
        if (action === 'migrate') {
            try {
                const logs = await initDb();
                return NextResponse.json({ success: true, logs });
            } catch (e: any) {
                return NextResponse.json({ success: false, error: e.message, logs: ["Migration Failed"] });
            }
        }
    }

    if (!db) {
        return NextResponse.json({ 
            error: 'Database connection failed', 
            details: getDebugInfo() 
        }, { status: 500 });
    }

    // Auto-init on first request (try-catch to avoid blocking if just querying)
    try { await initDb(); } catch (e) {}

    let result: any;

    switch (collection) {
      case 'posts':
        if (action === 'getAll') {
          const res = await db.query('SELECT * FROM posts ORDER BY created_at DESC');
          result = res.rows.map(row => ({
              ...toCamel(row),
              seo: row.seo_data // map seo_data back to seo
          }));
        } else if (action === 'create') {
          const { 
            title, content, summary, tags = [], status, author, 
            coverImage, socialImage, thumbnailImage, seo = {}, slug, id: newId 
          } = data;

          let finalSlug = slug;
          
          try {
            await db.query(
                `INSERT INTO posts (id, slug, title, content, summary, tags, status, author, cover_image, social_image, thumbnail_image, seo_data, created_at, updated_at) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())`,
                [newId, finalSlug, title, content, summary, tags, status, author, coverImage, socialImage, thumbnailImage, seo]
            );
            result = { success: true };
          } catch (insertErr: any) {
            // Check for unique constraint violation on slug (PostgreSQL error code 23505)
            if (insertErr.code === '23505' && insertErr.constraint === 'posts_slug_key') {
                console.warn(`[API] Slug conflict for '${finalSlug}'. Retrying with a suffix.`);
                // Append a short random string and retry
                finalSlug = `${slug}-${Math.random().toString(36).substring(2, 7)}`;
                try {
                    const updatedSeo = { ...seo, slug: finalSlug };
                    await db.query(
                        `INSERT INTO posts (id, slug, title, content, summary, tags, status, author, cover_image, social_image, thumbnail_image, seo_data, created_at, updated_at) 
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())`,
                        [newId, finalSlug, title, content, summary, tags, status, author, coverImage, socialImage, thumbnailImage, updatedSeo]
                    );
                    result = { success: true };
                } catch (retryErr: any) {
                    console.error("Insert Post Retry Error:", retryErr);
                    throw new Error(`Failed to insert post on retry: ${retryErr.message}`);
                }
            } else {
                console.error("Insert Post Error:", insertErr);
                throw new Error(`Failed to insert post: ${insertErr.message}`);
            }
          }
        } else if (action === 'update') {
          const fields = [];
          const values = [];
          let i = 1;
          for (const [k, v] of Object.entries(data)) {
              if (k === 'seo') {
                  fields.push(`seo_data = $${i++}`);
                  values.push(v);
              } else if (k === 'updatedAt') {
                  fields.push(`updated_at = $${i++}`);
                  values.push(v);
              } else if (['id', 'createdAt'].includes(k)) {
                  continue; 
              } else {
                  fields.push(`${toSnake(k)} = $${i++}`);
                  values.push(v);
              }
          }
          if (fields.length > 0) {
              values.push(id);
              const qRes = await db.query(`UPDATE posts SET ${fields.join(', ')} WHERE id = $${i}`, values);
              if (qRes.rowCount === 0) {
                  result = { success: false, error: 'record_not_found' };
              } else {
                  result = { success: true };
              }
          } else {
              result = { success: true, message: 'no_changes' };
          }
        } else if (action === 'delete') {
          await db.query('DELETE FROM posts WHERE id = $1', [id]);
          result = { success: true };
        }
        break;

      case 'leads':
        if (action === 'getAll') {
          const res = await db.query('SELECT * FROM leads ORDER BY created_at DESC');
          result = toCamel(res.rows);
        } else if (action === 'create') {
          const { id: leadId, email, name, phone, status, source, pipelineStage, externalId, tags, notes } = data;
          await db.query(`
            INSERT INTO leads (id, email, name, phone, status, source, pipeline_stage, external_id, tags, notes, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
            ON CONFLICT (email) DO UPDATE SET
              name = COALESCE(EXCLUDED.name, leads.name),
              phone = COALESCE(EXCLUDED.phone, leads.phone),
              updated_at = NOW()
          `, [leadId, email, name, phone, status, source, pipelineStage, externalId, tags, notes]);
          result = { success: true };
        } else if (action === 'update') {
           const fields = [];
           const values = [];
           let i = 1;
           for (const [k, v] of Object.entries(data)) {
               fields.push(`${toSnake(k)} = $${i++}`);
               values.push(v);
           }
           if (fields.length > 0) {
               values.push(id);
               await db.query(`UPDATE leads SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${i}`, values);
           }
           result = { success: true };
        }
        break;

      case 'cms_config':
      case 'cms_theme':
        if (action === 'get') {
          const res = await db.query('SELECT data FROM app_data WHERE key = $1', [collection]);
          result = res.rows[0]?.data || {};
        } else if (action === 'set') {
          await db.query(`
            INSERT INTO app_data (key, data, updated_at) VALUES ($1, $2, NOW())
            ON CONFLICT (key) DO UPDATE SET data = $2, updated_at = NOW()
          `, [collection, data]);
          result = { success: true };
        }
        break;

      case 'funnels':
        if (action === 'getAll') {
          const res = await db.query('SELECT * FROM funnels ORDER BY created_at DESC');
          result = toCamel(res.rows);
        } else if (action === 'create') {
          const { id: fId, name, trigger, isActive, nodes, startNodeId } = data;
          await db.query(
            `INSERT INTO funnels (id, name, trigger, is_active, nodes, start_node_id, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
            [fId, name, trigger, isActive, JSON.stringify(nodes), startNodeId]
          );
          result = { success: true };
        } else if (action === 'update') {
           const { name, trigger, isActive, nodes, startNodeId } = data;
           await db.query(
             `UPDATE funnels SET name = $1, trigger = $2, is_active = $3, nodes = $4, start_node_id = $5, updated_at = NOW() WHERE id = $6`,
             [name, trigger, isActive, JSON.stringify(nodes), startNodeId, id]
           );
           result = { success: true };
        } else if (action === 'delete') {
           await db.query('DELETE FROM funnels WHERE id = $1', [id]);
           result = { success: true };
        }
        break;
        
      case 'funnel_executions':
        if (action === 'getAll') {
            const res = await db.query('SELECT * FROM funnel_executions');
            result = toCamel(res.rows);
        } else if (action === 'create') {
            const { id: eid, funnelId, leadId, currentNodeId, status, nextRunAt, history, context } = data;
            await db.query(
                `INSERT INTO funnel_executions (id, funnel_id, lead_id, current_node_id, status, next_run_at, history, context, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
                [eid, funnelId, leadId, currentNodeId, status, nextRunAt, JSON.stringify(history), JSON.stringify(context)]
            );
            result = { success: true };
        } else if (action === 'update') {
            const fields = [];
            const values = [];
            let i = 1;
            for (const [k, v] of Object.entries(data)) {
               fields.push(`${toSnake(k)} = $${i++}`);
               values.push(k === 'history' || k === 'context' ? JSON.stringify(v) : v);
            }
            if (fields.length > 0) {
               values.push(id);
               await db.query(`UPDATE funnel_executions SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${i}`, values);
            }
            result = { success: true };
        }
        break;

      case 'templates':
        if (action === 'getAll') {
            const res = await db.query('SELECT * FROM templates');
            result = toCamel(res.rows);
        } else if (action === 'create') {
            const { id: tid, title, content, type, category } = data;
            await db.query(
                `INSERT INTO templates (id, title, content, type, category, created_at) VALUES ($1, $2, $3, $4, $5, NOW())`,
                [tid, title, content, type, category]
            );
            result = { success: true };
        }
        break;

      default:
        return NextResponse.json({ error: 'Unknown collection' }, { status: 400 });
    }

    return NextResponse.json(result || { success: true });

  } catch (error: any) {
    console.error("API Error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}