const C = require('./core');
const { sb, tg, send, show, ack, btn, t, S, editRaw, dur, ADMINS } = C;
const { T } = require('./i18n');
const { fx } = require('./emoji');

// ---------- Texts (Admin Panel → Edit texts e eigulo edit kora jay) ----------
Object.assign(T, {
  btn_profile: { vars: '', en: '{{profile}} Profile', ar: '{{profile}} الملف الشخصي', ru: '{{profile}} Профиль' },
  btn_live: { vars: '', en: '{{support}} Live chat', ar: '{{support}} دردشة مباشرة', ru: '{{support}} Живой чат' },
  profile: {
    vars: '%name% %id% %balance% %earned% %withdrawn%',
    en: '{{profile}} Your Profile\n\n{{profile}} Name: %name%\n{{pin}} ID: %id%\n{{wallet}} Balance: $%balance% USDT\n\nChoose an option below.',
    ar: '{{profile}} ملفك الشخصي\n\n{{profile}} الاسم: %name%\n{{pin}} المعرّف: %id%\n{{wallet}} الرصيد: $%balance% USDT\n\nاختر من الخيارات أدناه.',
    ru: '{{profile}} Ваш профиль\n\n{{profile}} Имя: %name%\n{{pin}} ID: %id%\n{{wallet}} Баланс: $%balance% USDT\n\nВыберите пункт ниже.'
  },
  lvIntro: {
    vars: '%price% %balance%',
    en: '{{support}} Live Support\n\nChat with a real support agent about your account, deposits, withdrawals or tasks.\n\n{{verified}} Our agent replies to you right here\n{{lock}} The chat stays open until our team closes it, so follow-up messages cost nothing extra\n{{info}} After a chat is closed, a new chat is a new session and is charged again\n\n{{money}} Price: $%price% USDT per session, taken from your balance\n{{wallet}} Your balance: $%balance% USDT',
    ar: '{{support}} الدعم المباشر\n\nتحدث مع موظف دعم حقيقي بخصوص حسابك أو الإيداع أو السحب أو المهام.\n\n{{verified}} يرد عليك موظفنا هنا مباشرة\n{{lock}} تبقى المحادثة مفتوحة حتى يغلقها فريقنا، فلا تكلفة إضافية على رسائل المتابعة\n{{info}} بعد إغلاق المحادثة، تُعد المحادثة الجديدة جلسة جديدة ويتم الخصم مجدداً\n\n{{money}} السعر: $%price% USDT للجلسة، يُخصم من رصيدك\n{{wallet}} رصيدك: $%balance% USDT',
    ru: '{{support}} Живая поддержка\n\nОбщайтесь с настоящим агентом поддержки по вопросам аккаунта, пополнений, выводов или заданий.\n\n{{verified}} Агент отвечает вам прямо здесь\n{{lock}} Чат остаётся открытым, пока его не закроет наша команда, поэтому дополнительные сообщения бесплатны\n{{info}} После закрытия чата новый чат — это новая сессия, и оплата списывается снова\n\n{{money}} Цена: $%price% USDT за сессию, списывается с баланса\n{{wallet}} Ваш баланс: $%balance% USDT'
  },
  lvStartBtn: { vars: '%price%', en: '{{chat}} Start live chat · $%price%', ar: '{{chat}} بدء الدردشة · $%price%', ru: '{{chat}} Начать чат · $%price%' },
  lvNewBtn: { vars: '', en: '{{chat}} Start a new chat', ar: '{{chat}} بدء دردشة جديدة', ru: '{{chat}} Начать новый чат' },
  lvOff: { vars: '', en: '{{stop}} Live chat is temporarily unavailable. Please try again later.', ar: '{{stop}} الدردشة المباشرة غير متاحة مؤقتاً. حاول لاحقاً.', ru: '{{stop}} Живой чат временно недоступен. Попробуйте позже.' },
  lvConnected: {
    vars: '%id%',
    en: '{{chat}} You are connected to live support (chat #%id%).\n\nType your message here. You can also send photos or files. Our agent will reply in this chat.',
    ar: '{{chat}} أنت متصل بالدعم المباشر (محادثة #%id%).\n\nاكتب رسالتك هنا. يمكنك أيضاً إرسال صور أو ملفات. سيرد عليك موظفنا في هذه المحادثة.',
    ru: '{{chat}} Вы подключены к живой поддержке (чат #%id%).\n\nНапишите сообщение здесь. Можно также отправлять фото и файлы. Агент ответит в этом чате.'
  },
  lvStarted: {
    vars: '%id% %price%',
    en: '{{done}} Connected! Chat #%id% is open.\n\n{{money}} $%price% USDT was taken from your balance.\n\n{{chat}} Describe your issue in a message. You can also send photos or files. An agent will reply here as soon as possible.',
    ar: '{{done}} تم الاتصال! المحادثة #%id% مفتوحة.\n\n{{money}} تم خصم $%price% USDT من رصيدك.\n\n{{chat}} اشرح مشكلتك في رسالة. يمكنك أيضاً إرسال صور أو ملفات. سيرد عليك موظف هنا في أقرب وقت.',
    ru: '{{done}} Подключено! Чат #%id% открыт.\n\n{{money}} С вашего баланса списано $%price% USDT.\n\n{{chat}} Опишите проблему в сообщении. Можно также отправить фото или файлы. Агент ответит здесь как можно скорее.'
  },
  lvAgent: { vars: '%text%', en: '{{support}} Support\n\n%text%', ar: '{{support}} الدعم\n\n%text%', ru: '{{support}} Поддержка\n\n%text%' },
  lvEnded: {
    vars: '%id%',
    en: '{{done}} Chat #%id% was closed by our team. We hope your issue is solved!\n\n{{info}} Need more help? Start a new chat. A new session is charged again.',
    ar: '{{done}} أغلق فريقنا المحادثة #%id%. نأمل أن تكون مشكلتك قد حُلّت!\n\n{{info}} تحتاج مساعدة إضافية؟ ابدأ محادثة جديدة. تُحتسب الجلسة الجديدة برسوم مرة أخرى.',
    ru: '{{done}} Чат #%id% закрыт нашей командой. Надеемся, ваш вопрос решён!\n\n{{info}} Нужна ещё помощь? Начните новый чат. Новая сессия оплачивается снова.'
  },
  lvRefunded: {
    vars: '%id% %refund%',
    en: '{{info}} Chat #%id% was closed and $%refund% USDT was returned to your balance.',
    ar: '{{info}} تم إغلاق المحادثة #%id% وأُعيد $%refund% USDT إلى رصيدك.',
    ru: '{{info}} Чат #%id% закрыт, $%refund% USDT возвращено на ваш баланс.'
  },
  lvExpired: {
    vars: '%id%',
    en: '{{time}} Chat #%id% was closed automatically because there was no activity.\n\n{{info}} You can start a new chat anytime. A new session is charged again.',
    ar: '{{time}} أُغلقت المحادثة #%id% تلقائياً لعدم وجود نشاط.\n\n{{info}} يمكنك بدء محادثة جديدة في أي وقت. تُحتسب الجلسة الجديدة برسوم مرة أخرى.',
    ru: '{{time}} Чат #%id% закрыт автоматически из-за отсутствия активности.\n\n{{info}} Вы можете начать новый чат в любое время. Новая сессия оплачивается снова.'
  },
  lvSlow: { vars: '', en: '{{warn}} You are sending messages too fast. Please slow down.', ar: '{{warn}} ترسل الرسائل بسرعة كبيرة. يرجى التمهل.', ru: '{{warn}} Вы отправляете сообщения слишком быстро. Пожалуйста, помедленнее.' },
  wdDaily: {
    vars: '%max% %time%',
    en: '{{stop}} Daily withdrawal limit reached.\n\n{{info}} You can make up to %max% withdrawals per 24 hours.\n{{time}} Next withdrawal available in %time%.',
    ar: '{{stop}} تم الوصول إلى حد السحب اليومي.\n\n{{info}} يمكنك إجراء حتى %max% عمليات سحب كل 24 ساعة.\n{{time}} السحب التالي متاح بعد %time%.',
    ru: '{{stop}} Достигнут дневной лимит выводов.\n\n{{info}} Можно сделать до %max% выводов за 24 часа.\n{{time}} Следующий вывод будет доступен через %time%.'
  }
});

// ---------- Helpers ----------
const cfg = () => ({
  enabled: S('live_enabled') !== 'off',
  price: Number(S('live_price') ?? 0.1),
  expire: Number(S('live_expire_hours') ?? 24),
  rate: Number(S('live_rate_per_min') ?? 15)
});
const usd = (n) => String(Number(Number(n).toFixed(4)));
const esc = (s) => String(s).replace(/\{\{/g, '{\u200b{'); // user text e {{token}} thakleo emoji hoye jabe na
const nameOf = (u) => u.first_name || u.username || 'User';
const startKb = (l) => ({ inline_keyboard: [[btn(t(l, 'lvNewBtn'), 'lv:start', 'success')]] });
const adminKb = (id, uid) => [[btn('{{cancel}} End chat', `a:lce:${id}`, 'danger'), btn('{{profile}} User', `a:uc:${uid}`)]];
const ago = (iso) => dur((Date.now() - new Date(iso).getTime()) / 1000) + ' ago';

async function closeChat(id, by) {
  const { data } = await sb.rpc('live_close', { cid: id, p_by: by });
  return data && data[0] ? data[0] : null;
}

// user er open session ber kore (expire / desync handle kore)
async function getOpen(user) {
  if (!user.live_chat) return null;
  const { data: s } = await sb.from('live_chats').select('*').eq('id', user.live_chat).eq('status', 'open').maybeSingle();
  if (!s) {
    await sb.from('users').update({ live_chat: null }).eq('id', user.id);
    user.live_chat = null;
    return null;
  }
  const c = cfg();
  if (c.expire > 0 && Date.now() - new Date(s.last_at).getTime() > c.expire * 3600000) {
    await closeChat(s.id, 'timeout');
    user.live_chat = null;
    await send(user.id, t(user.lang, 'lvExpired', { id: s.id }), { reply_markup: startKb(user.lang) });
    return null;
  }
  return s;
}

// ====================== USER SIDE ======================
async function intro(chat, user, mid) {
  const l = user.lang, c = cfg();
  if (!c.enabled) return show(chat, mid, t(l, 'lvOff'), []);
  const open = await getOpen(user);
  if (open) return show(chat, mid, t(l, 'lvConnected', { id: open.id }), []);
  const bal = Number(user.balance);
  const rows = [[btn(t(l, 'lvStartBtn', { price: usd(c.price) }), 'lv:go', 'success')]];
  if (bal < c.price - 1e-9) rows.push([btn(t(l, 'adDepBtn'), 'ad:dep', 'primary')]); // balance kom hole Deposit option
  return show(chat, mid, t(l, 'lvIntro', { price: usd(c.price), balance: usd(bal) }), rows);
}

async function notifyNew(user, id, price) {
  const text = `{{chat}} New live chat #${id}\n{{profile}} ${esc(nameOf(user))}${user.username ? ' @' + user.username : ''} · ID ${user.id}\n{{money}} Paid: $${usd(price)} USDT\n\nReply (Telegram Reply) to the user's messages to answer. Use the buttons to end the chat.`;
  for (const a of ADMINS) await send(a, text, { reply_markup: { inline_keyboard: adminKb(id, user.id) } });
}

async function cb(q, user, d) {
  const chat = q.message.chat.id, mid = q.message.message_id, l = user.lang, c = cfg();
  const A = (text) => ack(q.id, text);
  if (d === 'start') { await A(); return intro(chat, user, mid); }
  if (d === 'go') {
    if (!c.enabled) { await A(); return show(chat, mid, t(l, 'lvOff'), []); }
    const need = c.price - Number(user.balance);
    if (need > 1e-9) return A(t(l, 'adLowAlert', { x: usd(need) })); // balance kom, charge hobe na
    let r = await sb.rpc('live_start', { uid: user.id, p_price: c.price });
    if (r.error) r = await sb.rpc('live_start', { uid: user.id, p_price: c.price }); // duibar chapar race
    const row = r.data && r.data[0];
    if (!row) return A(t(l, 'adLowAlert', { x: usd(Math.max(need, 0.0001)) }));
    await A();
    user.live_chat = row.r_id;
    await show(chat, mid, t(l, row.r_new ? 'lvStarted' : 'lvConnected', { id: row.r_id, price: usd(c.price) }), []);
    if (row.r_new) await notifyNew(user, row.r_id, c.price);
    return;
  }
  return A();
}

// user er message (text / photo / file ...) admin der kache pathay
async function relay(m, user) {
  const s = await getOpen(user);
  if (!s) return false;
  const c = cfg(), l = user.lang, now = Date.now();
  const upd = { last_at: new Date(now).toISOString() };
  if (c.rate > 0) {
    const inWin = s.win_at && now - new Date(s.win_at).getTime() < 60000;
    const n = inWin ? (s.win_n || 0) + 1 : 1;
    upd.win_n = n;
    if (!inWin) upd.win_at = new Date(now).toISOString();
    if (n > c.rate) {
      await sb.from('live_chats').update(upd).eq('id', s.id);
      if (n === c.rate + 1) await send(m.chat.id, t(l, 'lvSlow'));
      return true;
    }
  }
  const hdr = `{{chat}} #${s.id} · ${esc(nameOf(user))} · ${user.id}`;
  const kb = { inline_keyboard: adminKb(s.id, user.id) };
  const maps = [];
  for (const a of ADMINS) {
    if (m.text) {
      const r = await send(a, `${hdr}\n\n${esc(m.text.slice(0, 3500))}`, { reply_markup: kb });
      if (r.ok) maps.push({ chat_id: Number(a), msg_id: r.result.message_id, session: s.id });
    } else {
      const r = await send(a, `${hdr}\n{{pin}} (attachment below)`, { reply_markup: kb });
      if (r.ok) {
        maps.push({ chat_id: Number(a), msg_id: r.result.message_id, session: s.id });
        const cp = await tg('copyMessage', { chat_id: a, from_chat_id: m.chat.id, message_id: m.message_id, reply_to_message_id: r.result.message_id, allow_sending_without_reply: true });
        if (cp.ok) maps.push({ chat_id: Number(a), msg_id: cp.result.message_id, session: s.id });
      }
    }
  }
  if (maps.length) await sb.from('live_msgs').insert(maps);
  await sb.from('live_chats').update(upd).eq('id', s.id);
  await tg('setMessageReaction', { chat_id: m.chat.id, message_id: m.message_id, reaction: [{ type: 'emoji', emoji: '👀' }] }); // delivered
  return true;
}

// ====================== ADMIN SIDE ======================
// Admin Telegram Reply diye uttor dile user er kache jay. true = handle hoyeche
async function adminReply(m) {
  const { data: map } = await sb.from('live_msgs').select('session').eq('chat_id', m.chat.id).eq('msg_id', m.reply_to_message.message_id).maybeSingle();
  if (!map) return false;
  const { data: s } = await sb.from('live_chats').select('*').eq('id', map.session).single();
  if (!s || s.status !== 'open') {
    await send(m.chat.id, '{{warn}} This chat has ended. The user must start a new chat.');
    return true;
  }
  const { data: u } = await sb.from('users').select('lang').eq('id', s.user_id).single();
  const ul = (u && u.lang) || 'en';
  const r = m.text
    ? await send(s.user_id, t(ul, 'lvAgent', { text: esc(m.text.slice(0, 3500)) }))
    : await tg('copyMessage', { chat_id: s.user_id, from_chat_id: m.chat.id, message_id: m.message_id });
  if (!r.ok) {
    await send(m.chat.id, `{{warn}} Could not deliver: ${r.description || 'user may have blocked the bot'}`);
    return true;
  }
  await sb.from('live_chats').update({ last_at: new Date().toISOString() }).eq('id', s.id);
  const conf = await send(m.chat.id, `{{done}} Sent · chat #${s.id}\nSolved? End the chat, or keep it open for follow-ups.`, {
    reply_markup: { inline_keyboard: [
      [btn('{{cancel}} End chat', `a:lce:${s.id}`, 'danger'), btn('🔁 Keep open', `a:lck:${s.id}`)],
      [btn('💸 End & refund', `a:lcf:${s.id}`)]
    ] }
  });
  if (conf.ok) await sb.from('live_msgs').insert({ chat_id: m.chat.id, msg_id: conf.result.message_id, session: s.id });
  return true;
}

function stamp(q, status) {
  const base = q.message.text || '';
  const f = fx(`\n\n${status}`);
  const ents = [...(q.message.entities || []), ...f.entities.map((e) => ({ ...e, offset: e.offset + base.length }))];
  return editRaw(q.message.chat.id, q.message.message_id, base + f.text, ents);
}

async function adminCb(q, user, sec, a1) {
  const c = q.message.chat.id, mid = q.message.message_id, id = Number(a1);
  switch (sec) {
    case 'lc': {
      const { data } = await sb.from('live_chats').select('*').eq('status', 'open').order('id');
      const ids = (data || []).map((s) => s.user_id);
      const { data: us } = ids.length ? await sb.from('users').select('id,first_name,username').in('id', ids) : { data: [] };
      const nm = Object.fromEntries((us || []).map((u) => [u.id, u.first_name || u.username || String(u.id)]));
      const rows = (data || []).map((s) => [btn(`{{chat}} #${s.id} · ${nm[s.user_id] || s.user_id} · ${ago(s.last_at)}`.slice(0, 60), `a:lcc:${s.id}`)]);
      rows.push([btn('{{pin}} History', 'a:lch')], [btn('⬅️ Back', 'a:home')]);
      return show(c, mid, `{{chat}} Live chats\n\nOpen now: ${(data || []).length}\nTap a chat to manage it.\n\nTo answer, use Telegram Reply on the user's message.`, rows);
    }
    case 'lcc': {
      const { data: s } = await sb.from('live_chats').select('*').eq('id', id).maybeSingle();
      if (!s) return show(c, mid, '{{warn}} Not found', [[btn('⬅️ Back', 'a:lc')]]);
      const { data: u } = await sb.from('users').select('first_name,username').eq('id', s.user_id).maybeSingle();
      const open = s.status === 'open';
      return show(c, mid,
        `{{chat}} Live chat #${s.id}\n{{profile}} ${esc((u && (u.first_name || u.username)) || s.user_id)}${u && u.username ? ' @' + u.username : ''} · ID ${s.user_id}\nStatus: ${s.status}${s.closed_by ? ` (${s.closed_by})` : ''}\n{{money}} Paid: $${usd(s.price)}\nStarted: ${ago(s.created_at)}\nLast activity: ${ago(s.last_at)}`,
        [
          ...(open ? [[btn('{{cancel}} End chat', `a:lce:${s.id}`, 'danger'), btn('💸 End & refund', `a:lcf:${s.id}`)]] : []),
          [btn('{{profile}} User', `a:uc:${s.user_id}`)],
          [btn('⬅️ Back', 'a:lc')]
        ]);
    }
    case 'lce': case 'lcf': {
      const refund = sec === 'lcf';
      const row = await closeChat(id, refund ? 'refund' : 'admin');
      if (!row) return send(c, `Chat #${id} is already closed.`);
      const { data: u } = await sb.from('users').select('lang').eq('id', row.r_uid).single();
      const ul = (u && u.lang) || 'en';
      const price = Number(row.r_price);
      if (refund && price > 0) {
        await sb.rpc('add_balance', { uid: row.r_uid, amt: price, earned: false });
        await send(row.r_uid, t(ul, 'lvRefunded', { id, refund: usd(price) }), { reply_markup: startKb(ul) });
      } else {
        await send(row.r_uid, t(ul, 'lvEnded', { id }), { reply_markup: startKb(ul) });
      }
      return stamp(q, refund && price > 0 ? `{{done}} ENDED · refunded $${usd(price)}` : '{{done}} ENDED');
    }
    case 'lck':
      return stamp(q, '🔁 Kept open');
    case 'lch': {
      const { data } = await sb.from('live_chats').select('*').eq('status', 'closed').order('id', { ascending: false }).limit(15);
      const txt = (data || []).map((s) => `#${s.id} · user ${s.user_id} · $${usd(s.price)} · ${s.closed_by || '-'} · ${ago(s.closed_at || s.last_at)}`).join('\n') || 'Nothing yet.';
      return show(c, mid, `{{pin}} Last closed chats\n\n${txt}`, [[btn('⬅️ Back', 'a:lc')]]);
    }
  }
}

module.exports = { intro, cb, relay, adminReply, adminCb };
