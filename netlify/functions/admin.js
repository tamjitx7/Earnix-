const C = require('./core');
const { sb, API, tg, send, sendRaw, show, btn, t, S, setSetting, setText, delText, hasText, rawText, fmt, dur, cleanTitle, setState, countOf, getGates, gateKb } = C;
const { T, NAMES, LANGS } = require('./i18n');
const { taskIcon, slotIcon } = require('./emoji');
const { PAGES } = require('./help');

const BACK = [btn('⬅️ Back', 'a:home')];
const askMsg = (c, text) => send(c, text, { reply_markup: { inline_keyboard: [[btn('{{cancel}} Cancel', 'a:x', 'danger')]] } });
const num = (s) => Number(String(s).replace(',', '.'));

// Admin premium emoji paste korle {{e:ID:fallback}} token e convert
function fromEntities(m) {
  let s = m.text || '';
  const ents = (m.entities || []).filter((e) => e.type === 'custom_emoji').sort((a, b) => b.offset - a.offset);
  for (const e of ents) s = s.slice(0, e.offset) + `{{e:${e.custom_emoji_id}:${s.slice(e.offset, e.offset + e.length)}}}` + s.slice(e.offset + e.length);
  return s.trim();
}

// ---------- Settings meta ----------
const SET = {
  support_link: ['Support link', 'text'],
  min_withdraw: ['Min withdraw ($)', 'num'],
  max_withdraw: ['Max withdraw ($)', 'num'],
  withdraw_cooldown_hours: ['Withdraw cooldown (hours, 0 = off)', 'num'],
  ref_reward: ['Referral reward ($ per valid referral)', 'num'],
  task_reset_hours: ['Task reset (hours, 0 = one-time)', 'num'],
  task_min_seconds: ['Task: seconds to wait after link click before Check works', 'num'],
  spam_threshold: ['Spam: button/command presses allowed in the window', 'int'],
  spam_window_sec: ['Spam: window length (seconds)', 'num'],
  spam_ladder: ['Spam: mute ladder in minutes (e.g. 1,3,5,30)', 'list'],
  spam_decay_hours: ['Spam: forget old offenses after (hours)', 'num']
};
const GROUPS = {
  gen: ['{{info}} General', ['support_link'], ['maintenance', 'withdraw_enabled', 'gate_enabled']],
  wd: ['{{wallet}} Withdraw, rewards & tasks', ['min_withdraw', 'max_withdraw', 'withdraw_cooldown_hours', 'ref_reward', 'task_reset_hours', 'task_min_seconds'], ['task_click_required']],
  sec: ['{{lock}} Device security', [], []],
  spam: ['{{stop}} Anti-spam', ['spam_threshold', 'spam_window_sec', 'spam_ladder', 'spam_decay_hours'], []]
};
const GROUP_OF = {};
Object.entries(GROUPS).forEach(([g, v]) => v[1].forEach((k) => (GROUP_OF[k] = g)));
const TOG = {
  maintenance: ['Maintenance mode', 'off'],
  withdraw_enabled: ['Withdrawals', 'on'],
  gate_enabled: ['Force-join', 'on'],
  task_click_required: ['Task link-click required', 'on']
};
const MODES = { off: 'OFF (no device check)', token: 'TOKEN (one device/app = one account, recommended)', strict: 'STRICT (token + fingerprint, may block identical phones)' };

// ---------- Screens ----------
async function home(chat, mid) {
  const pend = await countOf(sb.from('withdrawals').select('id', { count: 'exact', head: true }).eq('status', 'pending'));
  return show(chat, mid, '{{info}} Admin Panel\n\nControl everything from here.\nNew? Open {{chat}} Help for the full A-Z guide.', [
    [btn('{{uptrend}} Stats', 'a:st', 'primary'), btn('{{profile}} Users', 'a:u', 'primary')],
    [btn('{{tasks}} Tasks', 'a:t', 'primary'), btn('{{telegram}} Force-join', 'a:g', 'primary')],
    [btn(`{{wallet}} Withdrawals${pend ? ` (${pend})` : ''}`, 'a:w', pend ? 'success' : 'primary'), btn('{{gift}} Promo codes', 'a:p')],
    [btn('{{announce}} Broadcast', 'a:b'), btn('{{pin}} Edit texts', 'a:tx')],
    [btn('{{lock}} Settings', 'a:s'), btn('{{chat}} Help', 'a:h', 'success')]
  ]);
}

async function stats(c, mid) {
  const { data: s, error } = await sb.rpc('admin_stats');
  if (error || !s) return show(c, mid, '{{warn}} Stats failed. Did you run the SQL migration? (Help → Technical)', [BACK]);
  const lg = s.langs || {};
  return show(c, mid,
    `{{uptrend}} Stats\n\n{{profile}} Users: ${s.users} (today +${s.today})\n{{verified}} Passed force-join: ${s.passed}\n{{live}} Active 24h: ${s.active24}\n{{lock}} Verified devices: ${s.verified} · {{warn}} Flagged: ${s.flagged}\n{{stop}} Banned: ${s.banned} · {{time}} Muted now: ${s.muted}\n{{lang}} AR ${lg.ar || 0} · RU ${lg.ru || 0} · EN ${lg.en || 0}\n\n` +
    `{{money}} Users' balances: $${fmt(s.balances)}\n{{uptrend}} Total earned: $${fmt(s.earned)}\n{{wallet}} Total paid: $${fmt(s.paid)}\n{{time}} Pending: ${s.pending} ($${fmt(s.pending_amt)})\n\n` +
    `{{tasks}} Task completions: ${s.tasks_done} (paid $${fmt(s.task_earned)})\n{{follow}} Referrals: ${s.refs} · valid ${s.refs_valid} (paid $${fmt(s.ref_paid)})`,
    [[btn('🔄 Refresh', 'a:st', 'primary')], BACK]);
}

// ----- Tasks -----
const resetTxt = (tk) => (tk.reset_hours === null || tk.reset_hours === undefined ? `global (${S('task_reset_hours') ?? 24}h)` : tk.reset_hours === 0 ? 'one-time' : `${tk.reset_hours}h`);
const TASK_FIELDS = { title: 'title', link: 'link', reward: 'reward (USDT)', chat_id: 'channel (@username)', reset_hours: 'reset hours' };

async function taskList(c, mid) {
  const { data } = await sb.from('tasks').select('*').order('id');
  const rows = (data || []).map((tk) => [btn(`{{${taskIcon(tk)}}} ${tk.active ? '' : '(off) '}#${tk.id} ${cleanTitle(tk.title).slice(0, 28)} ($${tk.reward})`, `a:t:${tk.id}`)]);
  rows.push([btn('➕ Add task', 'a:ta', 'success'), btn('🔄 Reset all now', 'a:tra', 'danger')], BACK);
  return show(c, mid, `{{tasks}} Tasks (${(data || []).length})\n\nTap a task to edit.\nGlobal reset: ${S('task_reset_hours') ?? 24}h`, rows);
}
async function taskCard(c, mid, id) {
  const { data: tk } = await sb.from('tasks').select('*').eq('id', id).maybeSingle();
  if (!tk) return show(c, mid, '{{warn}} Task not found', [[btn('⬅️ Back', 'a:t')]]);
  const [done, clicks] = await Promise.all([
    countOf(sb.from('user_tasks').select('user_id', { count: 'exact', head: true }).eq('task_id', id)),
    countOf(sb.from('task_clicks').select('user_id', { count: 'exact', head: true }).eq('task_id', id))
  ]);
  const byClick = !(tk.type === 'channel' && tk.chat_id);
  const rows = [
    [btn(tk.active ? '⏸ Turn off' : '▶️ Turn on', `a:tt:${id}`, tk.active ? undefined : 'success')],
    [btn('✏️ Title', `a:te:title:${id}`), btn('{{pin}} Link', `a:te:link:${id}`)],
    [btn('{{money}} Reward', `a:te:reward:${id}`), btn('{{time}} Reset', `a:te:reset_hours:${id}`)],
    ...(tk.type === 'channel' ? [[btn('{{telegram}} Channel', `a:te:chat_id:${id}`)]] : []),
    [btn('{{trash}} Delete', `a:td:${id}`, 'danger')],
    [btn('⬅️ Back', 'a:t')]
  ];
  return show(c, mid,
    `{{${taskIcon(tk)}}} Task #${id}\n\nType: ${tk.type}\nTitle: ${tk.title}\nLink: ${tk.link}\n${tk.type === 'channel' ? `Channel: ${tk.chat_id || '-'}\n` : ''}Reward: $${tk.reward}\nReset: ${resetTxt(tk)}\nVerify: ${byClick ? ((S('task_click_required') ?? 'on') === 'off' ? 'none (Check = reward)' : `link click + ${S('task_min_seconds') ?? 10}s wait`) : 'channel membership'}\nStatus: ${tk.active ? 'active' : 'off'}\nLink clicks: ${clicks} · Completed by: ${done} users`, rows);
}

// ----- Force-join gates -----
async function gateList(c, mid) {
  const gs = await getGates(true);
  const on = S('gate_enabled') !== 'off';
  const rows = gs.map((g) => [btn(`{{${slotIcon(g)}}} ${g.active ? '' : '(off) '}${g.title}${g.chat_id || g.link ? '' : ' - not set'}`, `a:g:${g.id}`)]);
  rows.push([btn(on ? '{{verified}} Force-join: ON (tap to switch)' : '{{stop}} Force-join: OFF (tap to switch)', 'a:tg:gate_enabled:g', on ? 'success' : 'danger')]);
  rows.push([btn('➕ Add channel', 'a:ga', 'success'), btn('{{live}} Preview', 'a:gp')], BACK);
  return show(c, mid, '{{telegram}} Force-join channels\n\nUsers must join ALL active channels below before using the bot.\nTap one to set its link / chat id. Open Help → Force-join for setup steps.', rows);
}
async function gateCard(c, mid, id) {
  const { data: g } = await sb.from('gates').select('*').eq('id', id).maybeSingle();
  if (!g) return show(c, mid, '{{warn}} Not found', [[btn('⬅️ Back', 'a:g')]]);
  const note = g.slot === 'folder' ? '\n\n{{info}} Telegram folders cannot be checked directly. Put the Chat ID of ONE channel inside the folder.' : '';
  return show(c, mid,
    `{{${slotIcon(g)}}} ${g.title}\n\nLink: ${g.link || '-'}\nChat ID: ${g.chat_id || '- (not verified!)'}\nStatus: ${g.active ? 'ON' : 'OFF'}${note}`,
    [
      [btn(g.active ? '⏸ Turn off' : '▶️ Turn on', `a:gg:${id}`, g.active ? undefined : 'success')],
      [btn('✏️ Title', `a:ge:title:${id}`), btn('{{pin}} Link', `a:ge:link:${id}`)],
      [btn('{{telegram}} Chat ID', `a:ge:chat_id:${id}`), btn('🧪 Test', `a:gt:${id}`, 'primary')],
      [btn('{{trash}} Delete', `a:gd:${id}`, 'danger')],
      [btn('⬅️ Back', 'a:g')]
    ]);
}

// ----- Users -----
async function userCard(c, mid, uid) {
  const { data: u } = await sb.from('users').select('*').eq('id', uid).maybeSingle();
  if (!u) return show(c, mid, '{{warn}} User not found', [[btn('⬅️ Back', 'a:u')]]);
  const [{ data: rs }, tasks] = await Promise.all([
    sb.rpc('ref_stats', { uid }),
    countOf(sb.from('user_tasks').select('user_id', { count: 'exact', head: true }).eq('user_id', uid))
  ]);
  const r = rs || { total: 0, valid: 0, earned: 0 };
  const muted = u.mute_until && new Date(u.mute_until) > new Date();
  return show(c, mid,
    `{{profile}} ${u.first_name || '-'} ${u.username ? '@' + u.username : ''}\nID: ${u.id} · Lang: ${u.lang || '-'}\n\n{{money}} Balance: $${fmt(u.balance)}\n{{uptrend}} Earned: $${fmt(u.total_earned)}\n{{wallet}} Withdrawn: $${fmt(u.total_withdrawn)}\n{{follow}} Referrals: ${r.total} (valid ${r.valid}, earned $${fmt(r.earned)})${u.referred_by ? `\nInvited by: ${u.referred_by} (${u.ref_valid ? 'valid' : 'pending'})` : ''}\n{{tasks}} Tasks done: ${tasks}\n{{telegram}} Force-join passed: ${u.gate_ok ? 'yes' : 'no'}\n{{lock}} Device: ${u.device_verified ? 'verified' : 'not verified'}${u.dup_flag ? `\n{{warn}} Flags: ${u.dup_flag}` : ''}\n{{stop}} Banned: ${u.banned ? 'yes' : 'no'}${muted ? ` · muted until ${new Date(u.mute_until).toISOString().slice(11, 16)} UTC` : ''}\nSpam offenses: ${u.offenses || 0}\n{{time}} Joined: ${String(u.created_at).slice(0, 10)}`,
    [
      [btn('{{money}} Add balance', `a:ub:${uid}:+`, 'success'), btn('➖ Remove', `a:ub:${uid}:-`, 'danger')],
      [btn(u.banned ? '{{verified}} Unban' : '{{stop}} Ban', `a:ubn:${uid}`, u.banned ? 'success' : 'danger'), btn('🔄 Reset device', `a:ur:${uid}`)],
      [btn('{{letter}} Message user', `a:um:${uid}`), btn('{{warn}} Duplicates', `a:udup:${uid}`)],
      [btn('🔊 Unmute / clear strikes', `a:uun:${uid}`), btn('🔄 Reset tasks', `a:utr:${uid}`)],
      [btn('⬅️ Back', 'a:u')]
    ]);
}
async function dups(c, mid, uid) {
  const { data: u } = await sb.from('users').select('device_token,device_hash,device_ip').eq('id', uid).single();
  const find = async (col, val) => (val ? ((await sb.from('users').select('id,username').eq(col, val).neq('id', uid).limit(10)).data || []) : []);
  const [a, b, d] = await Promise.all([find('device_token', u.device_token), find('device_hash', u.device_hash), find('device_ip', u.device_ip)]);
  const L = (arr) => (arr.length ? arr.map((x) => `${x.id}${x.username ? ' @' + x.username : ''}`).join('\n   ') : '-');
  return show(c, mid, `{{warn}} Duplicates for ${uid}\n\nSame device token:\n   ${L(a)}\n\nSame fingerprint:\n   ${L(b)}\n\nSame IP:\n   ${L(d)}`, [[btn('⬅️ Back', `a:uc:${uid}`)]]);
}
async function userList(c, mid, title, q) {
  const { data } = await q.limit(20);
  const rows = (data || []).map((u) => [btn(`${u.banned ? '🚫 ' : ''}${u.username ? '@' + u.username : u.first_name || '-'} · ${u.id}`.slice(0, 60), `a:uc:${u.id}`)]);
  rows.push([btn('⬅️ Back', 'a:u')]);
  return show(c, mid, `${title} (${(data || []).length})`, rows);
}
async function exportCsv(c, table, cols, name) {
  let rows = [], from = 0;
  for (;;) {
    const { data } = await sb.from(table).select(cols).order('id').range(from, from + 999);
    if (!data || !data.length) break;
    rows = rows.concat(data);
    if (data.length < 1000 || rows.length >= 20000) break;
    from += 1000;
  }
  const head = cols.split(',');
  const csv = [head.join(','), ...rows.map((r) => head.map((h) => JSON.stringify(r[h] ?? '')).join(','))].join('\n');
  const fd = new FormData();
  fd.append('chat_id', String(c));
  fd.append('document', new Blob([csv], { type: 'text/csv' }), name);
  await fetch(`${API}/sendDocument`, { method: 'POST', body: fd });
}

// ----- Promo -----
async function promos(c, mid) {
  const { data } = await sb.from('promo_codes').select('*').order('created_at', { ascending: false }).limit(20);
  const rows = (data || []).map((p) => [
    btn(`{{gift}} ${p.active ? '' : '(off) '}${p.code} · $${p.reward} · ${p.used}/${p.max_uses || '∞'}`, `a:pt:${p.code}`),
    btn('{{trash}}', `a:pd:${p.code}`, 'danger')
  ]);
  rows.push([btn('➕ Create code', 'a:pc', 'success')], BACK);
  return show(c, mid, '{{gift}} Promo codes\n\nUsers redeem with: /promo CODE\nTap a code to switch it on/off. The bin deletes it.', rows);
}

// ----- Texts -----
const KEYS = Object.keys(T);
const PER = 8;
async function textLangs(c, mid) {
  return show(c, mid, '{{pin}} Edit texts\n\nPick a language. Every text, button label and message of the bot can be edited.', [
    ...LANGS.map((l) => [btn(NAMES[l], `a:txl:${l}:0`, 'primary')]), BACK]);
}
async function textList(c, mid, lang, page) {
  const pages = Math.ceil(KEYS.length / PER);
  page = Math.min(Math.max(page, 0), pages - 1);
  const rows = KEYS.slice(page * PER, page * PER + PER).map((k) => [btn(`${hasText(lang, k) ? '✏️ ' : ''}${k}`, `a:txk:${lang}:${k}`)]);
  const nav = [];
  if (page > 0) nav.push(btn('◀️', `a:txl:${lang}:${page - 1}`));
  nav.push(btn(`${page + 1}/${pages}`, `a:txl:${lang}:${page}`));
  if (page < pages - 1) nav.push(btn('▶️', `a:txl:${lang}:${page + 1}`));
  rows.push(nav, [btn('⬅️ Languages', 'a:tx')]);
  return show(c, mid, `{{pin}} Texts - ${NAMES[lang]}\n\n✏️ = customised. Tap a key to view / edit.`, rows);
}
async function textView(c, mid, lang, key) {
  if (!T[key]) return;
  const body = `Key: ${key}\nLanguage: ${NAMES[lang]} (${hasText(lang, key) ? 'customised' : 'default'})\nVariables: ${T[key].vars || 'none'}\n\n--- current text ---\n${rawText(lang, key)}`;
  return show(c, mid, body, [
    [btn('✏️ Edit', `a:txe:${lang}:${key}`, 'success'), btn('👁 Preview', `a:txp:${lang}:${key}`)],
    [btn('♻️ Reset to default', `a:txr:${lang}:${key}`, 'danger')],
    [btn('⬅️ Back', `a:txl:${lang}:0`)]
  ], true);
}

// ----- Settings -----
async function settings(c, mid, g) {
  if (!g) {
    return show(c, mid, '{{lock}} Settings\n\nPick a group:', [
      [btn(GROUPS.gen[0], 'a:s:gen')], [btn(GROUPS.wd[0], 'a:s:wd')], [btn(GROUPS.sec[0], 'a:s:sec')], [btn(GROUPS.spam[0], 'a:s:spam')], BACK]);
  }
  const [title, keys, togs] = GROUPS[g];
  const lines = keys.map((k) => `${SET[k][0]}: ${S(k) ?? '-'}`);
  const rows = keys.map((k) => [btn(`✏️ ${SET[k][0]}`.slice(0, 60), `a:se:${k}`)]);
  for (const k of togs) {
    const on = (S(k) ?? TOG[k][1]) === 'on';
    const good = k === 'maintenance' ? !on : on;
    lines.push(`${TOG[k][0]}: ${on ? 'ON' : 'OFF'}`);
    rows.push([btn(`${good ? '{{verified}}' : '{{warn}}'} ${TOG[k][0]}: ${on ? 'ON' : 'OFF'} (tap to switch)`, `a:tg:${k}:${g}`, good ? 'success' : 'danger')]);
  }
  if (g === 'sec') {
    lines.push(`Device check mode: ${MODES[S('device_mode') || 'token']}`);
    rows.push([btn('🔁 Change device mode', 'a:dm', 'primary')]);
  }
  rows.push([btn('⬅️ Back', 'a:s')]);
  return show(c, mid, `${title}\n\n${lines.join('\n')}`, rows);
}

// ----- Broadcast -----
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

const approveRow = (id) => [[btn('{{verified}} Approve', `ok:${id}`, 'success'), btn('{{cancel}} Reject', `no:${id}`, 'danger')]];

// ====================== CALLBACKS ======================
async function cb(q, user, path) {
  const c = q.message.chat.id, mid = q.message.message_id;
  const [sec, a1, a2] = path.split(':');
  const ask = async (state, data, text) => { await setState(user.id, state, data); return askMsg(c, text); };

  switch (sec) {
    case 'home': case 'x': await setState(user.id, null); return home(c, mid);
    case 'st': return stats(c, mid);

    // ----- Tasks -----
    case 't': return a1 ? taskCard(c, mid, Number(a1)) : taskList(c, mid);
    case 'ta': return show(c, mid, '{{tasks}} New task\n\nChoose the type:', [
      [btn('{{telegram}} Join channel (auto-verified)', 'a:tat:channel')], [btn('{{pin}} Link / X / post (link click verified)', 'a:tat:post')], [btn('{{rocket}} Start bot (link click verified)', 'a:tat:bot')], [btn('⬅️ Back', 'a:t')]]);
    case 'tat': return ask('a_t_title', { type: a1 }, '✏️ Send the task title (e.g. Follow our X)\n\nAn emoji is added automatically from the title.');
    case 'tt': {
      const { data: tk } = await sb.from('tasks').select('active').eq('id', Number(a1)).single();
      await sb.from('tasks').update({ active: !tk.active }).eq('id', Number(a1));
      return taskCard(c, mid, Number(a1));
    }
    case 'te':
      if (!TASK_FIELDS[a1]) return;
      return ask('a_te', { field: a1, id: Number(a2) }, `✏️ Send the new ${TASK_FIELDS[a1]}${a1 === 'reset_hours' ? '\n(0 = one-time, "global" = follow the global setting)' : ''}`);
    case 'td': return show(c, mid, `{{trash}} Delete task #${a1}?`, [[btn('{{verified}} Yes, delete', `a:tdy:${a1}`, 'danger'), btn('{{cancel}} Cancel', `a:t:${a1}`)]]);
    case 'tdy': await sb.from('tasks').delete().eq('id', Number(a1)); return taskList(c, mid);
    case 'tra': return show(c, mid, '🔄 Reset ALL users\' task progress now?\nEveryone can do every task again.', [[btn('{{verified}} Yes, reset', 'a:trad', 'danger'), btn('{{cancel}} Cancel', 'a:t')]]);
    case 'trad': await sb.from('user_tasks').delete().neq('task_id', 0); return taskList(c, mid);

    // ----- Force-join -----
    case 'g': return a1 ? gateCard(c, mid, Number(a1)) : gateList(c, mid);
    case 'ga': return ask('a_g_title', {}, '✏️ Send the button title (e.g. Official Channel)');
    case 'gg': {
      const { data: g } = await sb.from('gates').select('active').eq('id', Number(a1)).single();
      await sb.from('gates').update({ active: !g.active }).eq('id', Number(a1));
      return gateCard(c, mid, Number(a1));
    }
    case 'ge':
      if (!['title', 'link', 'chat_id'].includes(a1)) return;
      return ask('a_ge', { field: a1, id: Number(a2) }, `✏️ Send the new ${a1 === 'chat_id' ? 'Chat ID (@channelusername or -100...)' : a1}\n(send "-" to clear)`);
    case 'gd': return show(c, mid, '{{trash}} Delete this channel?', [[btn('{{verified}} Yes, delete', `a:gdy:${a1}`, 'danger'), btn('{{cancel}} Cancel', `a:g:${a1}`)]]);
    case 'gdy': await sb.from('gates').delete().eq('id', Number(a1)); return gateList(c, mid);
    case 'gp': {
      const gs = await getGates();
      return send(c, t('en', 'gateTitle', { name: 'Admin' }), { reply_markup: gateKb('en', gs) });
    }
    case 'gt': {
      const { data: g } = await sb.from('gates').select('*').eq('id', Number(a1)).single();
      if (!g.chat_id) return send(c, '{{warn}} No Chat ID set. This channel will NOT be verified (only the link is shown).');
      const me = await tg('getMe');
      const r = await tg('getChatMember', { chat_id: g.chat_id, user_id: me.result.id });
      const good = r.ok && ['administrator', 'creator'].includes(r.result.status);
      return send(c, good ? `{{done}} OK. Bot is admin in ${g.chat_id}. Verification works.` : `{{warn}} Problem: ${r.ok ? `bot is only "${r.result.status}" there. Make it ADMIN.` : r.description}\n\nCheck the Chat ID spelling and that the bot is admin of the channel.`);
    }

    // ----- Users -----
    case 'u': return show(c, mid, '{{profile}} Users', [
      [btn('{{profile}} Find user', 'a:uf', 'primary')],
      [btn('{{follow}} Top referrers', 'a:ut'), btn('{{uptrend}} Top earners', 'a:ue')],
      [btn('{{warn}} Flagged', 'a:ufl'), btn('{{stop}} Banned / muted', 'a:ubl')],
      [btn('{{pin}} Export users CSV', 'a:uex')], BACK]);
    case 'uf': return ask('a_u_find', {}, '🔎 Send the user ID or @username');
    case 'ut': {
      const { data } = await sb.rpc('top_referrers', { n: 10 });
      const txt = (data || []).map((r, i) => `${i + 1}. ${r.username ? '@' + r.username : r.uid} - valid ${r.valid} / total ${r.total}`).join('\n') || 'No referrals yet.';
      return show(c, mid, `{{follow}} Top referrers\n\n${txt}`, [[btn('⬅️ Back', 'a:u')]]);
    }
    case 'ue': {
      const { data } = await sb.from('users').select('id,username,total_earned').order('total_earned', { ascending: false }).limit(10);
      const txt = (data || []).map((r, i) => `${i + 1}. ${r.username ? '@' + r.username : r.id} - $${fmt(r.total_earned)}`).join('\n') || 'No users yet.';
      return show(c, mid, `{{uptrend}} Top earners\n\n${txt}`, [[btn('⬅️ Back', 'a:u')]]);
    }
    case 'ufl': return userList(c, mid, '{{warn}} Flagged users', sb.from('users').select('id,username,first_name,banned').not('dup_flag', 'is', null));
    case 'ubl': return userList(c, mid, '{{stop}} Banned / muted', sb.from('users').select('id,username,first_name,banned').or(`banned.eq.true,mute_until.gt.${new Date().toISOString()}`));
    case 'uex': await exportCsv(c, 'users', 'id,username,first_name,lang,balance,total_earned,total_withdrawn,referred_by,ref_valid,gate_ok,device_verified,dup_flag,banned,created_at', 'users.csv'); return;
    case 'uc': return userCard(c, mid, Number(a1));
    case 'ub': return ask('a_u_bal', { uid: Number(a1), sign: a2 }, `{{money}} ${a2 === '+' ? 'Add' : 'Remove'} balance: send the amount in USDT`);
    case 'ubn': {
      const { data: u } = await sb.from('users').select('banned').eq('id', Number(a1)).single();
      await sb.from('users').update({ banned: !u.banned }).eq('id', Number(a1));
      return userCard(c, mid, Number(a1));
    }
    case 'ur': await sb.from('users').update({ device_verified: false, device_hash: null, device_token: null, device_ip: null, dup_flag: null }).eq('id', Number(a1)); return userCard(c, mid, Number(a1));
    case 'um': return ask('a_u_msg', { uid: Number(a1) }, '{{letter}} Send the message for this user');
    case 'udup': return dups(c, mid, Number(a1));
    case 'uun': await sb.from('users').update({ mute_until: null, spam_count: 0, spam_at: null, offenses: 0 }).eq('id', Number(a1)); return userCard(c, mid, Number(a1));
    case 'utr': await sb.from('user_tasks').delete().eq('user_id', Number(a1)); return userCard(c, mid, Number(a1));

    // ----- Withdrawals -----
    case 'w': {
      const p = await countOf(sb.from('withdrawals').select('id', { count: 'exact', head: true }).eq('status', 'pending'));
      return show(c, mid, `{{wallet}} Withdrawals\n\nPending: ${p}`, [[btn(`{{time}} Pending (${p})`, 'a:wp', 'success')], [btn('{{pin}} History', 'a:wh'), btn('{{pin}} Export CSV', 'a:wex')], BACK]);
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
    case 'wex': await exportCsv(c, 'withdrawals', 'id,user_id,account,amount,status,created_at', 'withdrawals.csv'); return;

    // ----- Promo -----
    case 'p': return promos(c, mid);
    case 'pc': return ask('a_p', {}, '{{gift}} Send: CODE REWARD MAXUSES\nExample: WELCOME 0.5 100\n(MAXUSES 0 = unlimited)');
    case 'pt': {
      const { data: p } = await sb.from('promo_codes').select('active').eq('code', a1).single();
      await sb.from('promo_codes').update({ active: !p.active }).eq('code', a1);
      return promos(c, mid);
    }
    case 'pd': await sb.from('promo_codes').delete().eq('code', a1); return promos(c, mid);

    // ----- Broadcast -----
    case 'b': return ask('a_b_text', {}, '{{announce}} Send the broadcast text.\n\nTip: paste premium emoji directly, or use tokens like {{fire}} (Help → Premium emoji).');
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

    // ----- Texts -----
    case 'tx': return textLangs(c, mid);
    case 'txl': return textList(c, mid, a1, Number(a2) || 0);
    case 'txk': return textView(c, mid, a1, a2);
    case 'txe': return ask('a_x', { lang: a1, key: a2 }, `✏️ Send the new text for ${a2} (${NAMES[a1]}).\n\nVariables: ${T[a2].vars || 'none'}\nPaste premium emoji directly or use {{token}}.\nNew lines are kept.`);
    case 'txp': return send(c, t(a1, a2));
    case 'txr': await delText(a2, a1); return textView(c, mid, a1, a2);

    // ----- Settings -----
    case 's': return settings(c, mid, a1);
    case 'se':
      if (!SET[a1]) return;
      return ask('a_s', { key: a1 }, `✏️ Send the new value for: ${SET[a1][0]}\nCurrent: ${S(a1) ?? '-'}`);
    case 'tg': {
      if (!TOG[a1]) return;
      await setSetting(a1, (S(a1) ?? TOG[a1][1]) === 'on' ? 'off' : 'on');
      return a2 === 'g' ? gateList(c, mid) : settings(c, mid, a2 || 'gen');
    }
    case 'dm': {
      const order = ['off', 'token', 'strict'];
      await setSetting('device_mode', order[(order.indexOf(S('device_mode') || 'token') + 1) % 3]);
      return settings(c, mid, 'sec');
    }

    // ----- Help -----
    case 'h': {
      if (!a1) return show(c, mid, '{{chat}} Admin Help (A to Z)\n\nPick a topic:', [...PAGES.map((p) => [btn(p.title, `a:h:${p.id}`)]), BACK]);
      const p = PAGES.find((x) => x.id === a1);
      if (!p) return;
      return show(c, mid, p.body, [[btn('⬅️ Help', 'a:h'), btn('🏠 Panel', 'a:home')]], true);
    }
  }
}

// ====================== TEXT INPUT ======================
async function input(m, user) {
  const c = m.chat.id, d = user.state_data || {};
  const text = fromEntities(m);
  const done = () => setState(user.id, null);
  const bad = (msg) => send(c, `{{warn}} ${msg}`);

  switch (user.state) {
    // task wizard
    case 'a_t_title': await setState(user.id, 'a_t_link', { ...d, title: text }); return askMsg(c, '{{pin}} Send the task link (https://...)');
    case 'a_t_link':
      if (!/^https?:\/\//i.test(text)) return bad('Link must start with https://');
      if (d.type === 'channel') { await setState(user.id, 'a_t_chat', { ...d, link: text }); return askMsg(c, '{{telegram}} Send the channel username, e.g. @mychannel\n(The bot must be admin there.)'); }
      await setState(user.id, 'a_t_reward', { ...d, link: text });
      return askMsg(c, '{{money}} Send the reward in USDT, e.g. 0.05');
    case 'a_t_chat': await setState(user.id, 'a_t_reward', { ...d, chat_id: text }); return askMsg(c, '{{money}} Send the reward in USDT, e.g. 0.05');
    case 'a_t_reward': {
      const r = num(text);
      if (!isFinite(r) || r < 0) return bad('Send a valid number.');
      const { data: tk, error } = await sb.from('tasks').insert({ type: d.type, title: d.title, link: d.link, chat_id: d.chat_id || null, reward: r, reset_hours: d.type === 'channel' ? 0 : null }).select().single();
      await done();
      if (error) return bad(error.message);
      return taskCard(c, null, tk.id);
    }
    case 'a_te': {
      let v = text;
      if (d.field === 'reward') { v = num(text); if (!isFinite(v) || v < 0) return bad('Send a valid number.'); }
      if (d.field === 'reset_hours') {
        if (/^global$/i.test(text)) v = null;
        else { v = Number(text); if (!Number.isInteger(v) || v < 0) return bad('Send a whole number (0 = one-time) or "global".'); }
      }
      await sb.from('tasks').update({ [d.field]: v }).eq('id', d.id);
      await done();
      return taskCard(c, null, d.id);
    }

    // gates
    case 'a_g_title': await setState(user.id, 'a_g_link', { title: text }); return askMsg(c, '{{pin}} Send the channel link (https://t.me/...)');
    case 'a_g_link':
      if (!/^https?:\/\//i.test(text)) return bad('Link must start with https://');
      await setState(user.id, 'a_g_chat', { ...d, link: text });
      return askMsg(c, '{{telegram}} Send the Chat ID for verification: @channelusername or -100xxxxxxxxxx\n(Send "-" to skip. Then it is not verified.)');
    case 'a_g_chat': {
      const { data: g, error } = await sb.from('gates').insert({ slot: 'other', title: d.title, link: d.link, chat_id: text === '-' ? null : text, active: true, sort: 10 }).select().single();
      await done();
      if (error) return bad(error.message);
      return gateCard(c, null, g.id);
    }
    case 'a_ge': {
      await sb.from('gates').update({ [d.field]: text === '-' ? null : text }).eq('id', d.id);
      await done();
      return gateCard(c, null, d.id);
    }

    // users
    case 'a_u_find': {
      const key = text.replace('@', '');
      const qb = sb.from('users').select('id').limit(1);
      const { data } = await (/^\d+$/.test(key) ? qb.eq('id', Number(key)) : qb.ilike('username', key));
      if (!data || !data[0]) return bad('User not found. Try again or tap Cancel.');
      await done();
      return userCard(c, null, data[0].id);
    }
    case 'a_u_bal': {
      const a = num(text);
      if (!isFinite(a) || a <= 0) return bad('Send a positive number.');
      const { data: u } = await sb.from('users').select('balance').eq('id', d.uid).single();
      if (d.sign === '-' && a > Number(u.balance)) return bad("That is more than the user's balance.");
      await sb.rpc('add_balance', { uid: d.uid, amt: d.sign === '-' ? -a : a, earned: false });
      await done();
      return userCard(c, null, d.uid);
    }
    case 'a_u_msg': {
      const r = await send(d.uid, text);
      await done();
      await send(c, r.ok ? '{{done}} Sent.' : '{{warn}} Could not deliver (user may have blocked the bot).');
      return userCard(c, null, d.uid);
    }

    // settings / texts / promo / broadcast
    case 'a_s': {
      const type = SET[d.key][1];
      let v = text;
      if (type === 'num') { const n = num(text); if (!isFinite(n) || n < 0) return bad('Send a valid number.'); v = String(n); }
      if (type === 'int') { const n = Number(text); if (!Number.isInteger(n) || n < 1) return bad('Send a whole number (1 or more).'); v = String(n); }
      if (type === 'list') {
        const arr = text.split(',').map((x) => Number(x.trim()));
        if (!arr.length || arr.some((n) => !(n > 0))) return bad('Send minutes separated by commas, e.g. 1,3,5,30');
        v = arr.join(',');
      }
      await setSetting(d.key, v);
      await done();
      return settings(c, null, GROUP_OF[d.key]);
    }
    case 'a_x': {
      if (!text) return bad('Text cannot be empty.');
      await setText(d.key, d.lang, text);
      await done();
      return textView(c, null, d.lang, d.key);
    }
    case 'a_p': {
      const [code, reward, max] = text.split(/\s+/);
      const cd = (code || '').toUpperCase(), r = num(reward), mx = Number(max || 0);
      if (!/^[A-Z0-9_-]{3,20}$/.test(cd) || !isFinite(r) || r <= 0 || !Number.isInteger(mx) || mx < 0) return bad('Format: CODE REWARD MAXUSES\nExample: WELCOME 0.5 100');
      const { error } = await sb.from('promo_codes').insert({ code: cd, reward: r, max_uses: mx });
      await done();
      if (error) return bad('That code already exists.');
      return promos(c, null);
    }
    case 'a_b_text':
      await setState(user.id, 'a_b_pick', { text });
      return send(c, `{{announce}} Preview:\n\n${text}\n\nWho should get it?`, { reply_markup: { inline_keyboard: [
        [btn('🌍 Everyone', 'a:bt:all', 'success')],
        [btn('العربية', 'a:bt:ar'), btn('Русский', 'a:bt:ru'), btn('English', 'a:bt:en')],
        [btn('{{cancel}} Cancel', 'a:x', 'danger')]] } });
  }
}

module.exports = { home, cb, input, approveRow };
