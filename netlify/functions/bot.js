const C = require('./core');
const { sb, tg, send, sendRaw, editRaw, ack, show, t, S, btn, ubtn, mkBtn, norm, dur, fmt, cleanTitle, setState, loadCache, isAdmin, BOT_USERNAME, ADMINS, getGates, gateKb, missingGates } = C;
const { EM, fx, plain, parseBtn, taskIcon } = require('./emoji');
const { T, NAMES, LANGS } = require('./i18n');
const admin = require('./admin');

const nm = (u) => u.first_name || u.username || 'friend';

// ---------- Keyboards ----------
const STY = { bal: 'primary', tasks: 'success', ref: 'success', sup: 'danger', lang: 'primary' }; // primary=blue success=green danger=red
function mk(l, k) {
  const p = parseBtn(t(l, 'btn_' + k));
  return { text: p.text, style: STY[k], ...(p.icon ? { icon_custom_emoji_id: p.icon } : {}) };
}
const menuKb = (l, adm) => ({
  keyboard: [
    [mk(l, 'bal'), mk(l, 'tasks')],
    [mk(l, 'ref'), mk(l, 'sup')],
    [mk(l, 'lang'), ...(adm ? [{ text: 'Admin Panel', style: 'primary', icon_custom_emoji_id: EM.lock[0] }] : [])]
  ],
  resize_keyboard: true
});
const LSTY = { ar: 'primary', ru: 'success', en: 'danger' }; // blue, green, red
const langInline = () => ({ inline_keyboard: LANGS.map((k) => [btn(NAMES[k], `lg:${k}`, LSTY[k])]) });

// button text milay (emoji bad diye). Edit kora naam ar default naam duitai chole.
function actionOf(text) {
  const x = norm(text);
  if (!x) return null;
  for (const k of ['bal', 'tasks', 'ref', 'sup', 'lang'])
    for (const l of LANGS)
      for (const label of [t(l, 'btn_' + k), T['btn_' + k][l]])
        if (norm(parseBtn(label).text) === x) return k;
  return null;
}

// ---------- User ----------
async function getUser(from, ref) {
  let { data: u } = await sb.from('users').select('*').eq('id', from.id).maybeSingle();
  if (u) {
    if (!u.last_active || Date.now() - new Date(u.last_active).getTime() > 300000)
      await sb.from('users').update({ last_active: new Date().toISOString() }).eq('id', from.id);
    return u;
  }
  let rb = ref && ref !== from.id ? ref : null;
  if (rb) {
    const { data: r } = await sb.from('users').select('id').eq('id', rb).maybeSingle();
    if (!r) rb = null;
  }
  const ins = await sb.from('users').insert({ id: from.id, username: from.username || null, first_name: from.first_name || null, referred_by: rb }).select().single();
  if (ins.data) return ins.data;
  return (await sb.from('users').select('*').eq('id', from.id).single()).data;
}

// ---------- Force-join ----------
async function passGate(user) {
  await sb.from('users').update({ gate_ok: true }).eq('id', user.id);
  user.gate_ok = true;
  if (user.referred_by && !user.ref_valid) await sb.rpc('credit_referral', { uid: user.id, reward: Number(S('ref_reward')) || 0 });
}
async function gateBlocked(chat, user, adm) {
  if (adm || user.gate_ok || S('gate_enabled') === 'off') return false;
  const gates = await getGates();
  if (!gates.length) { await passGate(user); return false; }
  const l = user.lang || 'ar';
  await send(chat, t(l, 'gateTitle', { name: nm(user) }), { reply_markup: gateKb(l, gates) });
  return true;
}
async function recheckGate(chat, user, adm) {
  if (adm || S('gate_enabled') === 'off') return false;
  const gates = await getGates();
  if (!gates.length) return false;
  if (!(await missingGates(user.id, gates)).length) return false;
  await sb.from('users').update({ gate_ok: false }).eq('id', user.id);
  user.gate_ok = false;
  return gateBlocked(chat, user, adm);
}
const welcome = (chat, user, adm) => send(chat, t(user.lang, 'welcome', { name: nm(user) }), { reply_markup: menuKb(user.lang, adm) });
async function entry(chat, user, adm) {
  if (!user.lang) return send(chat, t('ar', 'chooseLang'), { reply_markup: langInline() }); // prothome shudhu Arabic
  if (await gateBlocked(chat, user, adm)) return;
  return welcome(chat, user, adm);
}

// ---------- Anti-spam ----------
async function strike(user, chat, l) {
  const now = Date.now();
  const thr = Number(S('spam_threshold') || 3);
  const win = Number(S('spam_window_min') || 10) * 60000;
  const decay = Number(S('spam_decay_hours') || 24) * 3600000;
  const count = user.spam_at && now - new Date(user.spam_at).getTime() < win ? (user.spam_count || 0) + 1 : 1;
  const upd = { spam_count: count, spam_at: new Date(now).toISOString() };
  if (count > thr) {
    const prev = user.offense_at && now - new Date(user.offense_at).getTime() > decay ? 0 : user.offenses || 0;
    const n = prev + 1;
    const ladder = (S('spam_ladder') || '1,3,5,30').split(',').map(Number).filter((x) => x > 0);
    Object.assign(upd, { spam_count: 0, offenses: n, offense_at: new Date(now).toISOString() });
    if (n === 1) await send(chat, t(l, 'spamWarn'));
    else if (n - 2 < ladder.length) {
      const mins = ladder[n - 2];
      upd.mute_until = new Date(now + mins * 60000).toISOString();
      await send(chat, t(l, 'spamMute', { time: dur(mins * 60) }));
    } else { upd.banned = true; await send(chat, t(l, 'spamBan')); }
  }
  await sb.from('users').update(upd).eq('id', user.id);
}

// ---------- Withdraw cooldown ----------
async function cooldownLeft(uid) {
  const hours = Number(S('withdraw_cooldown_hours') ?? 6);
  if (!hours) return 0;
  const { data } = await sb.from('withdrawals').select('created_at').eq('user_id', uid).neq('status', 'rejected').order('created_at', { ascending: false }).limit(1);
  if (!data || !data[0]) return 0;
  const left = new Date(data[0].created_at).getTime() + hours * 3600000 - Date.now();
  return left > 0 ? Math.ceil(left / 1000) : 0;
}

exports.handler = async (event) => {
  if (event.headers['x-telegram-bot-api-secret-token'] !== process.env.WEBHOOK_SECRET) return { statusCode: 401 };
  try {
    await loadCache();
    const u = JSON.parse(event.body);
    if (u.message) await onMessage(u.message);
    else if (u.callback_query) await onCallback(u.callback_query);
  } catch (e) { console.error(e); }
  return { statusCode: 200 };
};

// ====================== MESSAGES ======================
async function onMessage(m) {
  if (m.chat.type !== 'private') return;
  const raw = m.text || '';
  const st = raw.match(/^\/start(?:\s+ref_(\d+))?/);
  const user = await getUser(m.from, st && st[1] ? Number(st[1]) : null);
  const chat = m.chat.id, adm = isAdmin(user.id), l = user.lang || 'ar';

  if (user.banned) return send(chat, t(l, 'banned'));
  if (!adm && user.mute_until && new Date(user.mute_until) > new Date()) return;
  if (!m.text) { if (!adm) await strike(user, chat, l); return; }
  if (!adm && S('maintenance') === 'on') return send(chat, t(l, 'maint'));
  const text = raw.trim();

  // Admin emoji-only message pathale premium emoji ID bole dey
  if (adm && m.entities && !(user.state || '').startsWith('a_') && !/[\p{L}\p{N}]/u.test(text)) {
    const ids = m.entities.filter((e) => e.type === 'custom_emoji').map((e) => e.custom_emoji_id);
    if (ids.length) return sendRaw(chat, ids.join('\n'));
  }

  if (st) { await setState(user.id, null); return entry(chat, user, adm); }
  if (!user.lang) return entry(chat, user, adm);
  if (await gateBlocked(chat, user, adm)) return;

  if (adm) {
    if (text === '/admin' || text === '/cancel' || norm(text) === 'adminpanel') { await setState(user.id, null); return admin.home(chat); }
    if ((user.state || '').startsWith('a_') && !actionOf(text) && !text.startsWith('/')) return admin.input(m, user);
  }

  if (/^\/promo(\s|$)/.test(text)) {
    const code = text.split(/\s+/)[1];
    if (!code) return send(chat, t(l, 'promoUsage'));
    const { data } = await sb.rpc('redeem_promo', { p_code: code, uid: user.id });
    const n = Number(data);
    if (n >= 0) return send(chat, t(l, 'promoOk', { reward: fmt(n) }));
    return send(chat, t(l, n === -3 ? 'promoUsed' : n === -2 ? 'promoEnd' : 'promoBad'));
  }

  const act = actionOf(text);
  if (act) {
    await setState(user.id, null);
    if (act === 'lang') return send(chat, t(l, 'chooseLang'), { reply_markup: langInline() });
    if (act === 'bal') return send(chat, t(l, 'bal', { balance: fmt(user.balance), earned: fmt(user.total_earned), withdrawn: fmt(user.total_withdrawn) }),
      { reply_markup: { inline_keyboard: [[btn(t(l, 'withdraw'), 'wd', 'success')]] } });
    if (act === 'tasks') return showTasks(chat, user, null);
    if (act === 'ref') return showRef(chat, user);
    if (act === 'sup') {
      const link = S('support_link') || 'https://t.me';
      return send(chat, t(l, 'sup'), { reply_markup: { inline_keyboard: [[ubtn(t(l, 'supBtn'), link, 'primary')]] } });
    }
  }

  if (user.state === 'w_uid') {
    if (!/^\d{4,20}$/.test(text)) return send(chat, t(l, 'badUid'));
    await setState(user.id, 'w_amount', { uid: text });
    return send(chat, t(l, 'sendAmount', { min: S('min_withdraw'), max: S('max_withdraw') }));
  }
  if (user.state === 'w_amount') {
    const amt = Number(text.replace(',', '.'));
    const min = Number(S('min_withdraw')), max = Number(S('max_withdraw'));
    if (!isFinite(amt) || amt < min || amt > max || amt > Number(user.balance)) return send(chat, t(l, 'badAmount'));
    const data = { ...user.state_data, amount: amt };
    await setState(user.id, 'w_confirm', data);
    return send(chat, t(l, 'confirm', { uid: data.uid, amount: fmt(amt) }),
      { reply_markup: { inline_keyboard: [[btn(t(l, 'btnConfirm'), 'wc', 'success'), btn(t(l, 'btnCancel'), 'wx', 'danger')]] } });
  }

  if (!adm) await strike(user, chat, l); // bot er baire kichu
}

// ---------- Tasks ----------
async function showTasks(chat, user, mid) {
  const l = user.lang;
  const [{ data: tasks }, { data: rows }] = await Promise.all([
    sb.from('tasks').select('*').eq('active', true).order('id'),
    sb.from('user_tasks').select('task_id,last_done,earned').eq('user_id', user.id)
  ]);
  if (!tasks || !tasks.length) return show(chat, mid, t(l, 'noTasks'), []);
  const gr = Number(S('task_reset_hours') ?? 24), now = Date.now();
  const map = Object.fromEntries((rows || []).map((r) => [r.task_id, r]));
  let doneN = 0, next = null;
  const open = [];
  for (const tk of tasks) {
    const r = map[tk.id], rh = tk.reset_hours ?? gr;
    if (!r) { open.push(tk); continue; }
    const readyAt = rh > 0 ? new Date(r.last_done).getTime() + rh * 3600000 : null;
    if (readyAt !== null && now >= readyAt) open.push(tk);
    else { doneN++; if (readyAt !== null) next = next === null ? readyAt - now : Math.min(next, readyAt - now); }
  }
  const earned = (rows || []).reduce((a, r) => a + Number(r.earned || 0), 0);
  let text = t(l, 'tasksTitle', { total: tasks.length, done: doneN, remaining: open.length, earned: fmt(earned), next: next !== null ? '\n' + t(l, 'tasksNext', { time: dur(next / 1000) }) : '' });
  if (!open.length) text += '\n\n' + t(l, 'tasksNone');
  const kb = open.map((tk) => [
    ubtn(`{{${taskIcon(tk)}}} ${cleanTitle(tk.title)} (+$${tk.reward})`, tk.link, 'primary'),
    btn(t(l, 'check'), `chk:${tk.id}`, 'success')
  ]);
  return show(chat, mid, text, kb);
}

// ---------- Referral ----------
async function showRef(chat, user) {
  const l = user.lang;
  const { data: s } = await sb.rpc('ref_stats', { uid: user.id });
  const r = s || { total: 0, valid: 0, earned: 0 };
  const link = `https://t.me/${BOT_USERNAME}?start=ref_${user.id}`;
  const share = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(plain(t(l, 'refShareText')))}`;
  return send(chat, t(l, 'ref', { reward: fmt(S('ref_reward') || 0), total: r.total, valid: r.valid, pending: r.total - r.valid, refEarned: fmt(r.earned), link }),
    { reply_markup: { inline_keyboard: [[ubtn(t(l, 'refShareBtn'), share, 'success')]] } });
}

// ====================== CALLBACKS ======================
async function onCallback(q) {
  const { data: user } = await sb.from('users').select('*').eq('id', q.from.id).maybeSingle();
  if (!user || user.banned) return ack(q.id);
  const l = user.lang || 'ar', chat = q.message.chat.id, mid = q.message.message_id, d = q.data, adm = isAdmin(user.id);
  const A = (text) => ack(q.id, text);

  if (!adm && user.mute_until && new Date(user.mute_until) > new Date())
    return A(t(l, 'muted', { time: dur((new Date(user.mute_until).getTime() - Date.now()) / 1000) }));

  if (d.startsWith('lg:')) {
    const k = d.slice(3);
    if (!LANGS.includes(k)) return A();
    await A();
    await sb.from('users').update({ lang: k, state: null }).eq('id', user.id);
    user.lang = k; user.state = null;
    await tg('deleteMessage', { chat_id: chat, message_id: mid });
    return entry(chat, user, adm);
  }
  if (d.startsWith('a:')) {
    if (!adm) return A();
    await A();
    return admin.cb(q, user, d.slice(2));
  }
  if (!adm && S('maintenance') === 'on') return A(t(l, 'maint'));
  if (!user.lang) { await A(); return entry(chat, user, adm); }

  if (d === 'gate:chk') {
    const gates = await getGates();
    const miss = await missingGates(user.id, gates);
    if (miss.length) return A(t(l, 'gateMissing', { list: miss.map((g) => g.title).join(', ') }));
    await A();
    await passGate(user);
    await tg('deleteMessage', { chat_id: chat, message_id: mid });
    await send(chat, t(l, 'gateOk'));
    return welcome(chat, user, adm);
  }
  if (await gateBlocked(chat, user, adm)) return A();

  if (d === 'wd') {
    await A();
    if (S('withdraw_enabled') === 'off') return send(chat, t(l, 'wdOff'));
    if (await recheckGate(chat, user, adm)) return;
    const min = Number(S('min_withdraw') || 0);
    if (Number(user.balance) < min || Number(user.balance) <= 0) return send(chat, t(l, 'insufficient', { balance: fmt(user.balance), min: fmt(min) }));
    const left = await cooldownLeft(user.id);
    if (left > 0) return send(chat, t(l, 'cooldown', { time: dur(left), hours: S('withdraw_cooldown_hours') ?? 6 }));
    if (!user.device_verified) {
      return send(chat, t(l, 'verifyNeeded'), { reply_markup: { inline_keyboard: [[mkBtn(t(l, 'verifyBtn'), { web_app: { url: `${process.env.SITE_URL}/verify.html?lang=${l}` } }, 'primary')]] } });
    }
    await setState(user.id, 'w_uid');
    return send(chat, t(l, 'sendUid'));
  }
  if (d === 'wx') { await A(); await setState(user.id, null); return send(chat, t(l, 'cancelled')); }
  if (d === 'wc') {
    await A();
    if (user.state !== 'w_confirm' || !user.state_data) return;
    const { uid, amount } = user.state_data;
    if (!user.device_verified) return send(chat, t(l, 'verifyFail'));
    const left = await cooldownLeft(user.id);
    if (left > 0) { await setState(user.id, null); return send(chat, t(l, 'cooldown', { time: dur(left), hours: S('withdraw_cooldown_hours') ?? 6 })); }
    const { data: wid, error } = await sb.rpc('request_withdrawal', { uid: user.id, acc: String(uid), amt: amount });
    await setState(user.id, null);
    if (error) return send(chat, t(l, 'insufficient', { balance: fmt(user.balance), min: fmt(S('min_withdraw') || 0) }));
    await send(chat, t(l, 'submitted'));
    for (const a of ADMINS) {
      await send(a, `{{bell}} Withdrawal #${wid}\n{{profile}} User: ${user.id} @${user.username || '-'}\nMethod: {{binance}} Binance UID\nUID: ${uid}\n{{money}} Amount: $${fmt(amount)} USDT${user.dup_flag ? `\n{{warn}} Flags: ${user.dup_flag}` : ''}`,
        { reply_markup: { inline_keyboard: admin.approveRow(wid) } });
    }
    return;
  }

  if (d.startsWith('chk:')) {
    const id = Number(d.split(':')[1]);
    const { data: tk } = await sb.from('tasks').select('*').eq('id', id).eq('active', true).maybeSingle();
    if (!tk) return A();
    if (tk.type === 'channel' && tk.chat_id) {
      const r = await tg('getChatMember', { chat_id: tk.chat_id, user_id: user.id });
      const s = r.ok ? r.result.status : '';
      if (!['member', 'administrator', 'creator'].includes(s) && !(s === 'restricted' && r.result.is_member)) return A(t(l, 'notJoined'));
    }
    const rh = tk.reset_hours ?? Number(S('task_reset_hours') ?? 24);
    const { data: res, error } = await sb.rpc('complete_task', { uid: user.id, tid: id, rew: tk.reward, reset_h: rh });
    if (error) { console.error(error); return A(t(l, 'notJoined')); }
    const r = Number(res);
    if (r === -1) return A(t(l, 'already'));
    if (r > 0) return A(t(l, 'wait', { time: dur(r) }));
    await A(t(l, 'done', { reward: fmt(tk.reward) }));
    return showTasks(chat, user, mid);
  }

  if ((d.startsWith('ok:') || d.startsWith('no:')) && adm) {
    const wid = Number(d.split(':')[1]), approve = d.startsWith('ok:');
    const { data } = await sb.rpc('resolve_withdrawal', { wid, approve });
    await A();
    if (!data || !data.length) return send(chat, `#${wid} already processed.`);
    const w = data[0];
    const { data: wu } = await sb.from('users').select('lang').eq('id', w.user_id).single();
    const wl = (wu && wu.lang) || 'en';
    await send(w.user_id, t(wl, approve ? 'approved' : 'rejected', { amount: fmt(w.amount) }));
    // purano message er premium emoji rekhe shudhu status line jog kore
    const base = q.message.text || '';
    const f = fx(`\n\n${approve ? '{{verified}} APPROVED' : '{{cancel}} REJECTED'}`);
    const ents = [...(q.message.entities || []), ...f.entities.map((e) => ({ ...e, offset: e.offset + base.length }))];
    return editRaw(chat, mid, base + f.text, ents);
  }
  return A();
}
