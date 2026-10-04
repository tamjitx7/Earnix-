const crypto = require('node:crypto');
const C = require('./core');
const { sb, loadCache, S, t, send } = C;

function validInitData(initData) {
  const p = new URLSearchParams(initData);
  const hash = p.get('hash'); p.delete('hash');
  const dcs = [...p.entries()].map(([k, v]) => `${k}=${v}`).sort().join('\n');
  const secret = crypto.createHmac('sha256', 'WebAppData').update(process.env.BOT_TOKEN).digest();
  const calc = crypto.createHmac('sha256', secret).update(dcs).digest('hex');
  if (calc !== hash) return null;
  if (Date.now() / 1000 - Number(p.get('auth_date')) > 600) return null;
  return JSON.parse(p.get('user'));
}

exports.handler = async (event) => {
  const res = (code, ok, msg) => ({ statusCode: code, body: JSON.stringify({ ok, msg }) });
  if (event.httpMethod !== 'POST') return res(405, false);
  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return res(400, false); }
  const tu = body.initData && validInitData(body.initData);
  if (!tu || !body.fp || !body.token) return res(401, false);

  await loadCache();
  const { data: user } = await sb.from('users').select('lang').eq('id', tu.id).maybeSingle();
  if (!user) return res(404, false);
  const l = user.lang || 'en';

  const mode = S('device_mode') || 'token';
  const token = String(body.token).slice(0, 64), fp = String(body.fp).slice(0, 64);
  const rawIp = (event.headers['x-nf-client-connection-ip'] || String(event.headers['x-forwarded-for'] || '').split(',')[0] || '').trim();
  const ip = rawIp ? crypto.createHash('sha256').update(rawIp + process.env.BOT_TOKEN).digest('hex').slice(0, 24) : null;
  const flags = [];

  if (mode !== 'off') {
    const { data: byToken } = await sb.from('users').select('id').eq('device_token', token).neq('id', tu.id).limit(1);
    if (byToken && byToken.length) { await send(tu.id, t(l, 'verifyFail')); return res(409, false, 'device'); }
    const { data: byFp } = await sb.from('users').select('id').eq('device_hash', fp).neq('id', tu.id).limit(1);
    if (byFp && byFp.length) {
      if (mode === 'strict') { await send(tu.id, t(l, 'verifyFail')); return res(409, false, 'device'); }
      flags.push('fp');
    }
    if (ip) {
      const { data: byIp } = await sb.from('users').select('id').eq('device_ip', ip).neq('id', tu.id).limit(1);
      if (byIp && byIp.length) flags.push('ip');
    }
  }

  const info = body.info && JSON.stringify(body.info).length < 2000 ? body.info : null;
  const { error } = await sb.from('users').update({
    device_verified: true, device_hash: fp, device_token: token, device_ip: ip, device_info: info,
    dup_flag: flags.length ? flags.join(',') : null, state: 'w_uid', state_data: null
  }).eq('id', tu.id);
  if (error) { console.error(error); return res(500, false); }

  await send(tu.id, t(l, 'verifyOk'));
  await send(tu.id, t(l, 'sendUid'));
  return res(200, true);
};
