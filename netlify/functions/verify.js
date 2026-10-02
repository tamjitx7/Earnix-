const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
const { L } = require('./i18n');
const { fx } = require('./emoji');
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

function validInitData(initData) {
  const p = new URLSearchParams(initData);
  const hash = p.get('hash'); p.delete('hash');
  const dcs = [...p.entries()].map(([k, v]) => `${k}=${v}`).sort().join('\n');
  const secret = crypto.createHmac('sha256', 'WebAppData').update(process.env.BOT_TOKEN).digest();
  const calc = crypto.createHmac('sha256', secret).update(dcs).digest('hex');
  if (calc !== hash) return null;
  if (Date.now() / 1000 - Number(p.get('auth_date')) > 3600) return null;
  return JSON.parse(p.get('user'));
}

async function tgSend(chat_id, text) {
  const f = fx(text);
  const url = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`;
  const post = (b) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }).then((r) => r.json());
  const r = await post({ chat_id, text: f.text, ...(f.entities.length ? { entities: f.entities } : {}) });
  if (!r.ok && f.entities.length) await post({ chat_id, text: f.text });
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405 };
  const { initData, fp } = JSON.parse(event.body || '{}');
  const tu = initData && validInitData(initData);
  if (!tu || !fp) return { statusCode: 401, body: JSON.stringify({ ok: false }) };

  const { data: user } = await sb.from('users').select('lang').eq('id', tu.id).maybeSingle();
  if (!user) return { statusCode: 404, body: JSON.stringify({ ok: false }) };
  const l = user.lang || 'en';

  const { error } = await sb.from('users').update({ device_verified: true, device_hash: fp, state: 'w_uid', state_data: null }).eq('id', tu.id);
  if (error) {
    await tgSend(tu.id, L[l].verifyFail);
    return { statusCode: 409, body: JSON.stringify({ ok: false }) };
  }
  await tgSend(tu.id, L[l].verifyOk);
  await tgSend(tu.id, L[l].sendUid);
  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};
