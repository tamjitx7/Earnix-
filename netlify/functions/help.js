// Admin Help (Panel -> Help). Raw text, tai {{...}} jemon lekha ache temon dekhabe.
const PAGES = [
  {
    id: 'start', title: 'Panel porichoy',
    body: `🛠 ADMIN PANEL — PORICHOY

Panel khulte: keyboard-er "Admin Panel" button ba /admin likho.
Je kono step-e ✖ Cancel ba /cancel dile ber hoye ashbe.

Section gulo:
📈 Stats — user, balance, task, referral, spam, flagged shob ek jaygay
👤 Users — user khuje balance / ban / message / device reset
📋 Tasks — notun task, edit, on/off, reset time
✈️ Force-join — je channel e join na korle bot use kora jabe na
💳 Withdrawals — pending approve/reject, history, CSV
🎁 Promo codes — user der gift code
📢 Broadcast — shobai ke message
📌 Edit texts — bot-er shob lekha + keyboard button-er naam (3 language)
🔒 Settings — min/max, cooldown, reward, security, anti-spam
💬 Help — ei guide

Commands:
/start — user bot shuru kore
/admin — admin panel
/cancel — cholomaan step bondho
/promo CODE — user promo code use kore (panel theke code banao)`
  },
  {
    id: 'texts', title: 'Text / button edit',
    body: `📌 TEXT EDIT KORA

Panel → Edit texts → language (AR/RU/EN) → key chapo → ✏️ Edit.
✏️ chinho mane oi text tumi bodlecho. ♻️ Reset dile default e fire jay.

Variable: %balance% %name% ... egulo lekhar moddhe thakle bot nijei man boshiye dey. Kon key te kon variable ache seta Edit screen-e dekhabe. Variable er naam bodlano jabe na.

Premium emoji dite:
1) Seraser premium emoji tomar message-e paste koro. Bot auto convert kore nibe.
2) Ba token lekho: {{fire}} {{money}} (list: Help → Premium emoji)

Keyboard button er naam: btn_bal, btn_tasks, btn_ref, btn_sup, btn_lang.
Naam er shurute {{token}} dile oita button icon hoy. Jemon: {{wallet}} Balance
Notun naam user ra pabe jokhon tara /start dibe ba language bodlabe. Purano keyboard e purano naam o kaj kore.

Mone rekho: ekta language edit korle shudhu oi language er user ra dekhbe. Tin language alada edit korte hobe.
Edit korar ~20 second por sobar kache update hoy.`
  },
  {
    id: 'gates', title: 'Force-join channel',
    body: `✈️ FORCE-JOIN (CHANNEL GATE)

Notun user language bachar por ei channel gulo te join na korle bot e dhukte parbe na. Join kore Continue chaple main menu ashe.

Setup:
1) Prottek channel e bot ke ADMIN banao. Shudhu member hole Telegram bot ke member check korte dey na.
2) Panel → Force-join → channel chapo (Official / Partner / Folder).
3) Link dao: https://t.me/xxxx (user er button e ei link khulbe).
4) Chat ID dao: public channel hole @channelusername, private hole -100xxxxxxxxxx.
5) 🧪 Test chapo. "OK" dekhale thik ache.
6) Channel ON kore dao.

Folder (Add Folder): Telegram folder link (t.me/addlist/...) dile user ek click e shob channel add korte pare. Kintu bot folder joining sorasori check korte pare na. Tai folder er bhitorer EKTA channel er Chat ID boshao. Oi channel e join holei folder pass.

➕ Add channel diye aro gate jog kora jay. Link/ID chara gate skip hoy.
Force-join pura bondho: oi page er ON/OFF button.

User channel chhere dile withdraw korar somoy abar check hobe, na thakle abar join korte bolbe.
Referral tokhon e valid hobe jokhon referred user shob channel e join kore pass kore.`
  },
  {
    id: 'tasks', title: 'Tasks',
    body: `📋 TASKS

Add: Tasks → ➕ Add task → type → title → link → (channel hole @username) → reward.

Type:
- Join channel — bot sotti member kina check kore (bot ke channel e admin banate hobe).
- Link / X / post — Check chaple reward dey (verify kora jay na).
- Start bot — same, verify kora jay na.

Auto emoji: title e Follow / Join / Bot / Post / Gift / Live thakle sundor premium emoji nijei boshe.

Reset time: ekbar kora task abar koto ghonta por korte parbe.
- Global: Settings → Withdraw & rewards → Task reset (default 24h).
- Alada: task card → Reset → ghonta lekho. 0 = ekbar-i, global = global follow.
⚠️ Channel join task e reset diyo na. User already member, tai abar reward pabe. Tai channel task default e one-time.
Sobar task ekbare reset: Tasks → 🔄 Reset all now.

User dekhe: Total / Completed / Remaining / Earned / Next reset.
Task edit: title, link, reward, reset, channel, on/off, delete.`
  },
  {
    id: 'ref', title: 'Referral',
    body: `👥 REFERRAL

Reward per valid referral: Settings → Withdraw & rewards → Referral reward.

Valid kokhon: notun user referral link diye ashe → language bache → shob force-join channel e join kore Continue chape. Tokhon-i referrer er count + reward hoy.
Pending: ashche kintu channel join kore ni.
Referrer ke kono message jay na.

User referral screen e dekhe: Total invited, Valid, Pending, Earned, ar share button.

Fraud dhorte: Users → user card → Duplicates (same device/IP). Nijeke refer kora auto block.`
  },
  {
    id: 'wd', title: 'Withdraw',
    body: `💳 WITHDRAW

User flow: Balance → Withdraw → balance check → cooldown check → device verify → Binance UID → amount → Confirm → tomader kache Approve/Reject.

Approve = total_withdrawn e jog hoy. Reject = balance ferot.
Cooldown: Settings → Withdraw & rewards → Withdraw cooldown (default 6h, 0 = off). Rejected request count hoy na.
⚠️ Admin der o cooldown lage. Test korte 0 kore nio.
Min/Max: oi page e.
Bondho: Settings → General → Withdrawals toggle.
Pending list: Withdrawals → Pending. History ar CSV export ache.
Admin notification e Flags dekhabe (fp / ip = sondehojonok device).`
  },
  {
    id: 'dev', title: 'Device verify',
    body: `🔐 DEVICE VERIFICATION

Withdraw er age user ke ekta Mini App e verify korte hoy. Amra save kori: device token (app storage e random ID), browser fingerprint, ar IP (hash kora).

Mode: Settings → Device security
- OFF — kono check nai.
- TOKEN (recommended) — ek-i phone/app e arekta account verify korte gele block.
- STRICT — token + fingerprint mille block. Soman model er phone e vul block hote pare, tai savdhan.

Soft flag: fp/ip mille user card e Flags dekhay, block hoy na (TOKEN mode e). Users → Flagged diye dekho.
Kono user ke chharo: User card → Reset device, tarpor se abar verify korbe.

Limit: eta 100% fool-proof na. App data clear / reinstall korle token bodlay. Tai flag + manual review rakho.`
  },
  {
    id: 'spam', title: 'Anti-spam',
    body: `🛡 ANTI-SPAM

Bot er button/command chara onno kono message ba sticker dile bot kono uttor dey na, kintu gune rakhe.

Default: 10 minute e 3 ber er beshi hole "offense".
Offense ladder: 1st sotorkobarta, 2nd 1 min, 3rd 3 min, 4th 5 min, 5th 30 min, 6th BAN.
24 ghonta bhalo thakle offense mone thake na.

Settings → Anti-spam theke threshold, ladder (1,3,5,30), window, decay bodlano jay.
Unmute/Unban: Users → user card → Unmute / Unban.
Admin der spam hishab hoy na.`
  },
  {
    id: 'users', title: 'Users',
    body: `👤 USERS

Find: ID ba @username.
Card e: balance, earned, withdrawn, referrals (valid), tasks, device, flags, spam, joined.
Actions: Add/Remove balance, Ban/Unban, Reset device, Unmute, Message user, Duplicates, Reset tasks.
Lists: Top referrers, Top earners, Flagged, Banned/Muted.
Export CSV: sob user er file.`
  },
  {
    id: 'bc', title: 'Broadcast',
    body: `📢 BROADCAST

Broadcast → text lekho (premium emoji paste kora jay ba {{fire}} token) → preview → Everyone ba AR/RU/EN.
Ek bare ~150-200 jon ke pathay (Netlify time limit). Baki thakle ▶️ Continue chapo, shesh na hoya porjonto.
Banned user ke pathay na. Bot block kora user "Failed" e gone.`
  },
  {
    id: 'emoji', title: 'Premium emoji',
    body: `✨ PREMIUM EMOJI

Bot er owner account Premium thakle bot nijer message e premium emoji dite pare.

Text e token: {{money}} → premium money emoji.
Button text er shurute token dile button icon hoy.
Notun emoji lagle: bot e (admin account theke) premium emoji pathao. Emoji-only message hole bot ID bole dey. Tarpor {{e:ID}} lekho. Ba text edit e seraser premium emoji paste koro.

Token list:
money wallet uptrend profile trash cancel verified bell letter stop binance warn done pin announce gift tasks follow support telegram addUser live chat rocket fire info p100 soon lock time lang`
  },
  {
    id: 'fix', title: 'Somossha o somadhan',
    body: `🧰 SOMOSSHA O SOMADHAN

- Bot reply dey na → browser e https://api.telegram.org/botTOKEN/getWebhookInfo kholo. last_error_message dekho. 401 = WEBHOOK_SECRET mile nai. 500 = Netlify function log dekho. Env var change korle Deploy abar korte hobe.
- Premium emoji dekhay na → owner account Premium kina dekho, Telegram update koro. Na hole bot nijei normal emoji dey.
- Button color/icon dekhay na → Telegram app update koro. Purano desktop version e hoy na.
- Force-join kaj kore na → bot channel e admin na ba Chat ID vul. Force-join page e 🧪 Test chapo.
- Task Check hoy na → channel task hole user join kore ni ba bot admin na.
- Withdraw kora jay na → cooldown, min balance, withdrawals OFF, force-join, device verify check koro.
- User verify te block → Device mode TOKEN kore dao ba Reset device.
- Broadcast e Failed → user bot block korse.
- Panel button kaj kore na → /admin diye notun panel kholo.
- Text edit korlam kintu purano dekhay → 20 second por update hoy.
- Stats e error → SQL migration run korcho kina dekho.
- Netlify deploy fail → Deploys log e error line dekho. File path thik kina dekho.`
  },
  {
    id: 'tech', title: 'Technical',
    body: `⚙️ TECHNICAL (Netlify / Supabase / GitHub)

Env vars (Netlify → Site configuration → Environment variables):
BOT_TOKEN, BOT_USERNAME, SUPABASE_URL, SUPABASE_SERVICE_KEY, WEBHOOK_SECRET, ADMIN_IDS (comma diye), SITE_URL

Notun admin: ADMIN_IDS e numeric ID comma diye jog → Deploys → Trigger deploy.
Code update: GitHub e file open → ✏️ edit → Commit. Netlify auto deploy kore.

Webhook set:
https://api.telegram.org/botTOKEN/setWebhook?url=SITE/.netlify/functions/bot&secret_token=SECRET
Webhook check: .../getWebhookInfo

Database: Supabase → Table editor / SQL editor. Notun SQL migration thakle SQL editor e run koro.
Backup: Supabase → Database → Backups, ba panel theke CSV export.

Files:
netlify/functions/ bot.js admin.js core.js help.js i18n.js emoji.js verify.js
public/verify.html`
  }
];
module.exports = { PAGES };
