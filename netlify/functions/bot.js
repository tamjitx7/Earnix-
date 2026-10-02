const { createClient } = require('@supabase/supabase-js');
const { L, LANGS } = require('./i18n');
const { EM, fx, plain, parseBtn, taskIcon } = require('./emoji');

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const API = `https://api.telegram.org/bot${process.env.BOT_TOKEN}`;
const ADMINS = (process.env.ADMIN_IDS || '').split(',').map((s) => s.trim()).filter(Boolean);
const BOT_USERNAME = process.env.BOT_USERNAME || 'earnix_ubot';
const isAdmin = (id) => ADMINS.includes(String(id));

// ---------- Telegram calls (premium emoji reject hole auto normal emoji diye retry) ----------
const tg = (method, p) =>
  fetch(`${API}/${method}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) }).then((r) => r.json());
const strip = (b) => {
  const c = JSON.parse(JSON.stringify(b, (k, v) => (k === 'icon_custom_emoji_id' ? undefined : v)));
  delete c.entities;
  return c;
};
async function call(method, body) {
  const r = await tg(method, body);
  if (r.ok || r.error_code !== 400 || /not modified|not found|can't be edited/i.test(r.description || '')) return r;
  return tg(method, strip(body));
}
function send(chat_id, text, extra = {}) {
  const f = fx(text);
  return call('sendMessage', { chat_id, text: f.text, ...(f.entities.length ? { entities: f.entities } : {}), disable_web_page_preview: true, ...extra });
}
function edit(chat_id, message_id, text, extra = {}) {
  const f = fx(text);
  return call('editMessageText', { chat_id, message_id, text: f.text, ...(f.entities.length ? { entities: f.entities } : {}), disable_web_page_preview: true, ...extra });
}
const fmt = (n) => Number(n).toFixed(4);

async function setting(key) {
  const { data } = await sb.from('settings').select('value').eq('key', key).maybeSingle();
  return data ? data.value : null;
}
const setState = (id, state, data = null) => sb.from('users').update({ state, state_data: data }).eq('id', id);

// ---------- Buttons ----------
// Button text-er shurute {{token}} likhle oita button icon hoy
function mkBtn(text, extra, style) {
  const p = parseBtn(text);
  return { text: p.text, ...extra, ...(style ? { style } : {}), ...(p.icon ? { icon_custom_emoji_id: p.icon } : {}) };
}
const btn = (text, data, style) => mkBtn(text, { callback_data: data }, style);
const ubtn = (text, url, style) => mkBtn(text, { url }, style);
const approveRow = (id) => [[btn('{{verified}} Approve', `ok:${id}`, 'success'), btn('{{cancel}} Reject', `no:${id}`, 'danger')]];

// ---------- Extra user texts ----------
const X = {
  en: { maint: '{{warn}} The bot is under maintenance. Please try again later.', wdOff: '{{stop}} Withdrawals are temporarily disabled.',
    promoUsage: '{{gift}} Send: /promo YOURCODE', promoOk: (r) => `{{gift}} Promo code applied! +$${r}`, promoBad: '{{warn}} Invalid promo code.',
    promoUsed: '{{stop}} You already used this code.', promoEnd: '{{stop}} This promo code has reached its limit.' },
  ar: { maint: '{{warn}} البوت قيد الصيانة. حاول مرة أخرى لاحقاً.', wdOff: '{{stop}} السحب متوقف مؤقتاً.',
    promoUsage: '{{gift}} أرسل: /promo الكود', promoOk: (r) => `{{gift}} تم تطبيق الكود! +$${r}`, promoBad: '{{warn}} كود غير صالح.',
    promoUsed: '{{stop}} لقد استخدمت هذا الكود مسبقاً.', promoEnd: '{{stop}} وصل هذا الكود إلى حده الأقصى.' },
  ru: { maint: '{{warn}} Бот на техническом обслуживании. Попробуйте позже.', wdOff: '{{stop}} Вывод временно отключён.',
    promoUsage: '{{gift}} Отправьте: /promo КОД', promoOk: (r) => `{{gift}} Промокод применён! +$${r}`, promoBad: '{{warn}} Неверный промокод.',
    promoUsed: '{{stop}} Вы уже использовали этот код.', promoEnd: '{{stop}} Лимит этого промокода исчерпан.' }
};

// ---------- Main keyboard ----------
const ICON = { bal: 'wallet', tasks: 'tasks', ref: 'follow', sup: 'support', lang: 'lang' };
// primary = blue, success = green, danger = red
const STYLE = { bal: 'primary', tasks: 'success', ref: 'success', sup: 'danger', lang: 'primary' };
const mk = (l, k) => ({ text: L[l].btn[k], style: STYLE[k], icon_custom_emoji_id: EM[ICON[k]][0] });
const menuKb = (l, adm) => {
  const last = [mk(l, 'lang')];
  if (adm) last.push({ text: 'Admin Panel', style: 'primary', icon_custom_emoji_id: EM.lock[0] });
  return { keyboard: [[mk(l, 'bal'), mk(l, 'tasks')], [mk(l, 'ref'), mk(l, 'sup')], last], resize_keyboard: true };
};

// ---------- Language picker (inline, 3 colors, vertical) ----------
const CHOOSE = '{{lang}} Choose your language / اختر لغتك / Выберите язык';
const LANG_STYLE = ['primary', 'success', 'danger']; // blue, green, red
const langInline = () => ({ inline_keyboard: LANGS.map((k, i) => [btn(L[k].name, `lg:${k}`, LANG_STYLE[i])]) });

// emoji/symbol bad diye shudhu letter-number milay
const norm = (s) => String(s).replace(/[^\p{L}\p{N}]/gu, '').toLowerCase();
function actionOf(text) {
  const t = norm(text);
  if (!t) return null;
  for (const k of LANGS) for (const [a, label] of Object.entries(L[k].btn)) if (norm(label) === t) return a;
  return null;
}
const cleanTitle = (s) => String(s).replace(/^[^\p{L}\p{N}]+/u, '');

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
  const { data } = await sb
    .from('users')
    .insert({ id: from.id, username: from.username || null, first_name: from.first_name || null, referred_by: rb })
    .select().single();
  if (rb) {
    const reward = Number(await setting('ref_reward')) || 0;
    if (reward > 0) await sb.rpc('add_balance', { uid: rb, amt: reward, earned: true });
  }
  return data;
}

exports.handler = async (event) => {
  if (event.headers['x-telegram-bot-api-secret-token'] !== process.env.WEBHOOK_SECRET) return { statusCode: 401 };
  try {
    const u = JSON.parse(event.body);
    if (u.message) await onMessage(u.message);
    else if (u.callback_query) await onCallback(u.callback_query);
  } catch (e) { console.error(e); }
  return { statusCode: 200 };
};

// ====================== USER SIDE ======================
async function onMessage(m) {
  // Admin premium emoji pathale tar custom emoji ID reply dibe
  if (m.entities && isAdmin(m.from.id)) {
    const ids = m.entities.filter((e) => e.type === 'custom_emoji').map((e) => e.custom_emoji_id);
    if (ids.length) return tg('sendMessage', { chat_id: m.chat.id, text: ids.join('\n') });
  }
  if (!m.text || m.chat.type !== 'private') return;
  const text = m.text.trim();
  const refMatch = text.match(/^\/start ref_(\d+)/);
  const user = await getUser(m.from, refMatch ? Number(refMatch[1]) : null);
  const l = user.lang || 'en';
  const adm = isAdmin(user.id);
  if (user.banned) return send(m.chat.id, L[l].banned);
  if (!adm && (await setting('maintenance')) === 'on') return send(m.chat.id, X[l].maint);

  if (text.startsWith('/start') || !user.lang) {
    await setState(user.id, null);
    if (user.lang) return send(m.chat.id, L[l].welcome, { reply_markup: menuKb(l, adm) });
    return send(m.chat.id, CHOOSE, { reply_markup: langInline() });
  }

  if (adm) {
    if (text === '/admin' || text === '/cancel' || norm(text) === 'adminpanel') { await setState(user.id, null); return adminHome(m.chat.id); }
    if (user.state && user.state.startsWith('a_') && !actionOf(text) && !text.startsWith('/')) return adminInput(m, user);
  }

  if (text.startsWith('/promo')) {
    const code = text.split(/\s+/)[1];
    if (!code) return send(m.chat.id, X[l].promoUsage);
    const { data } = await sb.rpc('redeem_promo', { p_code: code, uid: user.id });
    const n = Number(data);
    if (n >= 0) return send(m.chat.id, X[l].promoOk(fmt(n)));
    return send(m.chat.id, n === -3 ? X[l].promoUsed : n === -2 ? X[l].promoEnd : X[l].promoBad);
  }

  const act = actionOf(text);
  if (act) {
    await setState(user.id, null);
    if (act === 'lang') return send(m.chat.id, CHOOSE, { reply_markup: langInline() });
    if (act === 'bal') return send(m.chat.id, L[l].bal(fmt(user.balance), fmt(user.total_earned), fmt(user.total_withdrawn)),
      { reply_markup: { inline_keyboard: [[btn(L[l].withdraw, 'wd', 'success')]] } });
    if (act === 'tasks') return showTasks(m.chat.id, user, l);
    if (act === 'ref') {
      const { count } = await sb.from('users').select('id', { count: 'exact', head: true }).eq('referred_by', user.id);
      return send(m.chat.id, L[l].ref(`https://t.me/${BOT_USERNAME}?start=ref_${user.id}`, count || 0));
    }
    if (act === 'sup') {
      const link = (await setting('support_link')) || 'https://t.me';
      return send(m.chat.id, L[l].sup, { reply_markup: { inline_keyboard: [[ubtn(L[l].supBtn, link, 'primary')]] } });
    }
  }

  if (user.state === 'w_uid') {
    if (!/^\d{4,20}$/.test(text)) return send(m.chat.id, L[l].badUid);
    await setState(user.id, 'w_amount', { uid: text });
    return send(m.chat.id, L[l].sendAmount(await setting('min_withdraw'), await setting('max_withdraw')));
  }
  if (user.state === 'w_amount') {
    const amt = Number(text.replace(',', '.'));
    const min = Number(await setting('min_withdraw')), max = Number(await setting('max_withdraw'));
    if (!isFinite(amt) || amt < min || amt > max || amt > Number(user.balance)) return send(m.chat.id, L[l].badAmount);
    const data = { ...user.state_data, amount: amt };
    await setState(user.id, 'w_confirm', data);
    return send(m.chat.id, L[l].confirm(data.uid, fmt(amt)),
      { reply_markup: { inline_keyboard: [[btn(L[l].btnConfirm, 'wc', 'success'), btn(L[l].btnCancel, 'wx', 'danger')]] } });
  }
}

async function showTasks(chat, user, l) {
  const { data: tasks } = await sb.from('tasks').select('*').eq('active', true).order('id');
  const { data: done } = await sb.from('user_tasks').select('task_id').eq('user_id', user.id);
  const doneIds = new Set((done || []).map((d) => d.task_id));
  const open = (tasks || []).filter((t) => !doneIds.has(t.id));
  if (!open.length) return send(chat, L[l].noTasks);
  const rows = open.map((t) => [
    ubtn(`{{${taskIcon(t)}}} ${cleanTitle(t.title)} (+$${t.reward})`, t.link, 'primary'),
    btn(L[l].check, `chk:${t.id}`, 'success')
  ]);
  return send(chat, L[l].tasksTitle, { reply_markup: { inline_keyboard: rows } });
}

async function onCallback(q) {
  const { data: user } = await sb.from('users').select('*').eq('id', q.from.id).maybeSingle();
  if (!user || user.banned) return tg('answerCallbackQuery', { callback_query_id: q.id });
  const l = user.lang || 'en';
  const chat = q.message.chat.id;
  const d = q.data;
  const ack = (text) => tg('answerCallbackQuery', { callback_query_id: q.id, ...(text ? { text: plain(text), show_alert: true } : {}) });

  if (d.startsWith('lg:')) {
    const k = d.slice(3);
    if (!L[k]) return ack();
    await ack();
    await sb.from('users').update({ lang: k, state: null }).eq('id', user.id);
    await tg('deleteMessage', { chat_id: chat, message_id: q.message.message_id });
    return send(chat, L[k].welcome, { reply_markup: menuKb(k, isAdmin(user.id)) });
  }
  if (d.startsWith('a:')) {
    if (!isAdmin(q.from.id)) return ack();
    await ack();
    return adminCb(q, user, d.slice(2));
  }
  if (!isAdmin(q.from.id) && (await setting('maintenance')) === 'on') return ack(X[l].maint);

  if (d === 'wd') {
    await ack();
    if ((await setting('withdraw_enabled')) === 'off') return send(chat, X[l].wdOff);
    const min = Number(await setting('min_withdraw'));
    if (Number(user.balance) < min || Number(user.balance) <= 0) return send(chat, L[l].insufficient(fmt(user.balance)));
    if (!user.device_verified) {
      return send(chat, L[l].verifyNeeded, { reply_markup: { inline_keyboard: [[mkBtn(L[l].verifyBtn, { web_app: { url: `${process.env.SITE_URL}/verify.html?lang=${l}` } }, 'primary')]] } });
    }
    await setState(user.id, 'w_uid');
    return send(chat, L[l].sendUid);
  }
  if (d === 'wx') { await ack(); await setState(user.id, null); return send(chat, L[l].cancelled); }
  if (d === 'wc') {
    await ack();
    if (user.state !== 'w_confirm' || !user.state_data) return;
    const { uid, amount } = user.state_data;
    if (!user.device_verified) return send(chat, L[l].verifyFail);
    const { data: wid, error } = await sb.rpc('request_withdrawal', { uid: user.id, acc: String(uid), amt: amount });
    await setState(user.id, null);
    if (error) return send(chat, L[l].insufficient(fmt(user.balance)));
    await send(chat, L[l].submitted);
    for (const a of ADMINS) {
      await send(a, `{{bell}} Withdrawal #${wid}\n{{profile}} User: ${user.id} @${user.username || '-'}\nMethod: {{binance}} Binance UID\nUID: ${uid}\n{{money}} Amount: $${fmt(amount)} USDT`,
        { reply_markup: { inline_keyboard: approveRow(wid) } });
    }
    return;
  }
  if (d.startsWith('chk:')) {
    const id = Number(d.split(':')[1]);
    const { data: t } = await sb.from('tasks').select('*').eq('id', id).eq('active', true).maybeSingle();
    if (!t) return ack();
    const { data: ex } = await sb.from('user_tasks').select('task_id').eq('user_id', user.id).eq('task_id', id).maybeSingle();
    if (ex) return ack(L[l].already);
    if (t.type === 'channel' && t.chat_id) {
      const r = await tg('getChatMember', { chat_id: t.chat_id, user_id: user.id });
      if (!r.ok || !['member', 'administrator', 'creator'].includes(r.result.status)) return ack(L[l].notJoined);
    }
    const { error } = await sb.from('user_tasks').insert({ user_id: user.id, task_id: id });
    if (error) return ack(L[l].already);
    await sb.rpc('add_balance', { uid: user.id, amt: t.reward, earned: true });
    await ack(L[l].done(fmt(t.reward)));
    return showTasks(chat, user, l);
  }
  if ((d.startsWith('ok:') || d.startsWith('no:')) && isAdmin(q.from.id)) {
    const wid = Number(d.split(':')[1]); const approve = d.startsWith('ok:');
    const { data } = await sb.rpc('resolve_withdrawal', { wid, approve });
    await ack();
    if (!data || !data.length) return send(chat, `#${wid} already processed.`);
    const w = data[0];
    const { data: wu } = await sb.from('users').select('lang').eq('id', w.user_id).single();
    const wl = (wu && wu.lang) || 'en';
    await send(w.user_id, approve ? L[wl].approved(fmt(w.amount)) : L[wl].rejected(fmt(w.amount)));
    return edit(chat, q.message.message_id, `${q.message.text}\n\n${approve ? '{{verified}} APPROVED' : '{{cancel}} REJECTED'}`);
  }
  return ack();
}

// ====================== ADMIN PANEL ======================
async function show(chat, mid, text, kb) {
  const markup = { inline_keyboard: kb };
  if (mid) {
    const r = await edit(chat, mid, text, { reply_markup: markup });
    if (r.ok || /not modified/i.test(r.description || '')) return r;
  }
  return send(chat, text, { reply_markup: markup });
}
const BACK = [btn('⬅️ Back', 'a:home')];
const askMsg = (c, text) => send(c, text, { reply_markup: { inline_keyboard: [[btn('{{cancel}} Cancel', 'a:x', 'danger')]] } });
const countOf = async (q) => (await q).count || 0;

async function adminHome(chat, mid) {
  const pend = await countOf(sb.from('withdrawals').select('id', { count: 'exact', head: true }).eq('status', 'pending'));
  return show(chat, mid, '{{info}} Admin Panel\n\nChoose a section:', [
    [btn('{{uptrend}} Stats', 'a:st', 'primary'), btn('{{profile}} Users', 'a:u', 'primary')],
    [btn('{{tasks}} Tasks', 'a:t', 'primary'), btn(`{{wallet}} Withdrawals${pend ? ` (${pend})` : ''}`, 'a:w', pend ? 'success' : 'primary')],
    [btn('{{gift}} Promo codes', 'a:p'), btn('{{announce}} Broadcast', 'a:b')],
    [btn('{{lock}} Settings', 'a:s')]
  ]);
}

async function adminStats(c, mid) {
  const { data: s } = await sb.rpc('admin_stats');
  const lg = s.langs || {};
  return show(c, mid,
    `{{uptrend}} Stats\n\n{{profile}} Users: ${s.users} (today +${s.today})\n{{live}} Active 24h: ${s.active24}\n{{stop}} Banned: ${s.banned}\n{{lock}} Verified devices: ${s.verified}\n{{lang}} EN ${lg.en || 0} · AR ${lg.ar || 0} · RU ${lg.ru || 0}\n\n` +
    `{{money}} Users' balances: $${fmt(s.balances)}\n{{uptrend}} Total earned: $${fmt(s.earned)}\n{{wallet}} Total paid: $${fmt(s.paid)}\n{{time}} Pending: ${s.pending} ($${fmt(s.pending_amt)})\n\n{{verified}} Task completions: ${s.tasks_done}\n{{follow}} Referred users: ${s.refs}`,
    [[btn('🔄 Refresh', 'a:st', 'primary')], BACK]);
}

async function adminTasks(c, mid) {
  const { data } = await sb.from('tasks').select('*').order('id');
  const rows = (data || []).map((t) => [btn(`{{${taskIcon(t)}}} ${t.active ? '' : '(off) '}#${t.id} ${cleanTitle(t.title).slice(0, 30)} ($${t.reward})`, `a:t:${t.id}`)]);
  rows.push([btn('➕ Add task', 'a:ta', 'success')], BACK);
  return show(c, mid, `{{tasks}} Tasks (${(data || []).length})\n\nTap a task to edit it.`, rows);
}

async function adminTask(c, mid, id) {
  const { data: t } = await sb.from('tasks').select('*').eq('id', id).maybeSingle();
  if (!t) return show(c, mid, '{{warn}} Task not found', [[btn('⬅️ Back', 'a:t')]]);
  const done = await countOf(sb.from('user_tasks').select('user_id', { count: 'exact', head: true }).eq('task_id', id));
  const rows = [
    [btn(t.active ? '⏸ Turn off' : '▶️ Turn on', `a:tt:${id}`, t.active ? undefined : 'success')],
    [btn('✏️ Title', `a:te:title:${id}`), btn('{{pin}} Link', `a:te:link:${id}`)],
    [btn('{{money}} Reward', `a:te:reward:${id}`)].concat(t.type === 'channel' ? [btn('{{telegram}} Channel', `a:te:chat_id:${id}`)] : []),
    [btn('{{trash}} Delete', `a:td:${id}`, 'danger')],
    [btn('⬅️ Back', 'a:t')]
  ];
  return show(c, mid,
    `{{${taskIcon(t)}}} Task #${id}\n\nType: ${t.type}\nTitle: ${t.title}\nLink: ${t.link}\n${t.type === 'channel' ? `Channel: ${t.chat_id || '-'}\n` : ''}Reward: $${t.reward}\nStatus: ${t.active ? 'active' : 'off'}\nCompleted by: ${done} users`, rows);
}

async function adminUser(c, mid, uid) {
  const { data: u } = await sb.from('users').select('*').eq('id', uid).maybeSingle();
  if (!u) return show(c, mid, '{{warn}} User not found', [[btn('⬅️ Back', 'a:u')]]);
  const refs = await countOf(sb.from('users').select('id', { count: 'exact', head: true }).eq('referred_by', uid));
  const tasks = await countOf(sb.from('user_tasks').select('user_id', { count: 'exact', head: true }).eq('user_id', uid));
  return show(c, mid,
    `{{profile}} ${u.first_name || '-'} ${u.username ? '@' + u.username : ''}\nID: ${u.id}\nLang: ${u.lang || '-'}\n\n{{money}} Balance: $${fmt(u.balance)}\n{{uptrend}} Earned: $${fmt(u.total_earned)}\n{{wallet}} Withdrawn: $${fmt(u.total_withdrawn)}\n{{follow}} Referrals: ${refs}${u.referred_by ? ` (invited by ${u.referred_by})` : ''}\n{{verified}} Tasks done: ${tasks}\n{{lock}} Device: ${u.device_verified ? 'verified' : 'not verified'}\n{{stop}} Banned: ${u.banned ? 'yes' : 'no'}\n{{time}} Joined: ${String(u.created_at).slice(0, 10)}`,
    [
      [btn('{{money}} Add balance', `a:ub:${uid}:+`, 'success'), btn('➖ Remove', `a:ub:${uid}:-`, 'danger')],
      [btn(u.banned ? '{{verified}} Unban' : '{{stop}} Ban', `a:ubn:${uid}`, u.banned ? 'success' : 'danger'), btn('🔄 Reset device', `a:ur:${uid}`)],
      [btn('{{letter}} Message user', `a:um:${uid}`)],
      [btn('⬅️ Back', 'a:u')]
    ]);
}

async function adminPromos(c, mid) {
  const { data } = await sb.from('promo_codes').select('*').order('created_at', { ascending: false }).limit(20);
  const rows = (data || []).map((p) => [
    btn(`{{gift}} ${p.active ? '' : '(off) '}${p.code} · $${p.reward} · ${p.used}/${p.max_uses || '∞'}`, `a:pt:${p.code}`),
    btn('{{trash}}', `a:pd:${p.code}`, 'danger')
  ]);
  rows.push([btn('➕ Create code', 'a:pc', 'success')], BACK);
  return show(c, mid, '{{gift}} Promo codes\n\nUsers redeem with: /promo CODE\nTap a code to turn it on/off, the bin button deletes it.', rows);
}

const SET_LABELS = { min_withdraw: 'Min withdraw', max_withdraw: 'Max withdraw', ref_reward: 'Referral reward', support_link: 'Support link' };
async function adminSettings(c, mid) {
  const { data } = await sb.from('settings').select('*');
  const s = Object.fromEntries((data || []).map((r) => [r.key, r.value]));
  const maint = s.maintenance === 'on', wdOn = s.withdraw_enabled !== 'off';
  return show(c, mid,
    `{{lock}} Settings\n\nMin withdraw: $${s.min_withdraw}\nMax withdraw: $${s.max_withdraw}\nReferral reward: $${s.ref_reward}\nSupport link: ${s.support_link}\n\nMaintenance: ${maint ? 'ON {{warn}}' : 'off'}\nWithdrawals: ${wdOn ? 'enabled' : 'DISABLED {{warn}}'}`,
    [
      [btn('{{money}} Min withdraw', 'a:se:min_withdraw'), btn('{{money}} Max withdraw', 'a:se:max_withdraw')],
      [btn('{{follow}} Referral reward', 'a:se:ref_reward'), btn('{{support}} Support link', 'a:se:support_link')],
      [btn(maint ? '{{warn}} Maintenance: ON (tap to turn off)' : '{{warn}} Turn on maintenance', 'a:tg:maintenance', maint ? 'danger' : undefined)],
      [btn(wdOn ? '{{stop}} Disable withdrawals' : '{{verified}} Enable withdrawals', 'a:tg:withdraw_enabled', wdOn ? undefined : 'success')],
      BACK
    ]);
}

async function runBroadcast(c, mid, user, d) {
  const t0 = Date.now();
  while (Date.now() - t0 < 7000) {
    let q = sb.from('users').select('id').eq('banned', false).gt('id', d.after).order('id').limit(25);
    if (d.lang !== 'all') q = q.eq('lang', d.lang);
    const { data } = await q;
    if (!data || !data.length) {
      await setState(user.id, null);
      return show(c, mid, `{{done}} Broadcast finished\n\nDelivered: ${d.sent}\nFailed: ${d.failed}`, [BACK]);
    }
    const res = await Promise.all(data.map((u) => send(u.id, d.text)));
    res.forEach((r) => (r.ok ? d.sent++ : d.failed++));
    d.after = data[data.length - 1].id;
  }
  await setState(user.id, 'a_b_run', d);
  return show(c, mid, `{{announce}} Sending... ${d.sent + d.failed}/${d.total}\n\nTap Continue to send the next batch.`,
    [[btn('▶️ Continue', 'a:bc', 'success')], [btn('{{stop}} Stop', 'a:x', 'danger')]]);
}

async function adminCb(q, user, path) {
  const c = q.message.chat.id, mid = q.message.message_id;
  const [sec, a1, a2] = path.split(':');
  const ask = async (state, data, text) => { await setState(user.id, state, data); return askMsg(c, text); };

  switch (sec) {
    case 'home': case 'x': await setState(user.id, null); return adminHome(c, mid);
    case 'st': return adminStats(c, mid);

    // ----- Tasks -----
    case 't': return a1 ? adminTask(c, mid, Number(a1)) : adminTasks(c, mid);
    case 'ta': return show(c, mid, '{{tasks}} New task\n\nChoose the type:', [
      [btn('{{telegram}} Join channel (auto-verified)', 'a:tat:channel')], [btn('{{pin}} Link / X / post', 'a:tat:post')], [btn('{{rocket}} Start bot', 'a:tat:bot')], [btn('⬅️ Back', 'a:t')]]);
    case 'tat': return ask('a_t_title', { type: a1 }, '✏️ Send the task title (e.g. Follow our X)\n\nAn emoji is added automatically from the title.');
    case 'tt': {
      const { data: t } = await sb.from('tasks').select('active').eq('id', Number(a1)).single();
      await sb.from('tasks').update({ active: !t.active }).eq('id', Number(a1));
      return adminTask(c, mid, Number(a1));
    }
    case 'te':
      if (!['title', 'link', 'reward', 'chat_id'].includes(a1)) return;
      return ask('a_te', { field: a1, id: Number(a2) }, `✏️ Send the new ${a1.replace('_', ' ')}`);
    case 'td': return show(c, mid, `{{trash}} Delete task #${a1}?`, [[btn('{{verified}} Yes, delete', `a:tdy:${a1}`, 'danger'), btn('{{cancel}} Cancel', `a:t:${a1}`)]]);
    case 'tdy': await sb.from('tasks').delete().eq('id', Number(a1)); return adminTasks(c, mid);

    // ----- Users -----
    case 'u': return show(c, mid, '{{profile}} Users', [[btn('{{profile}} Find user', 'a:uf', 'primary')], [btn('{{follow}} Top referrers', 'a:ut'), btn('{{uptrend}} Top earners', 'a:ue')], BACK]);
    case 'uf': return ask('a_u_find', {}, '🔎 Send the user ID or @username');
    case 'ut': {
      const { data } = await sb.rpc('top_referrers', { n: 10 });
      const txt = (data || []).map((r, i) => `${i + 1}. ${r.username ? '@' + r.username : r.uid} — ${r.refs} referrals`).join('\n') || 'No referrals yet.';
      return show(c, mid, `{{follow}} Top referrers\n\n${txt}`, [[btn('⬅️ Back', 'a:u')]]);
    }
    case 'ue': {
      const { data } = await sb.from('users').select('id,username,total_earned').order('total_earned', { ascending: false }).limit(10);
      const txt = (data || []).map((r, i) => `${i + 1}. ${r.username ? '@' + r.username : r.id} — $${fmt(r.total_earned)}`).join('\n') || 'No users yet.';
      return show(c, mid, `{{uptrend}} Top earners\n\n${txt}`, [[btn('⬅️ Back', 'a:u')]]);
    }
    case 'uc': return adminUser(c, mid, Number(a1));
    case 'ub': return ask('a_u_bal', { uid: Number(a1), sign: a2 }, `{{money}} ${a2 === '+' ? 'Add' : 'Remove'} balance: send the amount in USDT`);
    case 'ubn': {
      const { data: u } = await sb.from('users').select('banned').eq('id', Number(a1)).single();
      await sb.from('users').update({ banned: !u.banned }).eq('id', Number(a1));
      return adminUser(c, mid, Number(a1));
    }
    case 'ur': await sb.from('users').update({ device_verified: false, device_hash: null }).eq('id', Number(a1)); return adminUser(c, mid, Number(a1));
    case 'um': return ask('a_u_msg', { uid: Number(a1) }, '{{letter}} Send the message for this user');

    // ----- Withdrawals -----
    case 'w': {
      const p = await countOf(sb.from('withdrawals').select('id', { count: 'exact', head: true }).eq('status', 'pending'));
      return show(c, mid, `{{wallet}} Withdrawals\n\nPending: ${p}`, [[btn(`{{time}} Pending (${p})`, 'a:wp', 'success')], [btn('{{pin}} History', 'a:wh')], BACK]);
    }
    case 'wp': {
      const { data } = await sb.from('withdrawals').select('*').eq('status', 'pending').order('id').limit(10);
      if (!data || !data.length) return send(c, '{{done}} No pending withdrawals.');
      for (const w of data) await send(c, `{{bell}} #${w.id} · User ${w.user_id}\n{{binance}} UID: ${w.account}\n{{money}} Amount: $${fmt(w.amount)}`, { reply_markup: { inline_keyboard: approveRow(w.id) } });
      return;
    }
    case 'wh': {
      const { data } = await sb.from('withdrawals').select('*').order('id', { ascending: false }).limit(15);
      const ic = { pending: '{{time}}', approved: '{{done}}', rejected: '{{cancel}}' };
      const txt = (data || []).map((w) => `${ic[w.status]} #${w.id} · ${w.user_id} · $${fmt(w.amount)}`).join('\n') || 'Nothing yet.';
      return show(c, mid, `{{pin}} Last withdrawals\n\n${txt}`, [[btn('⬅️ Back', 'a:w')]]);
    }

    // ----- Promo -----
    case 'p': return adminPromos(c, mid);
    case 'pc': return ask('a_p', {}, '{{gift}} Send: CODE REWARD MAXUSES\nExample: WELCOME 0.5 100\n(MAXUSES 0 = unlimited)');
    case 'pt': {
      const { data: p } = await sb.from('promo_codes').select('active').eq('code', a1).single();
      await sb.from('promo_codes').update({ active: !p.active }).eq('code', a1);
      return adminPromos(c, mid);
    }
    case 'pd': await sb.from('promo_codes').delete().eq('code', a1); return adminPromos(c, mid);

    // ----- Broadcast -----
    case 'b': return ask('a_b_text', {}, '{{announce}} Send the broadcast message text\n\nTip: {{fire}} likhle premium emoji hoye jabe. Token list: money wallet uptrend profile gift fire rocket p100 soon lock time bell pin announce telegram live chat verified done warn stop info');
    case 'bt': case 'bc': {
      let d = user.state_data || {};
      if (sec === 'bt') {
        if (user.state !== 'a_b_pick') return;
        let cq = sb.from('users').select('id', { count: 'exact', head: true }).eq('banned', false);
        if (a1 !== 'all') cq = cq.eq('lang', a1);
        d = { text: d.text, lang: a1, after: 0, sent: 0, failed: 0, total: await countOf(cq) };
      } else if (user.state !== 'a_b_run') return;
      return runBroadcast(c, mid, user, d);
    }

    // ----- Settings -----
    case 's': return adminSettings(c, mid);
    case 'se':
      if (!SET_LABELS[a1]) return;
      return ask('a_s', { key: a1 }, `✏️ Send the new value for ${SET_LABELS[a1]}`);
    case 'tg': {
      if (!['maintenance', 'withdraw_enabled'].includes(a1)) return;
      const cur = await setting(a1);
      const next = a1 === 'maintenance' ? (cur === 'on' ? 'off' : 'on') : (cur === 'off' ? 'on' : 'off');
      await sb.from('settings').upsert({ key: a1, value: next });
      return adminSettings(c, mid);
    }
  }
}

async function adminInput(m, user) {
  const c = m.chat.id, text = m.text.trim(), d = user.state_data || {};
  const done = () => setState(user.id, null);
  const num = (s) => Number(String(s).replace(',', '.'));

  switch (user.state) {
    case 'a_t_title':
      await setState(user.id, 'a_t_link', { ...d, title: text });
      return askMsg(c, '{{pin}} Send the task link (https://...)');
    case 'a_t_link':
      if (!/^https?:\/\//i.test(text)) return send(c, '{{warn}} Link must start with https://');
      if (d.type === 'channel') {
        await setState(user.id, 'a_t_chat', { ...d, link: text });
        return askMsg(c, '{{telegram}} Send the channel username, e.g. @mychannel\n(The bot must be an admin there.)');
      }
      await setState(user.id, 'a_t_reward', { ...d, link: text });
      return askMsg(c, '{{money}} Send the reward in USDT, e.g. 0.05');
    case 'a_t_chat':
      await setState(user.id, 'a_t_reward', { ...d, chat_id: text });
      return askMsg(c, '{{money}} Send the reward in USDT, e.g. 0.05');
    case 'a_t_reward': {
      const r = num(text);
      if (!isFinite(r) || r < 0) return send(c, '{{warn}} Send a valid number.');
      const { data: t, error } = await sb.from('tasks').insert({ type: d.type, title: d.title, link: d.link, chat_id: d.chat_id || null, reward: r }).select().single();
      await done();
      if (error) return send(c, `{{warn}} ${error.message}`);
      return adminTask(c, null, t.id);
    }
    case 'a_te': {
      let v = text;
      if (d.field === 'reward') { v = num(text); if (!isFinite(v) || v < 0) return send(c, '{{warn}} Send a valid number.'); }
      await sb.from('tasks').update({ [d.field]: v }).eq('id', d.id);
      await done();
      return adminTask(c, null, d.id);
    }
    case 'a_u_find': {
      const key = text.replace('@', '');
      const qb = sb.from('users').select('id').limit(1);
      const { data } = await (/^\d+$/.test(key) ? qb.eq('id', Number(key)) : qb.ilike('username', key));
      if (!data || !data[0]) return send(c, '{{warn}} User not found. Try again or tap Cancel.');
      await done();
      return adminUser(c, null, data[0].id);
    }
    case 'a_u_bal': {
      const a = num(text);
      if (!isFinite(a) || a <= 0) return send(c, '{{warn}} Send a positive number.');
      const { data: u } = await sb.from('users').select('balance').eq('id', d.uid).single();
      if (d.sign === '-' && a > Number(u.balance)) return send(c, "{{warn}} That's more than the user's balance.");
      await sb.rpc('add_balance', { uid: d.uid, amt: d.sign === '-' ? -a : a, earned: false });
      await done();
      return adminUser(c, null, d.uid);
    }
    case 'a_u_msg': {
      const r = await send(d.uid, text);
      await done();
      await send(c, r.ok ? '{{done}} Sent.' : '{{warn}} Could not deliver (user may have blocked the bot).');
      return adminUser(c, null, d.uid);
    }
    case 'a_s': {
      let v = text;
      if (['min_withdraw', 'max_withdraw', 'ref_reward'].includes(d.key)) {
        const n = num(text);
        if (!isFinite(n) || n < 0) return send(c, '{{warn}} Send a valid number.');
        v = String(n);
      }
      await sb.from('settings').upsert({ key: d.key, value: v });
      await done();
      return adminSettings(c, null);
    }
    case 'a_p': {
      const [code, reward, max] = text.split(/\s+/);
      const cd = (code || '').toUpperCase(), r = num(reward), mx = Number(max || 0);
      if (!/^[A-Z0-9_-]{3,20}$/.test(cd) || !isFinite(r) || r <= 0 || !Number.isInteger(mx) || mx < 0)
        return send(c, '{{warn}} Format: CODE REWARD MAXUSES\nExample: WELCOME 0.5 100');
      const { error } = await sb.from('promo_codes').insert({ code: cd, reward: r, max_uses: mx });
      await done();
      if (error) return send(c, '{{warn}} That code already exists.');
      return adminPromos(c, null);
    }
    case 'a_b_text':
      await setState(user.id, 'a_b_pick', { text });
      return send(c, `{{announce}} Preview:\n\n${text}\n\nWho should get it?`, { reply_markup: { inline_keyboard: [
        [btn('🌍 Everyone', 'a:bt:all', 'success')],
        [btn('🇬🇧 EN', 'a:bt:en'), btn('🇸🇦 AR', 'a:bt:ar'), btn('🇷🇺 RU', 'a:bt:ru')],
        [btn('{{cancel}} Cancel', 'a:x', 'danger')]] } });
  }
}
