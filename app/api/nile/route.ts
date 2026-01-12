// NOTA: Esta rota de API é nomeada 'nile' por razões históricas.
// Ela interage com a conexão de banco de dados definida em 'lib/nile.ts',
// que utiliza o driver serverless do NeonDB.

import { NextRequest, NextResponse } from 'next/server';
import { db, getDebugInfo, initDb, isDbReady } from '../../../lib/nile';
import { BlogPost } from '../../../types';

export async function POST(req: NextRequest) {
  if (!isDbReady || !db) {
    return NextResponse.json({ error: 'Database connection is not available.' }, { status: 500 });
  }

  try {
    const { collection, action, data, id } = await req.json();

    switch (collection) {
      // System Actions
      case 'system':
        if (action === 'check_connection') {
            const diagnostics = getDebugInfo();
            let dbInfo = { version: null, database: null };
            if (diagnostics.isReady) {
                const versionResult = await db.query('SHOW server_version;');
                const dbNameResult = await db.query('SELECT current_database();');
                dbInfo = {
                    version: versionResult.rows[0]?.server_version,
                    database: dbNameResult.rows[0]?.current_database,
                }
            }
            return NextResponse.json({ connected: diagnostics.isReady, ...dbInfo, error: diagnostics.initError, diagnostics });
        }
        if (action === 'run_migration') {
            const logs = await initDb();
            return NextResponse.json({ success: true, logs });
        }
        break;

      // Posts Collection
      case 'posts':
        switch (action) {
          case 'getAll': {
            const { rows } = await db.query('SELECT * FROM posts ORDER BY created_at DESC');
            return NextResponse.json(rows);
          }
          case 'getById': {
            const { rows } = await db.query('SELECT * FROM posts WHERE id = $1', [id]);
            return NextResponse.json(rows[0] || null);
          }
          case 'create': {
            const newPost: BlogPost = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
            const { title, slug, summary, content, author, status, tags, seo, coverImage, socialImage, thumbnailImage } = newPost;
            await db.query(
              `INSERT INTO posts (id, title, slug, summary, content, author, status, tags, seo_data, cover_image, social_image, thumbnail_image, created_at, updated_at) 
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())`,
              [newPost.id, title, slug, summary, content, author, status, tags, seo, coverImage, socialImage, thumbnailImage]
            );
            return NextResponse.json(newPost);
          }
          case 'update': {
            const { rows: existing } = await db.query('SELECT * FROM posts WHERE id = $1', [id]);
            if (existing.length === 0) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
            const finalData = { ...existing[0], ...data, updated_at: new Date() };
            const { title, slug, summary, content, author, status, tags, seo_data, cover_image, social_image, thumbnail_image } = finalData;
            await db.query(
              `UPDATE posts SET title = $1, slug = $2, summary = $3, content = $4, author = $5, status = $6, tags = $7, seo_data = $8, cover_image = $9, social_image = $10, thumbnail_image = $11, updated_at = NOW()
               WHERE id = $12`,
              [title, slug, summary, content, author, status, tags, seo_data, cover_image, social_image, thumbnail_image, id]
            );
            return NextResponse.json({ success: true });
          }
          case 'delete': {
            await db.query('DELETE FROM posts WHERE id = $1', [id]);
            return NextResponse.json({ success: true });
          }
        }
        break;

      // App Data (Settings/Theme)
      case 'app_data': {
          const { key } = data;
          if (action === 'get') {
              const { rows } = await db.query('SELECT data FROM app_data WHERE key = $1', [key]);
              return NextResponse.json(rows[0]?.data || {});
          }
          if (action === 'set') {
              await db.query(
                  'INSERT INTO app_data (key, data, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET data = $2, updated_at = NOW()',
                  [key, JSON.stringify(data.data)]
              );
              return NextResponse.json({ success: true });
          }
      }
      break;

      // Leads Collection
      case 'leads':
        switch (action) {
            case 'getAll':
                return NextResponse.json((await db.query('SELECT * FROM leads ORDER BY created_at DESC')).rows);
            case 'create': // Upsert logic
                await db.query(
                    `INSERT INTO leads (id, email, name, phone, external_id, source, status, pipeline_stage, tags, created_at, updated_at)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
                     ON CONFLICT (email) DO UPDATE SET
                       name = EXCLUDED.name, phone = EXCLUDED.phone, source = EXCLUDED.source, status = EXCLUDED.status, updated_at = NOW()`,
                    [data.id, data.email, data.name, data.phone, data.externalId, data.source, data.status, data.pipelineStage, data.tags]
                );
                return NextResponse.json({ success: true });
            case 'update':
                const fields = Object.keys(data).filter(k => k !== 'id');
                const query = `UPDATE leads SET ${fields.map((f, i) => `${f} = $${i+1}`).join(', ')}, updated_at = NOW() WHERE id = $${fields.length + 1}`;
                const values = [...fields.map(f => data[f]), id];
                await db.query(query, values);
                return NextResponse.json({ success: true });
        }
        break;
      
      // Funnels & Executions
      case 'funnels':
        switch (action) {
            case 'getAll': return NextResponse.json((await db.query('SELECT * FROM funnels')).rows);
            case 'create':
                await db.query('INSERT INTO funnels (id, name, trigger, is_active, nodes, start_node_id) VALUES ($1, $2, $3, $4, $5, $6)', [data.id, data.name, data.trigger, data.isActive, JSON.stringify(data.nodes), data.startNodeId]);
                return NextResponse.json({ success: true });
            case 'update':
                await db.query('UPDATE funnels SET name=$1, trigger=$2, is_active=$3, nodes=$4, start_node_id=$5 WHERE id=$6', [data.name, data.trigger, data.isActive, JSON.stringify(data.nodes), data.startNodeId, id]);
                return NextResponse.json({ success: true });
            case 'delete':
                await db.query('DELETE FROM funnels WHERE id=$1', [id]);
                return NextResponse.json({ success: true });
        }
        break;

      case 'funnel_executions':
          switch (action) {
              case 'getAll': return NextResponse.json((await db.query('SELECT * FROM funnel_executions')).rows);
              case 'create':
                  await db.query('INSERT INTO funnel_executions (id, funnel_id, lead_id, current_node_id, status, next_run_at, context) VALUES ($1, $2, $3, $4, $5, $6, $7)', [data.id, data.funnelId, data.leadId, data.currentNodeId, data.status, data.nextRunAt, JSON.stringify(data.context || {})]);
                  return NextResponse.json({ success: true });
              case 'update':
                   // Dynamic update based on provided fields
                  const fields = Object.keys(data);
                  const query = `UPDATE funnel_executions SET ${fields.map((f, i) => `${f} = $${i + 1}`).join(', ')} WHERE id = $${fields.length + 1}`;
                  const values = [...fields.map(f => data[f]), id];
                  await db.query(query, values);
                  return NextResponse.json({ success: true });
          }
          break;
      
      case 'templates':
          switch (action) {
              case 'getAll': return NextResponse.json((await db.query('SELECT * FROM templates')).rows);
              case 'create':
                  await db.query('INSERT INTO templates (id, title, content, type, category) VALUES ($1, $2, $3, $4, $5)', [data.id, data.title, data.content, data.type, data.category]);
                  return NextResponse.json({ success: true });
          }
          break;
    }

    return NextResponse.json({ error: 'Invalid collection or action' }, { status: 400 });
  } catch (e: any) {
    console.error('[API Nile Error]', e);
    return NextResponse.json({ error: e.message || 'An internal server error occurred.' }, { status: 500 });
  }
}
