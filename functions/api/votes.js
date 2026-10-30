const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }
});
const validVoterId = value => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
const validChoice = value => value === 'boy' || value === 'girl';
const validName = value => typeof value === 'string' && value.trim().length >= 1 && [...value.trim()].length <= 40 && !/[\u0000-\u001f\u007f]/.test(value);

async function results(db, voterId) {
  const counts = await db.prepare('SELECT choice, COUNT(*) AS total FROM votes GROUP BY choice').all();
  const current = await db.prepare('SELECT choice, voter_name FROM votes WHERE voter_id = ?').bind(voterId).first();
  const summary = { boy: 0, girl: 0, yourChoice: current?.choice ?? null, yourName: current?.voter_name ?? null };
  for (const row of counts.results || []) if (validChoice(row.choice)) summary[row.choice] = Number(row.total);
  return summary;
}

export async function onRequestGet({ request, env }) {
  if (!env.DB) return json({ error: '尚未設定資料庫，請依照 README 綁定 D1 資料庫。' }, 503);
  const voterId = new URL(request.url).searchParams.get('voterId');
  if (!validVoterId(voterId)) return json({ error: '無效的投票識別碼。' }, 400);
  try { return json(await results(env.DB, voterId)); }
  catch (error) { console.error('GET votes failed:', error); return json({ error: '暫時無法讀取票數，請稍後再試。' }, 500); }
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ error: '尚未設定資料庫，請依照 README 綁定 D1 資料庫。' }, 503);
  if (!(request.headers.get('content-type') || '').toLowerCase().includes('application/json')) return json({ error: '請使用 JSON 格式。' }, 415);
  let body;
  try { body = await request.json(); } catch (_) { return json({ error: '資料格式不正確。' }, 400); }
  if (!validVoterId(body?.voterId) || !validChoice(body?.choice) || !validName(body?.name)) return json({ error: '投票資料不正確。' }, 400);
  try {
    // Unique voter_id means duplicates never change the original vote, even on concurrent requests.
    await env.DB.prepare('INSERT OR IGNORE INTO votes (voter_id, choice, voter_name) VALUES (?, ?, ?)').bind(body.voterId, body.choice, body.name.trim()).run();
    return json(await results(env.DB, body.voterId));
  } catch (error) { console.error('POST votes failed:', error); return json({ error: '投票暫時失敗，請稍後再試。' }, 500); }
}
