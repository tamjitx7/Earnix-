const { createClient } = require('@supabase/supabase-js');
const { L, LANGS } = require('./i18n');

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const API = `https://api.telegram.org/bot${process.env.BOT_TOKEN}`;
const ADMINS = (process.env.ADMIN_IDS || '').split(',').map((s) => s.trim()).filter(Boolean);
const BOT_USERNAME = process.env.BOT_USERNAME || 'earnix_ubot';
const isAdmin = (id) => ADMINS.includes(String(id));

const tg = (method, p) =>
  fetch(`${API}/${method}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) }).then((r) => r.json());
const send = (chat_id, text, extra = {}) => tg('sendMessage', { chat_id, text, disable_web_page_preview: true, ...extra });
const fmt = (n) => Number(n).toFixed(4);

async function setting(key) {
  const { data } = await sb.from('settings').select('value').eq('key', key).maybeSingle();
  return data ? data.value : null;
}
const setState = (id, state, data = null) => sb.from('users').update({ state, state_data: data }).eq('id', id);

const menuKb = (l) => ({
  keyboard: [
    [{ text: L[l].btn.bal }, { text: L[l].btn.tasks }],
    [{ text: L[l].btn.ref }, { text: L[l].btn.sup }],
    [{ text: L[l].btn.lang }]
  ],
  resize_keyboard: true
});
const langKb = { keyboard: LANGS.map((k) => [{ text: L[k].name }]), resize_keyboard: true, one_time_keyboard: true };

function actionOf(text) {
  for (const k of LANGS) for (const [a, label] of Object.entries(L[k].btn)) if (label === text) return a;
  return null;
}
const langOf = (text) => LANGS.find((k) => L[k].name === text);

async function getUser(from, ref) {
  let { data: u } = await sb.from('users').select('*').eq('id', from.id).maybeSingle();
  if (u) return u;
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

async function onMessage(m) {
  if (!m.text || m.chat.type !== 'private') return;
  const text = m.text.trim();
  const refMatch = text.match(/^\/start ref_(\d+)/);
  const user = await getUser(m.from, refMatch ? Number(refMatch[1]) : null);
  const l = user.lang || 'en';
  if (user.banned) return send(m.chat.id, L[l].banned);

  if (text.startsWith('/start') || !user.lang) {
    if (!user.lang && langOf(text)) { /* language set niche hobe */ }
    else { await setState(user.id, null); return user.lang ? send(m.chat.id, L[l].welcome, { reply_markup: menuKb(l) }) : send(m.chat.id, L.en.chooseLang, { reply_markup: langKb }); }
  }
  const picked = langOf(text);
  if (picked) {
    await sb.from('users').update({ lang: picked, state: null }).eq('id', user.id);
    return send(m.chat.id, L[picked].welcome, { reply_markup: menuKb(picked) });
  }
  if (text.startsWith('/') && isAdmin(user.id)) return adminCmd(m, text);

  const act = actionOf(text);
  if (act) {
    await setState(user.id, null);
    if (act === 'lang') return send(m.chat.id, L[l].chooseLang, { reply_markup: langKb });
    if (act === 'bal') return send(m.chat.id, L[l].bal(fmt(user.balance), fmt(user.total_earned), fmt(user.total_withdrawn)),
      { reply_markup: { inline_keyboard: [[{ text: L[l].withdraw, callback_data: 'wd' }]] } });
    if (act === 'tasks') return showTasks(m.chat.id, user, l);
    if (act === 'ref') {
      const { count } = await sb.from('users').select('id', { count: 'exact', head: true }).eq('referred_by', user.id);
      return send(m.chat.id, L[l].ref(`https://t.me/${BOT_USERNAME}?start=ref_${user.id}`, count || 0));
    }
    if (act === 'sup') {
      const link = (await setting('support_link')) || 'https://t.me';
      return send(m.chat.id, L[l].sup, { reply_markup: { inline_keyboard: [[{ text: L[l].supBtn, url: link }]] } });
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
      { reply_markup: { inline_keyboard: [[{ text: L[l].btnConfirm, callback_data: 'wc' }, { text: L[l].btnCancel, callback_data: 'wx' }]] } });
  }
}

async function showTasks(chat, user, l) {
  const { data: tasks } = await sb.from('tasks').select('*').eq('active', true).order('id');
  const { data: done } = await sb.from('user_tasks').select('task_id').eq('user_id', user.id);
  const doneIds = new Set((done || []).map((d) => d.task_id));
  const open = (tasks || []).filter((t) => !doneIds.has(t.id));
  if (!open.length) return send(chat, L[l].noTasks);
  const rows = open.map((t) => [
    { text: `${t.title} (+$${t.reward})`, url: t.link },
    { text: L[l].check, callback_data: `chk:${t.id}` }
  ]);
  return send(chat, L[l].tasksTitle, { reply_markup: { inline_keyboard: rows } });
}

async function onCallback(q) {
  const { data: user } = await sb.from('users').select('*').eq('id', q.from.id).maybeSingle();
  if (!user || user.banned) return tg('answerCallbackQuery', { callback_query_id: q.id });
  const l = user.lang || 'en';
  const chat = q.message.chat.id;
  const d = q.data;
  const ack = (text) => tg('answerCallbackQuery', { callback_query_id: q.id, text, show_alert: !!text });

  if (d === 'wd') {
    await ack();
    const min = Number(await setting('min_withdraw'));
    if (Number(user.balance) < min || Number(user.balance) <= 0) return send(chat, L[l].insufficient(fmt(user.balance)));
    if (!user.device_verified) {
      return send(chat, L[l].verifyNeeded, { reply_markup: { inline_keyboard: [[{ text: L[l].verifyBtn, web_app: { url: `${process.env.SITE_URL}/verify.html?lang=${l}` } }]] } });
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
      await send(a, `💸 Withdrawal #${wid}\nUser: ${user.id} @${user.username || '-'}\nMethod: Binance UID\nUID: ${uid}\nAmount: $${fmt(amount)} USDT`,
        { reply_markup: { inline_keyboard: [[{ text: '✅ Approve', callback_data: `ok:${wid}` }, { text: '❌ Reject', callback_data: `no:${wid}` }]] } });
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
    return tg('editMessageText', { chat_id: chat, message_id: q.message.message_id, text: `${q.message.text}\n\n${approve ? '✅ APPROVED' : '❌ REJECTED'}` });
  }
  return ack();
}

async function adminCmd(m, text) {
  const [cmd, ...rest] = text.split(' ');
  const arg = rest.join(' ');
  const c = m.chat.id;
  if (cmd === '/admin') {
    const { count: users } = await sb.from('users').select('id', { count: 'exact', head: true });
    const { count: pend } = await sb.from('withdrawals').select('id', { count: 'exact', head: true }).eq('status', 'pending');
    const { data: tasks } = await sb.from('tasks').select('id,title,type,reward,active').order('id');
    return send(c, `🛠 Admin\nUsers: ${users}\nPending withdrawals: ${pend}\n\nTasks:\n${(tasks || []).map((t) => `#${t.id} [${t.type}] ${t.title} $${t.reward} ${t.active ? '' : '(off)'}`).join('\n') || '-'}\n\n` +
`/addtask type|title|link|chat_id|reward\n/deltask id\n/addbal uid amount\n/user uid\n/ban uid\n/unban uid\n/set key value\n   (min_withdraw, max_withdraw, ref_reward, support_link)\n/pending\n/broadcast text`);
  }
  if (cmd === '/addtask') {
    const [type, title, link, chat_id, reward] = arg.split('|').map((s) => s.trim());
    const { error } = await sb.from('tasks').insert({ type, title, link, chat_id: chat_id || null, reward: Number(reward) });
    return send(c, error ? `Error: ${error.message}` : '✅ Task added');
  }
  if (cmd === '/deltask') { await sb.from('tasks').delete().eq('id', Number(arg)); return send(c, '✅ Deleted'); }
  if (cmd === '/addbal') { const [uid, amt] = arg.split(' '); await sb.rpc('add_balance', { uid: Number(uid), amt: Number(amt), earned: false }); return send(c, '✅ Done'); }
  if (cmd === '/ban' || cmd === '/unban') { await sb.from('users').update({ banned: cmd === '/ban' }).eq('id', Number(arg)); return send(c, '✅ Done'); }
  if (cmd === '/user') { const { data } = await sb.from('users').select('*').eq('id', Number(arg)).maybeSingle(); return send(c, data ? JSON.stringify(data, null, 1) : 'Not found'); }
  if (cmd === '/set') { const [k, ...v] = arg.split(' '); await sb.from('settings').upsert({ key: k, value: v.join(' ') }); return send(c, '✅ Saved'); }
  if (cmd === '/pending') {
    const { data } = await sb.from('withdrawals').select('*').eq('status', 'pending').order('id').limit(20);
    if (!data || !data.length) return send(c, 'No pending withdrawals');
    for (const w of data) await send(c, `💸 #${w.id} User ${w.user_id}\nUID: ${w.account}\nAmount: $${fmt(w.amount)}`,
      { reply_markup: { inline_keyboard: [[{ text: '✅ Approve', callback_data: `ok:${w.id}` }, { text: '❌ Reject', callback_data: `no:${w.id}` }]] } });
    return;
  }
  if (cmd === '/broadcast') {
    const { data } = await sb.from('users').select('id').eq('banned', false);
    for (const u of data || []) { await send(u.id, arg); await new Promise((r) => setTimeout(r, 40)); }
    return send(c, `✅ Sent to ${(data || []).length}`);
  }
}
