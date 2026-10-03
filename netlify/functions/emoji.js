// token -> [premium emoji id, fallback emoji]
const EM = {
  money: ['6190336264940559752', '💰'],
  wallet: ['5445353829304387411', '💳'],
  uptrend: ['5346141991732273337', '📈'],
  profile: ['6046481562336237320', '👤'],
  trash: ['6206108815075579644', '🗑'],
  cancel: ['5301020349515712616', '❌'],
  verified: ['6206479140040743133', '✅'],
  bell: ['6206508629286196237', '🔔'],
  letter: ['6206112371308500200', '✉️'],
  stop: ['6206396878532121864', '🚫'],
  binance: ['5893501660545682340', '🔶'],
  warn: ['6206174450765796040', '⚠️'],
  done: ['6206185428702206246', '✅'],
  pin: ['6206190608432764318', '📌'],
  announce: ['6206080502651164081', '📢'],
  gift: ['6206027872121918710', '🎁'],
  tasks: ['5436182278831103936', '📋'],
  follow: ['4909043075529048789', '👥'],
  support: ['5307746710682869587', '🎧'],
  telegram: ['5296432770392791386', '✈️'],
  addUser: ['5944970130554359187', '👥'],
  live: ['6206141323683042874', '🔴'],
  chat: ['6206495649895028694', '💬'],
  rocket: ['5195033767969839232', '🚀'],
  fire: ['5424972470023104089', '🔥'],
  info: ['5334544901428229844', 'ℹ️'],
  p100: ['5341498088408234504', '💯'],
  soon: ['5440621591387980068', '🔜'],
  lock: ['5296369303661067030', '🔒'],
  time: ['5382194935057372936', '⏰'],
  lang: ['6017109689748164760', '🌐']
};

const re = () => /\{\{([^{}]+)\}\}/g;

// {{money}} ba {{e:ID}} ba {{e:ID:fallback}}
function resolve(name) {
  if (EM[name]) return EM[name];
  const m = /^e:(\d+)(?::(.*))?$/.exec(name);
  return m ? [m[1], m[2] || '⭐'] : null;
}

function fx(text) {
  const r = re();
  let out = '', last = 0, m;
  const entities = [];
  while ((m = r.exec(text))) {
    out += text.slice(last, m.index);
    const e = resolve(m[1]);
    if (e) {
      entities.push({ type: 'custom_emoji', offset: out.length, length: e[1].length, custom_emoji_id: e[0] });
      out += e[1];
    } else out += m[0];
    last = m.index + m[0].length;
  }
  out += text.slice(last);
  return { text: out, entities };
}

const plain = (text) => String(text).replace(re(), (all, k) => { const e = resolve(k); return e ? e[1] : all; });

function parseBtn(text) {
  text = String(text);
  const m = text.match(/^\{\{([^{}]+)\}\}\s*/);
  const e = m && resolve(m[1]);
  let icon;
  if (e) { icon = e[0]; text = text.slice(m[0].length); }
  return { text: plain(text), icon };
}

function taskIcon(t) {
  const s = String(t.title || '').toLowerCase();
  if (/follow|subscribe/.test(s)) return 'follow';
  if (/invite|refer/.test(s)) return 'addUser';
  if (/gift|bonus|reward/.test(s)) return 'gift';
  if (/live|stream/.test(s)) return 'live';
  if (/join|channel|group|telegram/.test(s)) return 'telegram';
  if (/bot|start|launch/.test(s)) return 'rocket';
  if (/post|read|view|like|share|retweet|repost|comment|watch/.test(s)) return 'pin';
  return { channel: 'telegram', bot: 'rocket', post: 'pin' }[t.type] || 'tasks';
}

const slotIcon = (g) => ({ official: 'telegram', partner: 'follow', folder: 'pin' }[g.slot] || 'announce');

module.exports = { EM, fx, plain, parseBtn, taskIcon, slotIcon };
