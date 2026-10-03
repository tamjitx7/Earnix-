const { sb, signClick } = require('./core');

// Task link click tracker: click save kore, tarpor asol link e redirect kore
exports.handler = async (event) => {
  const q = event.queryStringParameters || {};
  const uid = Number(q.u), tid = Number(q.t);
  if (!uid || !tid || q.s !== signClick(uid, tid)) return { statusCode: 400, body: 'Invalid link' };

  const { data: tk } = await sb.from('tasks').select('link').eq('id', tid).maybeSingle();
  if (!tk) return { statusCode: 404, body: 'Not found' };

  await sb.from('task_clicks').upsert({ user_id: uid, task_id: tid, clicked_at: new Date().toISOString() });
  return { statusCode: 302, headers: { Location: tk.link, 'Cache-Control': 'no-store' }, body: '' };
};
