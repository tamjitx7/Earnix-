// token -> [premium emoji id, fallback emoji]
// Text-e {{money}} likhle premium emoji hoye jabe. Button-er text-er shurute likhle button-er icon hoy.
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

const tok = () => /\{\{(\w+)\}\}/g;

// Text theke {{token}} ke fallback emoji + custom_emoji entity te convert kore
function fx(text) {
  const re = tok();
  let out = '', last = 0, m;
  const entities = [];
  while ((m = re.exec(text))) {
    out += text.slice(last, m.index);
    const e = EM[m[1]];
    if (e) {
      entities.push({ type: 'custom_emoji', offset: out.length, length: e[1].length, custom_emoji_id: e[0] });
      out += e[1];
    }
    last = m.index + m[0].length;
  }
  out += text.slice(last);
  return { text: out, entities };
}

// Jekhane premium emoji dewa jay na (alert, etc.) shekhane normal emoji
const plain = (text) => String(text).replace(tok(), (_, k) => (EM[k] ? EM[k][1] : ''));

// Button text: shurur {{token}} ta button icon hoye jay
function parseBtn(text) {
  let icon;
  const m = String(text).match(/^\{\{(\w+)\}\}\s*/);
  if (m && EM[m[1]]) { icon = EM[m[1]][0]; text = String(text).slice(m[0].length); }
  return { text: plain(text), icon };
}

// Notun task-er lekha dekhe auto emoji
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

module.exports = { EM, fx, plain, parseBtn, taskIcon };
