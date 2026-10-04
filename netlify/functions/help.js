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
🔒 Settings — withdraw, referral, security, anti-spam
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
- Link / X / post — link click verify kore (niche dekho).
- Start bot — link click verify kore (niche dekho).

🔗 LINK CLICK VERIFY (channel chara baki task):
User er button asol link e na giye amader tracker e jay, tarpor asol link e redirect hoy. Tai bot jane user link e click korse kina.
- Click na kore Check chaple: "age link khulo" bole, reward dey na.
- Click er por kichu second (default 10s) wait korte hoy, tarpor Check kaj kore.
- Settings → Withdraw & tasks theke: "Task link-click required" ON/OFF ar wait second bodlano jay.
- Task card e "Link clicks" dekhabe koto jon click korse.
Limit: bot sotti jane na user X e follow korse kina. Shudhu jane link e click korse. Tai reward choto rakho.

Auto emoji: title e Follow / Join / Bot / Post / Gift / Live thakle sundor premium emoji nijei boshe.

Reset time: ekbar kora task abar koto ghonta por korte parbe.
- Global: Settings → Withdraw & tasks → Task reset (default 24h).
- Alada: task card → Reset → ghonta lekho. 0 = ekbar-i, global = global follow.
⚠️ Channel join task e reset diyo na. User already member, tai abar reward pabe. Tai channel task default e one-time.
Abar reward nite hole notun click lage.
Sobar task ekbare reset: Tasks → 🔄 Reset all now.

User dekhe: Total / Completed / Remaining / Earned / Next reset.
Task edit: title, link, reward, reset, channel, on/off, delete.`
  },
  {
    id: 'ref', title: 'Referral',
    body: `👥 REFERRAL

Valid kokhon: notun user referral link diye ashe → language bache → shob force-join channel e join kore Continue chape. Tokhon-i referrer er valid count + reward hoy.
Pending: ashche kintu channel join kore ni.
Spam: niche dekho.
Referrer ke kono message jay na.

💰 REWARD STEP (beshi refer korle rate kome):
Settings → Referral:
- Referral base reward = full reward ($).
- Referral reward steps = format "upto:percent", comma diye.
Example: 5:70,10:60,20:50,50:45,0:40
  1-5 number valid referral = base er 70%
  6-10 = 60%
  11-20 = 50%
  21-50 = 45%
  51+ = 40% (0 mane shesh porjonto, eta shesh entry hobe)
Sobai full reward chaile: 0:100
Notun step shudhu notun valid referral e lagu hoy. Ager pawa reward bodlay na.
📊 Referral payout preview chaple 1, 5, 10, 20, 50, 100 referral e total payout dekhay.

🛡 REFERRAL SPAM RULE:
Settings → Referral:
- Max referrals per window (default 1)
- Window minutes (default 2)
Rule: ekjon referrer er link diye window er moddhe max er beshi notun user ashle extra user "spam referral" hishebe mark hoy. Spam referral e kono reward hoy na, valid count e-o ashe na.
0 dile rule bondho.
User tar Referral screen e "Spam (no reward)" count ar rule dekhte pay.
Spam dhora hoy user bot e prothom ashar somoy (referral link diye).
False positive (asol manush): Users → Spam referrals → user chapo → "Approve referral (not spam)". Se already force-join pass kore thakle reward sathe sathe jog hoy.
Dhoro 2 bondhu ekshathe link e chap dilo, tokhon ekjon spam hobe. Tai window choto rakho ba max ektu baro (jemon 3 per 2 min).

User er Referral screen e dekhe: Total invited, Valid, Pending, Spam, Earned, reward step gulo, next valid referral koto dibe, share button.
Edit texts e "ref" text customise korle %tiers% ar %rule% variable rakho, na hole step ar rule dekhabe na.

Fraud dhorte: Users → user card → Duplicates (same device/IP). Nijeke refer kora auto block.`
  },
  {
    id: 'wd', title: 'Withdraw',
    body: `💳 WITHDRAW

User flow: Balance → Withdraw → balance check → cooldown check → device verify → Binance UID → amount → Confirm → tomader kache Approve/Reject.

Approve = total_withdrawn e jog hoy. Reject = balance ferot.
Cooldown: Settings → Withdraw & tasks → Withdraw cooldown (default 6h, 0 = off). Rejected request count hoy na.
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
    body: `🛡 ANTI-SPAM (button / command)

Bot er baire kono message, sticker, ba oichhik text dile bot kono uttor dey na, ar eta spam hishab hoy NA.
Spam hishab hoy shudhu button / command beshi bar chaple: menu button, inline button (Check, Withdraw...), /start, /promo.

Default: 30 second er moddhe 10 ber (ba beshi) chaple "offense".
Offense ladder: 1st sotorkobarta, 2nd 1 min, 3rd 3 min, 4th 5 min, 5th 30 min, 6th BAN.
24 ghonta bhalo thakle offense mone thake na.

Settings → Anti-spam theke bodlano jay:
- Presses allowed in the window (default 10)
- Window length in seconds (default 30)
- Mute ladder (default 1,3,5,30 minutes)
- Forget old offenses after (hours)

Mone rekho: task Check chapao gone. Onek task thakle limit ektu barao.
Restricted user dekhle inline button e "tumi restricted" alert pay, kono kaj hoy na.
Unmute/Unban: Users → user card → Unmute / Unban. Banned/Muted list: Users → Banned / muted.
Admin der spam hishab hoy na.
(Referral spam alada rule: Help → Referral dekho.)`
  },
  {
    id: 'users', title: 'Users',
    body: `👤 USERS

Find: ID ba @username.
Card e: balance, earned, withdrawn, referrals (valid / spam), tasks, device, flags, spam, joined.
Actions: Add/Remove balance, Ban/Unban, Reset device, Unmute, Message user, Duplicates, Reset tasks, Approve referral (spam hole).
Lists: Top referrers, Top earners, Flagged, Banned/Muted, Spam referrals.
Export CSV: sob user er file.`
  },
  {
    id: 'bc', title: 'Broadcast',
    body: `📢 BROADCAST

Broadcast → text lekho (premium emoji paste kora jay ba {{fire}} token) → preview → Everyone ba AR/RU/EN.
Ek bare ~20 jon ke pathay (Cloudflare free plan er limit). Baki thakle ▶️ Continue chapo, shesh na hoya porjonto.
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

- Bot reply dey na → browser e https://api.telegram.org/botTOKEN/getWebhookInfo kholo. last_error_message dekho. 401 = WEBHOOK_SECRET mile nai. 500 = Cloudflare Worker log dekho. Secret change korle Worker e Deploy korte hobe.
- Premium emoji dekhay na → owner account Premium kina dekho, Telegram update koro. Na hole bot nijei normal emoji dey.
- Button color/icon dekhay na → Telegram app update koro. Purano desktop version e hoy na.
- Force-join kaj kore na → bot channel e admin na ba Chat ID vul. Force-join page e 🧪 Test chapo.
- Task Check hoy na (channel task) → user join kore ni ba bot admin na.
- Task Check e "age link khulo" → user task button e click kore ni. Settings e wait second beshi kina dekho. SITE_URL secret thik kina dekho (https://earnix-bot.xxx.workers.dev, shesh e / chhara).
- Withdraw kora jay na → cooldown, min balance, withdrawals OFF, force-join, device verify check koro.
- User verify te block → Device mode TOKEN kore dao ba Reset device.
- User restricted hoye gese → Users → card → Unmute. Limit beshi choto hole Settings → Anti-spam e barao.
- Referral reward pay na → user spam referral hoyeche kina dekho (Users → Spam referrals). Settings → Referral e window / max bodlao.
- Broadcast e Failed → user bot block korse.
- Panel button kaj kore na → /admin diye notun panel kholo.
- Text edit korlam kintu purano dekhay → 20 second por update hoy.
- Stats e error → SQL migration run korcho kina dekho.
- Error 1102 (Worker exceeded resource limits) → free plan er 10ms CPU limit. Bhari kaj (boro CSV export) e hoy. Workers Paid e gele jay.
- Deploy fail → Cloudflare → Worker → Deployments / Builds log e error line dekho. File path thik kina dekho.`
  },
  {
    id: 'tech', title: 'Technical',
    body: `⚙️ TECHNICAL (Cloudflare / Supabase / GitHub)

Secrets (Cloudflare → Workers & Pages → earnix-bot → Settings → Variables and Secrets, prottek-ta Secret):
BOT_TOKEN, BOT_USERNAME, SUPABASE_URL, SUPABASE_SERVICE_KEY, WEBHOOK_SECRET, ADMIN_IDS (comma diye), SITE_URL

Notun admin: ADMIN_IDS secret e numeric ID comma diye jog → Deploy.
Code update: GitHub e file open → ✏️ edit → Commit. Cloudflare auto deploy kore.

Webhook set:
https://api.telegram.org/botTOKEN/setWebhook?url=SITE/.netlify/functions/bot&secret_token=SECRET
Webhook check: .../getWebhookInfo

Database: Supabase → Table editor / SQL editor. Notun SQL migration thakle SQL editor e run koro.
Backup: Supabase → Database → Backups, ba panel theke CSV export.

Files:
worker.js wrangler.toml
netlify/functions/ bot.js admin.js core.js go.js help.js i18n.js emoji.js verify.js
public/verify.html`
  }
];
module.exports = { PAGES };
