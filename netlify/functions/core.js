const crypto = require('node:crypto');
const { createClient } = require('@supabase/supabase-js');
const { T } = require('./i18n');
const { fx, plain, parseBtn, slotIcon } = require('./emoji');

// Notun text key (Admin Panel → Edit texts e eigulo o edit kora jay)
Object.assign(T, {
  clickFirst: {
    vars: '',
    en: '{{warn}} Open the task link first, complete the task, then tap Check.',
    ar: '{{warn}} افتح رابط المهمة أولاً، أكملها، ثم اضغط تحقق.',
    ru: '{{warn}} Сначала откройте ссылку задания, выполните его и затем нажмите «Проверить».'
  },
  clickWait: {
    vars: '%time%',
    en: '{{time}} Please complete the task first. Tap Check again in %time%.',
    ar: '{{time}} يرجى إكمال المهمة أولاً. اضغط تحقق بعد %time%.',
    ru: '{{time}} Сначала выполните задание. Нажмите «Проверить» через %time%.'
  }
});

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const API = `https://api.telegram.org/bot${process.env.BOT_TOKEN}`;
const ADMINS = (process.env.ADMIN_IDS || '').split(',').map((s) => s.trim()).filter(Boolean);
const BOT_USERNAME = process.env.BOT_USERNAME || 'earnix_ubot';
const isAdmin = (id) => ADMINS.includes(String(id));

// ---------- Task link click tracking ----------
const signClick = (uid, tid) => crypto.createHmac('sha256', process.env.BOT_TOKEN).update(`${uid}:${tid}`).digest('hex').slice(0, 16);
const trackUrl = (uid, tid) => `${process.env.SITE_URL}/.netlify/functions/go?u=${uid}&t=${tid}&s=${signClick(uid, tid)}`;

// ---------- Telegram ----------
const tg = (method, p = {}) =>
  fetch(`${API}/${method}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) }).then((r) => r.json());

// premium emoji/icon reject hole normal emoji diye abar try kore
const strip = (b) => {
  const c = JSON.parse(JSON.stringify(b, (k, v) => (k === 'icon_custom_emoji_id' ? undefined : v)));
  delete c.entities;
  return c;
};
async function call(method, body) {
  const r = await tg(method, body);
  if (r.ok || r.error_code !== 400 || /not modified|not found|can't be edited|too long/i.test(r.description || '')) return r;
  return tg(method, strip(body));
}
const send = (chat_id, text, extra = {}) => {
  const f = fx(text);
  return call('sendMessage', { chat_id, text: f.text, ...(f.entities.length ? { entities: f.entities } : {}), disable_web_page_preview: true, ...extra });
};
const sendRaw = (chat_id, text, extra = {}) => call('sendMessage', { chat_id, text, disable_web_page_preview: true, ...extra });
const editRaw = (chat_id, message_id, text, entities, extra = {}) =>
  call('editMessageText', { chat_id, message_id, text, ...(entities && entities.length ? { entities } : {}), disable_web_page_preview: true, ...extra });
const edit = (chat_id, message_id, text, extra = {}) => { const f = fx(text); return editRaw(chat_id, message_id, f.text, f.entities, extra); };
const ack = (id, text) => tg('answerCallbackQuery', { callback_query_id: id, ...(text ? { text: plain(text).slice(0, 190), show_alert: true } : {}) });

async function show(chat, mid, text, kb, raw) {
  const markup = { inline_keyboard: kb };
  if (mid) {
    const r = raw ? await editRaw(chat, mid, text, [], { reply_markup: markup }) : await edit(chat, mid, text, { reply_markup: markup });
    if (r.ok || /not modified/i.test(r.description || '')) return r;
  }
  return raw ? sendRaw(chat, text, { reply_markup: markup }) : send(chat, text, { reply_markup: markup });
}

// ---------- Settings + custom texts cache (20s) ----------
let cache = { at: 0, S: {}, X: {} };
async function loadCache(force) {
  if (!force && Date.now() - cache.at < 20000) return;
  const [s, x] = await Promise.all([sb.from('settings').select('*'), sb.from('texts').select('*')]);
  cache = {
    at: Date.now(),
    S: Object.fromEntries((s.data || []).map((r) => [r.key, r.value])),
    X: Object.fromEntries((x.data || []).map((r) => [`${r.key}|${r.lang}`, r.value]))
  };
}
const S = (k) => cache.S[k];
async function setSetting(k, v) { await sb.from('settings').upsert({ key: k, value: String(v) }); cache.S[k] = String(v); }
async function setText(key, lang, value) { await sb.from('texts').upsert({ key, lang, value }); cache.X[`${key}|${lang}`] = value; }
async function delText(key, lang) { await sb.from('texts').delete().eq('key', key).eq('lang', lang); delete cache.X[`${key}|${lang}`]; }
const hasText = (lang, key) => cache.X[`${key}|${lang}`] !== undefined;
const rawText = (lang, key) => {
  const o = cache.X[`${key}|${lang}`], d = T[key];
  return o !== undefined ? o : d[lang] !== undefined ? d[lang] : d.en;
};
function t(lang, key, vars = {}) {
  if (!T[key]) return key;
  return rawText(lang, key).replace(/%(\w+)%/g, (all, k) => (vars[k] !== undefined ? vars[k] : all));
}

// ---------- Buttons / helpers ----------
function mkBtn(text, extra, style) {
  const p = parseBtn(text);
  return { text: p.text || ' ', ...extra, ...(style ? { style } : {}), ...(p.icon ? { icon_custom_emoji_id: p.icon } : {}) };
}
const btn = (text, data, style) => mkBtn(text, { callback_data: data }, style);
const ubtn = (text, url, style) => mkBtn(text, { url }, style);

const norm = (s) => String(s).replace(/[^\p{L}\p{N}]/gu, '').toLowerCase();
const fmt = (n) => Number(n).toFixed(4);
const cleanTitle = (s) => String(s).replace(/^[^\p{L}\p{N}]+/u, '');
const setState = (id, state, data = null) => sb.from('users').update({ state, state_data: data }).eq('id', id);
const countOf = async (q) => (await q).count || 0;
function dur(sec) {
  sec = Math.max(0, Math.round(sec));
  const d = Math.floor(sec / 86400), h = Math.floor((sec % 86400) / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  if (d) return `${d}d ${h}h`;
  if (h) return `${h}h ${m}m`;
  if (m) return s ? `${m}m ${s}s` : `${m}m`;
  return `${s}s`;
}

// ---------- Force-join gates ----------
async function getGates(all) {
  let q = sb.from('gates').select('*').order('sort').order('id');
  if (!all) q = q.eq('active', true);
  const { data } = await q;
  return (data || []).filter((g) => all || g.link || g.chat_id);
}
const gateLink = (g) => g.link || (g.chat_id && String(g.chat_id).startsWith('@') ? `https://t.me/${String(g.chat_id).slice(1)}` : null);
function gateKb(l, gates) {
  const rows = gates.filter(gateLink).map((g) => [ubtn(`{{${slotIcon(g)}}} ${g.title}`, gateLink(g), 'primary')]);
  rows.push([btn(t(l, 'gateContinue'), 'gate:chk', 'success')]);
  return { inline_keyboard: rows };
}
async function missingGates(uid, gates) {
  const res = await Promise.all(gates.map(async (g) => {
    if (!g.chat_id) return null;
    const r = await tg('getChatMember', { chat_id: g.chat_id, user_id: uid });
    if (!r.ok) { console.error('gate check failed:', g.title, r.description); return null; }
    const s = r.result.status;
    const joined = ['member', 'administrator', 'creator'].includes(s) || (s === 'restricted' && r.result.is_member);
    return joined ? null : g;
  }));
  return res.filter(Boolean);
}

module.exports = {
  sb, API, ADMINS, BOT_USERNAME, isAdmin, tg, send, sendRaw, edit, editRaw, ack, show,
  loadCache, S, setSetting, setText, delText, hasText, rawText, t,
  mkBtn, btn, ubtn, norm, fmt, cleanTitle, setState, countOf, dur,
  getGates, gateLink, gateKb, missingGates, signClick, trackUrl
};
