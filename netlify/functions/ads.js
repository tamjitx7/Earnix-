const C = require('./core');
const { sb, tg, send, show, ack, btn, t, S, setState, cleanTitle, ADMINS, BOT_USERNAME, editRaw, countOf } = C;
const { T } = require('./i18n');
const { fx } = require('./emoji');

// ---------- Texts (Admin Panel → Edit texts e eigulo edit kora jay) ----------
Object.assign(T, {
  btn_ads: { vars: '', en: '{{rocket}} Add Task', ar: '{{rocket}} إضافة مهمة', ru: '{{rocket}} Добавить задание' },
  adIntro: {
    vars: '%minBalance% %minDeposit% %price% %minQty% %balance%',
    en: '{{rocket}} Grow Your Channel, Bot or Link\n\nAdd your own task and let our active community join, visit or start it. Your audience grows, and your budget is spent only on completed tasks.\n\n{{verified}} Every task is reviewed before it goes live\n{{uptrend}} Track the progress of every order\n{{lock}} Your budget is held safely. If an order is rejected, the full amount returns to your balance\n\n{{info}} Requirements\n{{money}} Minimum balance to order: $%minBalance% USDT\n{{wallet}} Minimum deposit: $%minDeposit% USDT\n{{pin}} Price: $%price% USDT per completed task\n{{follow}} Minimum order: %minQty% completions\n{{stop}} Adult, scam, phishing or illegal content is not allowed\n\n{{wallet}} Your balance: $%balance% USDT',
    ar: '{{rocket}} انمِ قناتك أو بوتك أو رابطك\n\nأضف مهمتك الخاصة ودع مجتمعنا النشط ينضم أو يزور أو يشغّل. ينمو جمهورك ولا تُخصم ميزانيتك إلا مقابل المهام المنجزة.\n\n{{verified}} تتم مراجعة كل مهمة قبل نشرها\n{{uptrend}} تابع تقدم كل طلب\n{{lock}} ميزانيتك محفوظة بأمان. عند رفض الطلب يعود المبلغ كاملاً إلى رصيدك\n\n{{info}} الشروط\n{{money}} الحد الأدنى للرصيد للطلب: $%minBalance% USDT\n{{wallet}} الحد الأدنى للإيداع: $%minDeposit% USDT\n{{pin}} السعر: $%price% USDT لكل مهمة منجزة\n{{follow}} الحد الأدنى للطلب: %minQty% تنفيذ\n{{stop}} يُمنع المحتوى الإباحي أو الاحتيالي أو التصيّدي أو غير القانوني\n\n{{wallet}} رصيدك: $%balance% USDT',
    ru: '{{rocket}} Развивайте свой канал, бота или ссылку\n\nДобавьте своё задание, и наше активное сообщество подпишется, перейдёт или запустит его. Аудитория растёт, а бюджет тратится только на выполненные задания.\n\n{{verified}} Каждое задание проходит проверку перед публикацией\n{{uptrend}} Следите за прогрессом каждого заказа\n{{lock}} Бюджет надёжно хранится. Если заказ отклонён, вся сумма вернётся на баланс\n\n{{info}} Условия\n{{money}} Минимальный баланс для заказа: $%minBalance% USDT\n{{wallet}} Минимальный депозит: $%minDeposit% USDT\n{{pin}} Цена: $%price% USDT за выполненное задание\n{{follow}} Минимальный заказ: %minQty% выполнений\n{{stop}} Запрещён контент для взрослых, мошенничество, фишинг и незаконный контент\n\n{{wallet}} Ваш баланс: $%balance% USDT'
  },
  adStartBtn: { vars: '', en: '{{rocket}} Add task', ar: '{{rocket}} إضافة مهمة', ru: '{{rocket}} Добавить задание' },
  adMyBtn: { vars: '', en: '{{tasks}} My orders', ar: '{{tasks}} طلباتي', ru: '{{tasks}} Мои заказы' },
  adBackBtn: { vars: '', en: '⬅️ Back', ar: '⬅️ رجوع', ru: '⬅️ Назад' },
  adNextBtn: { vars: '', en: 'Next ➡️', ar: 'التالي ➡️', ru: 'Далее ➡️' },
  adDepBtn: { vars: '', en: '{{wallet}} Deposit', ar: '{{wallet}} إيداع', ru: '{{wallet}} Пополнить' },
  adPaidBtn: { vars: '', en: '{{verified}} I have paid', ar: '{{verified}} لقد دفعت', ru: '{{verified}} Я оплатил' },
  adConfirmBtn: { vars: '', en: '{{verified}} Place order', ar: '{{verified}} تأكيد الطلب', ru: '{{verified}} Оформить заказ' },
  adOff: { vars: '', en: '{{stop}} Add Task is temporarily unavailable. Please try again later.', ar: '{{stop}} خدمة إضافة المهام غير متاحة مؤقتاً. حاول لاحقاً.', ru: '{{stop}} Добавление заданий временно недоступно. Попробуйте позже.' },
  adGateLow: {
    vars: '%minBalance% %balance%',
    en: '{{wallet}} Step 1 of 6 · Balance\n\n{{warn}} You need at least $%minBalance% USDT to provide a task.\n{{money}} Your balance: $%balance% USDT\n\n{{uptrend}} You can earn more USDT by completing tasks, or deposit balance to continue.',
    ar: '{{wallet}} الخطوة 1 من 6 · الرصيد\n\n{{warn}} تحتاج إلى $%minBalance% USDT على الأقل لإضافة مهمة.\n{{money}} رصيدك: $%balance% USDT\n\n{{uptrend}} يمكنك ربح المزيد بإنجاز المهام، أو إيداع رصيد للمتابعة.',
    ru: '{{wallet}} Шаг 1 из 6 · Баланс\n\n{{warn}} Для добавления задания нужно минимум $%minBalance% USDT.\n{{money}} Ваш баланс: $%balance% USDT\n\n{{uptrend}} Вы можете заработать больше, выполняя задания, или пополнить баланс, чтобы продолжить.'
  },
  adGateOk: {
    vars: '%minBalance% %balance%',
    en: '{{wallet}} Step 1 of 6 · Balance\n\n{{done}} You have enough balance to provide a task.\n{{money}} Your balance: $%balance% USDT\n\nTap Next to continue.',
    ar: '{{wallet}} الخطوة 1 من 6 · الرصيد\n\n{{done}} رصيدك كافٍ لإضافة مهمة.\n{{money}} رصيدك: $%balance% USDT\n\nاضغط التالي للمتابعة.',
    ru: '{{wallet}} Шаг 1 из 6 · Баланс\n\n{{done}} Баланса достаточно для добавления задания.\n{{money}} Ваш баланс: $%balance% USDT\n\nНажмите «Далее», чтобы продолжить.'
  },
  adLowAlert: { vars: '%x%', en: '{{warn}} You need $%x% USDT more to continue.', ar: '{{warn}} تحتاج إلى $%x% USDT إضافية للمتابعة.', ru: '{{warn}} Вам нужно ещё $%x% USDT, чтобы продолжить.' },
  adPickType: { vars: '', en: '{{pin}} Step 2 of 6 · Task type\n\nWhat would you like to promote?', ar: '{{pin}} الخطوة 2 من 6 · نوع المهمة\n\nماذا تريد أن تروّج؟', ru: '{{pin}} Шаг 2 из 6 · Тип задания\n\nЧто вы хотите продвигать?' },
  adTChannel: { vars: '', en: '{{telegram}} Channel (join)', ar: '{{telegram}} قناة (انضمام)', ru: '{{telegram}} Канал (подписка)' },
  adTLink: { vars: '', en: '{{pin}} Link (visit)', ar: '{{pin}} رابط (زيارة)', ru: '{{pin}} Ссылка (переход)' },
  adTBot: { vars: '', en: '{{rocket}} Bot (start)', ar: '{{rocket}} بوت (تشغيل)', ru: '{{rocket}} Бот (запуск)' },
  adTN: { vars: '', en: 'Channel (join)|Link (visit)|Bot (start)', ar: 'قناة (انضمام)|رابط (زيارة)|بوت (تشغيل)', ru: 'Канал (подписка)|Ссылка (переход)|Бот (запуск)' },
  adAskLink: {
    vars: '%example% %extra%',
    en: '{{telegram}} Step 3 of 6 · Link\n\nSend your link, for example:\n%example%%extra%',
    ar: '{{telegram}} الخطوة 3 من 6 · الرابط\n\nأرسل رابطك، مثال:\n%example%%extra%',
    ru: '{{telegram}} Шаг 3 из 6 · Ссылка\n\nОтправьте вашу ссылку, например:\n%example%%extra%'
  },
  adChanNote: { vars: '%bot%', en: '{{warn}} Add @%bot% as an admin of your channel, otherwise joins cannot be verified.', ar: '{{warn}} أضف @%bot% كمشرف في قناتك، وإلا لن يمكن التحقق من الانضمام.', ru: '{{warn}} Добавьте @%bot% администратором в ваш канал, иначе подписки нельзя проверить.' },
  adBadLink: {
    vars: '',
    en: '{{warn}} Invalid link. Channel tasks need a public link like https://t.me/yourchannel. Other tasks need a valid https:// link.',
    ar: '{{warn}} رابط غير صالح. مهام القنوات تحتاج رابطاً عاماً مثل https://t.me/yourchannel. بقية المهام تحتاج رابط https:// صالحاً.',
    ru: '{{warn}} Неверная ссылка. Для канала нужна публичная ссылка вида https://t.me/yourchannel. Для остальных заданий нужна корректная ссылка https://.'
  },
  adAskTitle: {
    vars: '',
    en: '{{announce}} Step 4 of 6 · Title\n\nSend a short title (3-40 characters), for example: Join CryptoNews',
    ar: '{{announce}} الخطوة 4 من 6 · العنوان\n\nأرسل عنواناً قصيراً (3-40 حرفاً)، مثال: انضم إلى CryptoNews',
    ru: '{{announce}} Шаг 4 из 6 · Название\n\nОтправьте короткое название (3-40 символов), например: Подпишись на CryptoNews'
  },
  adBadTitle: { vars: '', en: '{{warn}} The title must be 3-40 characters.', ar: '{{warn}} يجب أن يكون العنوان من 3 إلى 40 حرفاً.', ru: '{{warn}} Название должно содержать 3-40 символов.' },
  adPickQty: {
    vars: '%min% %max% %price% %balance%',
    en: '{{follow}} Step 5 of 6 · Quantity\n\nHow many completions do you want? Each costs $%price% USDT.\nMin %min% · Max %max%. You can also type a number.\n\n{{wallet}} Your balance: $%balance% USDT',
    ar: '{{follow}} الخطوة 5 من 6 · الكمية\n\nكم عدد التنفيذات التي تريدها؟ كل تنفيذ بسعر $%price% USDT.\nالحد الأدنى %min% · الأقصى %max%. يمكنك أيضاً كتابة رقم.\n\n{{wallet}} رصيدك: $%balance% USDT',
    ru: '{{follow}} Шаг 5 из 6 · Количество\n\nСколько выполнений вам нужно? Каждое стоит $%price% USDT.\nМин. %min% · Макс. %max%. Можно ввести число.\n\n{{wallet}} Ваш баланс: $%balance% USDT'
  },
  adBadQty: { vars: '%min% %max%', en: '{{warn}} Send a whole number between %min% and %max%.', ar: '{{warn}} أرسل رقماً صحيحاً بين %min% و %max%.', ru: '{{warn}} Отправьте целое число от %min% до %max%.' },
  adReview: {
    vars: '%type% %title% %link% %qty% %price% %total% %balance% %after%',
    en: '{{verified}} Step 6 of 6 · Review\n\n{{pin}} Type: %type%\n{{announce}} Title: %title%\n{{telegram}} Link: %link%\n{{follow}} Completions: %qty%\n{{money}} Price per completion: $%price% USDT\n{{wallet}} Total cost: $%total% USDT\n\n{{money}} Balance now: $%balance% USDT\n{{uptrend}} Balance after order: $%after% USDT\n\n{{info}} Your task is reviewed by our team before it goes live.',
    ar: '{{verified}} الخطوة 6 من 6 · المراجعة\n\n{{pin}} النوع: %type%\n{{announce}} العنوان: %title%\n{{telegram}} الرابط: %link%\n{{follow}} عدد التنفيذات: %qty%\n{{money}} سعر التنفيذ: $%price% USDT\n{{wallet}} التكلفة الإجمالية: $%total% USDT\n\n{{money}} رصيدك الآن: $%balance% USDT\n{{uptrend}} الرصيد بعد الطلب: $%after% USDT\n\n{{info}} يراجع فريقنا مهمتك قبل نشرها.',
    ru: '{{verified}} Шаг 6 из 6 · Проверка\n\n{{pin}} Тип: %type%\n{{announce}} Название: %title%\n{{telegram}} Ссылка: %link%\n{{follow}} Выполнений: %qty%\n{{money}} Цена за выполнение: $%price% USDT\n{{wallet}} Общая стоимость: $%total% USDT\n\n{{money}} Баланс сейчас: $%balance% USDT\n{{uptrend}} Баланс после заказа: $%after% USDT\n\n{{info}} Наша команда проверит задание перед публикацией.'
  },
  adPlaced: { vars: '%id%', en: '{{done}} Order #%id% submitted!\n\nOur team will review it shortly. We will notify you as soon as it is live.', ar: '{{done}} تم إرسال الطلب #%id%!\n\nسيراجعه فريقنا قريباً وسنخطرك فور نشره.', ru: '{{done}} Заказ #%id% отправлен!\n\nНаша команда скоро его проверит. Мы сообщим, как только он будет опубликован.' },
  adApproved: { vars: '%id% %title%', en: '{{rocket}} Your task is live!\n\nOrder #%id% "%title%" was approved and is now visible to our community.', ar: '{{rocket}} مهمتك نشطة الآن!\n\nتمت الموافقة على الطلب #%id% "%title%" وأصبح ظاهراً لمجتمعنا.', ru: '{{rocket}} Ваше задание опубликовано!\n\nЗаказ #%id% «%title%» одобрен и теперь виден нашему сообществу.' },
  adRejected: { vars: '%id% %title% %refund%', en: '{{stop}} Order #%id% "%title%" was rejected.\n\n{{wallet}} $%refund% USDT was returned to your balance.', ar: '{{stop}} تم رفض الطلب #%id% "%title%".\n\n{{wallet}} أُعيد $%refund% USDT إلى رصيدك.', ru: '{{stop}} Заказ #%id% «%title%» отклонён.\n\n{{wallet}} $%refund% USDT возвращено на баланс.' },
  adStopped: { vars: '%id% %title% %refund%', en: '{{info}} Order #%id% "%title%" was stopped.\n\n{{wallet}} $%refund% USDT for the unused completions was returned to your balance.', ar: '{{info}} تم إيقاف الطلب #%id% "%title%".\n\n{{wallet}} أُعيد $%refund% USDT عن التنفيذات غير المستخدمة إلى رصيدك.', ru: '{{info}} Заказ #%id% «%title%» остановлен.\n\n{{wallet}} $%refund% USDT за неиспользованные выполнения возвращено на баланс.' },
  adFinished: { vars: '%id% %title%', en: '{{done}} Order #%id% "%title%" is complete! All completions were delivered.', ar: '{{done}} اكتمل الطلب #%id% "%title%"! تم تسليم جميع التنفيذات.', ru: '{{done}} Заказ #%id% «%title%» завершён! Все выполнения доставлены.' },
  adOwnTask: { vars: '', en: '{{info}} This is your own task. You cannot complete it.', ar: '{{info}} هذه مهمتك الخاصة. لا يمكنك إنجازها.', ru: '{{info}} Это ваше собственное задание. Вы не можете его выполнить.' },
  adFull: { vars: '', en: '{{info}} This task has reached its limit.', ar: '{{info}} وصلت هذه المهمة إلى حدها الأقصى.', ru: '{{info}} Лимит этого задания исчерпан.' },
  adMyTitle: { vars: '%list%', en: '{{tasks}} My orders\n\n%list%', ar: '{{tasks}} طلباتي\n\n%list%', ru: '{{tasks}} Мои заказы\n\n%list%' },
  adMyEmpty: { vars: '', en: '{{info}} You have no orders yet.', ar: '{{info}} ليس لديك طلبات بعد.', ru: '{{info}} У вас пока нет заказов.' },
  adSt: { vars: '', en: 'In review|Live|Completed|Rejected|Stopped', ar: 'قيد المراجعة|نشط|مكتمل|مرفوض|متوقف', ru: 'На проверке|Активно|Завершено|Отклонено|Остановлено' },
  adDepIntro: {
    vars: '%network% %min% %wallet%',
    en: '{{wallet}} Deposit Balance\n\nSend USDT to the address below.\n\n{{info}} Network: %network%\n{{pin}} Minimum deposit: $%min% USDT\n\n{{money}} Address (tap to copy):\n%wallet%\n\n{{warn}} Send only USDT on the network above. Other coins or networks can be lost.\n\nAfter sending, tap "I have paid" and submit your transaction hash.',
    ar: '{{wallet}} إيداع رصيد\n\nأرسل USDT إلى العنوان أدناه.\n\n{{info}} الشبكة: %network%\n{{pin}} الحد الأدنى للإيداع: $%min% USDT\n\n{{money}} العنوان (اضغط للنسخ):\n%wallet%\n\n{{warn}} أرسل USDT فقط على الشبكة أعلاه. العملات أو الشبكات الأخرى قد تضيع.\n\nبعد الإرسال اضغط «لقد دفعت» وأرسل هاش المعاملة.',
    ru: '{{wallet}} Пополнение баланса\n\nОтправьте USDT на адрес ниже.\n\n{{info}} Сеть: %network%\n{{pin}} Минимальный депозит: $%min% USDT\n\n{{money}} Адрес (нажмите, чтобы скопировать):\n%wallet%\n\n{{warn}} Отправляйте только USDT в указанной сети. Другие монеты или сети могут быть потеряны.\n\nПосле отправки нажмите «Я оплатил» и отправьте хэш транзакции.'
  },
  adDepOff: { vars: '', en: '{{warn}} Deposits are temporarily unavailable. Please contact support.', ar: '{{warn}} الإيداع غير متاح مؤقتاً. يرجى التواصل مع الدعم.', ru: '{{warn}} Пополнение временно недоступно. Свяжитесь с поддержкой.' },
  adAskHash: { vars: '', en: '{{lock}} Step 1 of 3 · Transaction hash\n\nSend the transaction hash (TxID) of your payment.', ar: '{{lock}} الخطوة 1 من 3 · هاش المعاملة\n\nأرسل هاش المعاملة (TxID) الخاص بدفعتك.', ru: '{{lock}} Шаг 1 из 3 · Хэш транзакции\n\nОтправьте хэш транзакции (TxID) вашего платежа.' },
  adBadHash: { vars: '', en: '{{warn}} That does not look like a valid transaction hash.', ar: '{{warn}} لا يبدو هذا هاش معاملة صالحاً.', ru: '{{warn}} Это не похоже на корректный хэш транзакции.' },
  adHashUsed: { vars: '', en: '{{stop}} This transaction hash was already submitted.', ar: '{{stop}} تم إرسال هاش هذه المعاملة مسبقاً.', ru: '{{stop}} Этот хэш транзакции уже был отправлен.' },
  adAskFrom: { vars: '', en: '{{wallet}} Step 2 of 3 · Your wallet\n\nSend the wallet address you paid from.', ar: '{{wallet}} الخطوة 2 من 3 · محفظتك\n\nأرسل عنوان المحفظة التي دفعت منها.', ru: '{{wallet}} Шаг 2 из 3 · Ваш кошелёк\n\nОтправьте адрес кошелька, с которого вы оплатили.' },
  adBadFrom: { vars: '', en: '{{warn}} That does not look like a valid wallet address.', ar: '{{warn}} لا يبدو هذا عنوان محفظة صالحاً.', ru: '{{warn}} Это не похоже на корректный адрес кошелька.' },
  adAskAmt: { vars: '%min%', en: '{{money}} Step 3 of 3 · Amount\n\nSend the amount you paid in USDT (minimum $%min%).', ar: '{{money}} الخطوة 3 من 3 · المبلغ\n\nأرسل المبلغ الذي دفعته بـ USDT (الحد الأدنى $%min%).', ru: '{{money}} Шаг 3 из 3 · Сумма\n\nОтправьте сумму платежа в USDT (минимум $%min%).' },
  adBadAmt: { vars: '%min%', en: '{{warn}} Send a valid amount of at least $%min%.', ar: '{{warn}} أرسل مبلغاً صالحاً لا يقل عن $%min%.', ru: '{{warn}} Отправьте корректную сумму не менее $%min%.' },
  adDepSent: { vars: '%id% %amount%', en: '{{done}} Deposit request #%id% submitted!\n\n{{money}} Amount: $%amount% USDT\n\nOur team will verify the transaction and add the balance shortly. You will get a message when it is done.', ar: '{{done}} تم إرسال طلب الإيداع #%id%!\n\n{{money}} المبلغ: $%amount% USDT\n\nسيتحقق فريقنا من المعاملة ويضيف الرصيد قريباً. ستصلك رسالة عند الانتهاء.', ru: '{{done}} Заявка на пополнение #%id% отправлена!\n\n{{money}} Сумма: $%amount% USDT\n\nНаша команда проверит транзакцию и скоро зачислит баланс. Вы получите сообщение.' },
  adDepOk: { vars: '%amount% %balance%', en: '{{done}} Deposit approved! $%amount% USDT was added to your balance.\n\n{{wallet}} New balance: $%balance% USDT\n\nTap Add task to place your order.', ar: '{{done}} تمت الموافقة على الإيداع! أُضيف $%amount% USDT إلى رصيدك.\n\n{{wallet}} الرصيد الجديد: $%balance% USDT\n\nاضغط إضافة مهمة لتقديم طلبك.', ru: '{{done}} Пополнение одобрено! $%amount% USDT зачислено на баланс.\n\n{{wallet}} Новый баланс: $%balance% USDT\n\nНажмите «Добавить задание», чтобы оформить заказ.' },
  adDepNo: { vars: '%id%', en: '{{stop}} Deposit request #%id% could not be verified and was rejected. If you think this is a mistake, please contact support.', ar: '{{stop}} تعذّر التحقق من طلب الإيداع #%id% وتم رفضه. إذا كنت تعتقد أن هذا خطأ، تواصل مع الدعم.', ru: '{{stop}} Заявку на пополнение #%id% не удалось подтвердить, она отклонена. Если это ошибка, свяжитесь с поддержкой.' }
});

// ---------- Helpers ----------
const usd = (n) => String(Number(Number(n).toFixed(4)));
const cfg = () => ({
  enabled: S('ads_enabled') !== 'off',
  auto: S('ad_auto_approve') === 'on',
  minBalance: Number(S('ad_min_balance') ?? 5),
  price: Number(S('ad_price') ?? 0.05),
  reward: Number(S('ad_reward') ?? 0.02),
  minQty: Number(S('ad_min_qty') ?? 50),
  maxQty: Number(S('ad_max_qty') ?? 5000),
  minDeposit: Number(S('dep_min') ?? 5),
  wallet: S('dep_wallet') || '',
  network: S('dep_network') || 'USDT (BEP20)'
});
const tn = (l, type) => t(l, 'adTN').split('|')[{ channel: 0, post: 1, bot: 2 }[type]] || type;
const stName = (l, s) => t(l, 'adSt').split('|')[{ pending: 0, active: 1, finished: 2, rejected: 3, stopped: 4 }[s]] || s;
const total = (c, qty) => Math.round(c.price * qty * 1e6) / 1e6;

async function flow(chat, mid, text, kb) {
  const r = await show(chat, mid, text, kb);
  return (r && r.result && r.result.message_id) || mid;
}

// wallet address tap-to-copy (code entity) soho message
async function codeMsg(chat, mid, text, code, kb) {
  const f = fx(text);
  const i = f.text.indexOf(code);
  const ents = f.entities.slice();
  if (i >= 0) ents.push({ type: 'code', offset: i, length: code.length });
  ents.sort((a, b) => a.offset - b.offset);
  const body = { chat_id: chat, text: f.text, entities: ents, disable_web_page_preview: true, reply_markup: { inline_keyboard: kb } };
  const call = (b) => (mid ? tg('editMessageText', { ...b, message_id: mid }) : tg('sendMessage', b));
  let r = await call(body);
  if (!r.ok && !/not modified/i.test(r.description || '')) {
    const plain = { ...body, entities: i >= 0 ? [{ type: 'code', offset: i, length: code.length }] : [] };
    plain.reply_markup = JSON.parse(JSON.stringify(body.reply_markup, (k, v) => (k === 'icon_custom_emoji_id' ? undefined : v)));
    r = await call(plain);
  }
  return r;
}

const cancelKb = (l) => [[btn(t(l, 'btnCancel'), 'ad:x', 'danger')]];

// ====================== USER SIDE ======================
async function intro(chat, user, mid) {
  const l = user.lang, c = cfg();
  if (!c.enabled) return show(chat, mid, t(l, 'adOff'), []);
  await setState(user.id, null);
  const text = t(l, 'adIntro', { minBalance: usd(c.minBalance), minDeposit: usd(c.minDeposit), price: usd(c.price), minQty: c.minQty, balance: usd(user.balance) });
  return show(chat, mid, text, [[btn(t(l, 'adStartBtn'), 'ad:start', 'success')], [btn(t(l, 'adMyBtn'), 'ad:my')]]);
}

async function gate(chat, user, mid) {
  const l = user.lang, c = cfg(), bal = Number(user.balance);
  const ok = bal >= c.minBalance;
  const rows = [[btn(t(l, 'adNextBtn'), 'ad:n1', ok ? 'success' : 'primary')]];
  if (!ok) rows.push([btn(t(l, 'adDepBtn'), 'ad:dep', 'success')]); // balance kom hole-i deposit button
  rows.push([btn(t(l, 'adBackBtn'), 'ad:home')]);
  return show(chat, mid, t(l, ok ? 'adGateOk' : 'adGateLow', { minBalance: usd(c.minBalance), balance: usd(bal) }), rows);
}

function presets(c) {
  return [...new Set([c.minQty, 100, 250, 500, 1000, 2500].filter((q) => q >= c.minQty && q <= c.maxQty))].sort((a, b) => a - b).slice(0, 6);
}

async function qtyScreen(chat, mid, user, d, err, needDep) {
  const l = user.lang, c = cfg();
  const ps = presets(c), rows = [];
  for (let i = 0; i < ps.length; i += 2) rows.push(ps.slice(i, i + 2).map((q) => btn(`${q} · $${usd(total(c, q))}`, `ad:q:${q}`)));
  if (needDep) rows.push([btn(t(l, 'adDepBtn'), 'ad:dep', 'success')]);
  rows.push([btn(t(l, 'adBackBtn'), 'ad:n1'), btn(t(l, 'btnCancel'), 'ad:x', 'danger')]);
  const text = (err ? err + '\n\n' : '') + t(l, 'adPickQty', { min: c.minQty, max: c.maxQty, price: usd(c.price), balance: usd(user.balance) });
  const newMid = await flow(chat, mid, text, rows);
  await setState(user.id, 'ad_qty', { ...d, mid: newMid });
}

async function review(chat, mid, user, d) {
  const l = user.lang, c = cfg(), tot = total(c, d.qty), bal = Number(user.balance);
  const text = t(l, 'adReview', { type: tn(l, d.type), title: d.title, link: d.link, qty: d.qty, price: usd(c.price), total: usd(tot), balance: usd(bal), after: usd(bal - tot) });
  const newMid = await flow(chat, mid, text, [[btn(t(l, 'adConfirmBtn'), 'ad:ok', 'success')], [btn(t(l, 'adBackBtn'), 'ad:qb'), btn(t(l, 'btnCancel'), 'ad:x', 'danger')]]);
  await setState(user.id, 'ad_review', { ...d, mid: newMid });
}

async function depScreen(chat, user, mid) {
  const l = user.lang, c = cfg();
  await setState(user.id, null);
  if (!c.wallet) return show(chat, mid, t(l, 'adDepOff'), [[btn(t(l, 'adBackBtn'), 'ad:start')]]);
  const text = t(l, 'adDepIntro', { network: c.network, min: usd(c.minDeposit), wallet: c.wallet });
  return codeMsg(chat, mid, text, c.wallet, [[btn(t(l, 'adPaidBtn'), 'ad:paid', 'success')], [btn(t(l, 'adBackBtn'), 'ad:start')]]);
}

async function myOrders(chat, user, mid) {
  const l = user.lang;
  const { data } = await sb.from('tasks').select('id,title,status,completions,max_completions').eq('owner_id', user.id).order('id', { ascending: false }).limit(10);
  const list = (data || []).map((tk) => `#${tk.id} ${cleanTitle(tk.title)}\n   ${stName(l, tk.status)} · ${tk.completions}/${tk.max_completions}`).join('\n\n');
  return show(chat, mid, data && data.length ? t(l, 'adMyTitle', { list }) : t(l, 'adMyEmpty'), [[btn(t(l, 'adBackBtn'), 'ad:home')]]);
}

const orderText = (tk) =>
  `{{rocket}} Order #${tk.id}\n{{profile}} Owner: ${tk.owner_id}\nType: ${tk.type}\nTitle: ${tk.title}\nLink: ${tk.link}\nChannel: ${tk.chat_id || '-'}\nCompletions: ${tk.completions}/${tk.max_completions}\nPrice: $${usd(tk.unit_price)} · Worker reward: $${usd(tk.reward)}\nEscrow: $${usd(tk.unit_price * tk.max_completions)}\nStatus: ${tk.status}`;
const orderRow = (id, hasChan) => [
  [btn('{{verified}} Approve', `a:oda:${id}`, 'success'), btn('{{cancel}} Reject (refund)', `a:odr:${id}`, 'danger')],
  ...(hasChan ? [[btn('🧪 Test channel access', `a:odt:${id}`)]] : [])
];

async function notifyAdminsOrder(id) {
  const { data: tk } = await sb.from('tasks').select('*').eq('id', id).single();
  for (const a of ADMINS) await send(a, '{{bell}} New order to review\n\n' + orderText(tk), { reply_markup: { inline_keyboard: orderRow(id, !!tk.chat_id) } });
}

async function notifyOwner(uid, key, vars) {
  const { data: u } = await sb.from('users').select('lang').eq('id', uid).single();
  return send(uid, t((u && u.lang) || 'en', key, vars));
}

async function finished(tk) {
  await notifyOwner(tk.owner_id, 'adFinished', { id: tk.id, title: cleanTitle(tk.title) });
}

async function cb(q, user, d) {
  const chat = q.message.chat.id, mid = q.message.message_id, l = user.lang, c = cfg();
  const A = (text) => ack(q.id, text);
  const [a, p] = d.split(':');

  if (!c.enabled && a !== 'home') { await A(); return show(chat, mid, t(l, 'adOff'), []); }

  switch (a) {
    case 'home': await A(); return intro(chat, user, mid);
    case 'my': await A(); return myOrders(chat, user, mid);
    case 'x': await A(); await setState(user.id, null); return show(chat, mid, t(l, 'cancelled'), [[btn(t(l, 'adBackBtn'), 'ad:home')]]);
    case 'start': await A(); await setState(user.id, null); return gate(chat, user, mid);
    case 'dep': await A(); return depScreen(chat, user, mid);
    case 'n1': {
      const need = c.minBalance - Number(user.balance);
      if (need > 1e-9) return A(t(l, 'adLowAlert', { x: usd(need) })); // jete parbe na
      await A();
      await setState(user.id, null);
      return show(chat, mid, t(l, 'adPickType'), [
        [btn(t(l, 'adTChannel'), 'ad:ty:channel')], [btn(t(l, 'adTLink'), 'ad:ty:post')], [btn(t(l, 'adTBot'), 'ad:ty:bot')],
        [btn(t(l, 'adBackBtn'), 'ad:start')]]);
    }
    case 'ty': {
      await A();
      if (!['channel', 'post', 'bot'].includes(p)) return;
      await setState(user.id, 'ad_link', { type: p, mid });
      return show(chat, mid, linkPrompt(l, p), cancelKb(l));
    }
    case 'q': {
      const d0 = user.state_data || {}, qty = Number(p);
      if (user.state !== 'ad_qty' || !d0.title || !(qty >= c.minQty && qty <= c.maxQty)) { await A(); return intro(chat, user, mid); }
      const need = total(c, qty) - Number(user.balance);
      if (need > 1e-9) { await A(t(l, 'adLowAlert', { x: usd(need) })); return qtyScreen(chat, mid, user, d0, null, true); }
      await A();
      return review(chat, mid, user, { ...d0, qty });
    }
    case 'qb': {
      await A();
      const d0 = user.state_data || {};
      if (!d0.title) return intro(chat, user, mid);
      return qtyScreen(chat, mid, user, d0, null, false);
    }
    case 'ok': {
      const d0 = user.state_data || {};
      if (user.state !== 'ad_review' || !d0.qty) { await A(); return intro(chat, user, mid); }
      const tot = total(c, d0.qty), need = tot - Number(user.balance);
      if (need > 1e-9) { await A(t(l, 'adLowAlert', { x: usd(need) })); return qtyScreen(chat, mid, user, d0, null, true); }
      await setState(user.id, null); // double tap theke bachano
      const { data: tid, error } = await sb.rpc('place_ad_order', {
        uid: user.id, p_type: d0.type, p_title: d0.title, p_link: d0.link, p_chat: d0.chat || null,
        p_reward: Math.min(c.reward, c.price), p_price: c.price, p_qty: d0.qty
      });
      if (error || !tid) { await A(t(l, 'adLowAlert', { x: usd(tot) })); return intro(chat, user, mid); }
      await A();
      if (c.auto) {
        await sb.rpc('resolve_order', { tid, approve: true });
        return show(chat, mid, t(l, 'adApproved', { id: tid, title: d0.title }), [[btn(t(l, 'adMyBtn'), 'ad:my')]]);
      }
      await show(chat, mid, t(l, 'adPlaced', { id: tid }), [[btn(t(l, 'adMyBtn'), 'ad:my')]]);
      return notifyAdminsOrder(tid);
    }
    case 'paid': {
      await A();
      if (!c.wallet) return depScreen(chat, user, mid);
      await setState(user.id, 'ad_hash', { mid });
      return show(chat, mid, t(l, 'adAskHash'), cancelKb(l));
    }
    default: return A();
  }
}

function linkPrompt(l, type) {
  const ex = type === 'channel' ? 'https://t.me/yourchannel' : type === 'bot' ? 'https://t.me/yourbot' : 'https://example.com';
  return t(l, 'adAskLink', { example: ex, extra: type === 'channel' ? '\n\n' + t(l, 'adChanNote', { bot: BOT_USERNAME }) : '' });
}

async function input(m, user) {
  const chat = m.chat.id, l = user.lang, c = cfg(), d = user.state_data || {}, mid = d.mid;
  const text = (m.text || '').trim();
  const kill = () => tg('deleteMessage', { chat_id: chat, message_id: m.message_id });
  const retry = async (prompt, errKey, vars) => { await kill(); return flow(chat, mid, t(l, errKey, vars) + '\n\n' + prompt, cancelKb(l)); };

  switch (user.state) {
    case 'ad_link': {
      let chatId = null;
      if (d.type === 'channel') {
        const mm = text.match(/^https?:\/\/t\.me\/([A-Za-z][A-Za-z0-9_]{3,31})\/?$/i);
        if (!mm) return retry(linkPrompt(l, d.type), 'adBadLink');
        chatId = '@' + mm[1];
      } else if (!/^https?:\/\/\S+$/i.test(text) || text.length > 300) return retry(linkPrompt(l, d.type), 'adBadLink');
      await kill();
      const nm = await flow(chat, mid, t(l, 'adAskTitle'), cancelKb(l));
      return setState(user.id, 'ad_title', { ...d, link: text, chat: chatId, mid: nm });
    }
    case 'ad_title': {
      if (text.length < 3 || text.length > 40) return retry(t(l, 'adAskTitle'), 'adBadTitle');
      await kill();
      return qtyScreen(chat, mid, user, { ...d, title: text }, null, false);
    }
    case 'ad_qty': {
      const qty = Number(text);
      await kill();
      if (!Number.isInteger(qty) || qty < c.minQty || qty > c.maxQty) return qtyScreen(chat, mid, user, d, t(l, 'adBadQty', { min: c.minQty, max: c.maxQty }), false);
      const need = total(c, qty) - Number(user.balance);
      if (need > 1e-9) return qtyScreen(chat, mid, user, d, t(l, 'adLowAlert', { x: usd(need) }), true);
      return review(chat, mid, user, { ...d, qty });
    }
    case 'ad_hash': {
      if (!/^(0x)?[A-Za-z0-9]{20,100}$/.test(text)) return retry(t(l, 'adAskHash'), 'adBadHash');
      const { data: ex } = await sb.from('deposits').select('id').ilike('tx_hash', text).maybeSingle();
      if (ex) return retry(t(l, 'adAskHash'), 'adHashUsed');
      await kill();
      const nm = await flow(chat, mid, t(l, 'adAskFrom'), cancelKb(l));
      return setState(user.id, 'ad_from', { ...d, hash: text, mid: nm });
    }
    case 'ad_from': {
      if (!/^[A-Za-z0-9]{25,100}$/.test(text)) return retry(t(l, 'adAskFrom'), 'adBadFrom');
      await kill();
      const nm = await flow(chat, mid, t(l, 'adAskAmt', { min: usd(c.minDeposit) }), cancelKb(l));
      return setState(user.id, 'ad_amt', { ...d, from: text, mid: nm });
    }
    case 'ad_amt': {
      const amt = Number(text.replace(',', '.'));
      if (!isFinite(amt) || amt < c.minDeposit) return retry(t(l, 'adAskAmt', { min: usd(c.minDeposit) }), 'adBadAmt', { min: usd(c.minDeposit) });
      await kill();
      const { data: dep, error } = await sb.from('deposits').insert({ user_id: user.id, tx_hash: d.hash, from_wallet: d.from, amount: amt, network: c.network }).select().single();
      await setState(user.id, null);
      if (error || !dep) return show(chat, mid, t(l, error && error.code === '23505' ? 'adHashUsed' : 'adDepOff'), [[btn(t(l, 'adBackBtn'), 'ad:start')]]);
      await show(chat, mid, t(l, 'adDepSent', { id: dep.id, amount: usd(amt) }), [[btn(t(l, 'adBackBtn'), 'ad:home')]]);
      for (const a of ADMINS) await send(a, depText(dep, user), { reply_markup: { inline_keyboard: depRow(dep.id) } });
      return;
    }
  }
}

const depText = (d, u) =>
  `{{bell}} Deposit #${d.id}\n{{profile}} User: ${d.user_id}${u && u.username ? ' @' + u.username : ''}\n{{money}} Claimed: $${usd(d.amount)} USDT\nNetwork: ${d.network || '-'}\nTx hash: ${d.tx_hash}\nFrom wallet: ${d.from_wallet}\n\nVerify the transaction on the block explorer, then approve.`;
const depRow = (id) => [
  [btn('{{verified}} Approve', `a:dpa:${id}`, 'success'), btn('✏️ Edit amount', `a:dpe:${id}`)],
  [btn('{{cancel}} Reject', `a:dpr:${id}`, 'danger')]
];

// ====================== ADMIN SIDE ======================
function stamp(q, status) {
  const base = q.message.text || '';
  const f = fx(`\n\n${status}`);
  const ents = [...(q.message.entities || []), ...f.entities.map((e) => ({ ...e, offset: e.offset + base.length }))];
  return editRaw(q.message.chat.id, q.message.message_id, base + f.text, ents);
}

async function settleDeposit(id, approve, amt) {
  const { data } = await sb.rpc('resolve_deposit', { did: id, approve, amt });
  if (!data || !data.length) return null;
  const r = data[0];
  const { data: u } = await sb.from('users').select('lang,balance').eq('id', r.r_uid).single();
  const l = (u && u.lang) || 'en';
  if (approve) await send(r.r_uid, t(l, 'adDepOk', { amount: usd(r.r_amt), balance: usd(u.balance) }), { reply_markup: { inline_keyboard: [[btn(t(l, 'adStartBtn'), 'ad:start', 'success')]] } });
  else await send(r.r_uid, t(l, 'adDepNo', { id }));
  return r;
}

async function adminCb(q, user, sec, a1) {
  const c = q.message.chat.id, mid = q.message.message_id, id = Number(a1);
  const back = [btn('⬅️ Back', 'a:home')];
  switch (sec) {
    // ----- Deposits -----
    case 'dp': {
      const p = await countOf(sb.from('deposits').select('id', { count: 'exact', head: true }).eq('status', 'pending'));
      return show(c, mid, `{{wallet}} Deposits\n\nPending: ${p}\nWallet: ${S('dep_wallet') ? 'set' : 'NOT SET (Settings → Add Task & Deposit)'}`, [[btn(`{{time}} Pending (${p})`, 'a:dpp', 'success')], [btn('{{pin}} History', 'a:dph')], back]);
    }
    case 'dpp': {
      const { data } = await sb.from('deposits').select('*').eq('status', 'pending').order('id').limit(10);
      if (!data || !data.length) return send(c, '{{done}} No pending deposits.');
      for (const d of data) await send(c, depText(d), { reply_markup: { inline_keyboard: depRow(d.id) } });
      return;
    }
    case 'dph': {
      const { data } = await sb.from('deposits').select('*').order('id', { ascending: false }).limit(15);
      const ic = { pending: '{{time}}', approved: '{{done}}', rejected: '{{cancel}}' };
      const txt = (data || []).map((d) => `${ic[d.status]} #${d.id} · ${d.user_id} · $${usd(d.credited ?? d.amount)}`).join('\n') || 'Nothing yet.';
      return show(c, mid, `{{pin}} Last deposits\n\n${txt}`, [[btn('⬅️ Back', 'a:dp')]]);
    }
    case 'dpa': {
      const { data: dep } = await sb.from('deposits').select('amount').eq('id', id).single();
      const r = await settleDeposit(id, true, Number(dep.amount));
      return r ? stamp(q, `{{verified}} APPROVED · $${usd(r.r_amt)} credited`) : send(c, `Deposit #${id} already processed.`);
    }
    case 'dpr': {
      const r = await settleDeposit(id, false, 0);
      return r ? stamp(q, '{{cancel}} REJECTED') : send(c, `Deposit #${id} already processed.`);
    }
    case 'dpe':
      await setState(user.id, 'a_dp_amt', { id });
      return send(c, `✏️ Send the amount (USDT) to credit for deposit #${id}.`, { reply_markup: { inline_keyboard: [[btn('{{cancel}} Cancel', 'a:x', 'danger')]] } });

    // ----- Orders -----
    case 'od': {
      const p = await countOf(sb.from('tasks').select('id', { count: 'exact', head: true }).not('owner_id', 'is', null).eq('status', 'pending'));
      const act = await countOf(sb.from('tasks').select('id', { count: 'exact', head: true }).not('owner_id', 'is', null).eq('status', 'active'));
      return show(c, mid, `{{rocket}} User orders\n\nPending review: ${p}\nLive: ${act}`, [[btn(`{{time}} Pending (${p})`, 'a:odp', 'success')], [btn(`{{live}} Live (${act})`, 'a:odl')], back]);
    }
    case 'odp': {
      const { data } = await sb.from('tasks').select('*').not('owner_id', 'is', null).eq('status', 'pending').order('id').limit(10);
      if (!data || !data.length) return send(c, '{{done}} No orders waiting for review.');
      for (const tk of data) await send(c, orderText(tk), { reply_markup: { inline_keyboard: orderRow(tk.id, !!tk.chat_id) } });
      return;
    }
    case 'odl': {
      const { data } = await sb.from('tasks').select('id,title,completions,max_completions').not('owner_id', 'is', null).eq('status', 'active').order('id', { ascending: false }).limit(20);
      const rows = (data || []).map((tk) => [btn(`{{rocket}} #${tk.id} ${cleanTitle(tk.title).slice(0, 24)} ${tk.completions}/${tk.max_completions}`, `a:odc:${tk.id}`)]);
      rows.push([btn('⬅️ Back', 'a:od')]);
      return show(c, mid, `{{live}} Live orders (${(data || []).length})`, rows);
    }
    case 'odc': {
      const { data: tk } = await sb.from('tasks').select('*').eq('id', id).maybeSingle();
      if (!tk) return show(c, mid, '{{warn}} Not found', [[btn('⬅️ Back', 'a:od')]]);
      const left = Math.max(tk.max_completions - tk.completions, 0);
      return show(c, mid, orderText(tk) + `\nRemaining escrow: $${usd(left * tk.unit_price)}`, [
        ...(tk.status === 'active' ? [[btn('⏹ Stop & refund remaining', `a:ods:${id}`, 'danger')]] : []),
        ...(tk.chat_id ? [[btn('🧪 Test channel access', `a:odt:${id}`)]] : []),
        [btn('⬅️ Back', 'a:odl')]]);
    }
    case 'oda': case 'odr': {
      const approve = sec === 'oda';
      const { data } = await sb.rpc('resolve_order', { tid: id, approve });
      if (!data || !data.length) return send(c, `Order #${id} already processed.`);
      const { data: tk } = await sb.from('tasks').select('title').eq('id', id).single();
      const title = cleanTitle(tk.title);
      if (approve) await notifyOwner(data[0].r_owner, 'adApproved', { id, title });
      else await notifyOwner(data[0].r_owner, 'adRejected', { id, title, refund: usd(data[0].r_refund) });
      return stamp(q, approve ? '{{verified}} APPROVED · live' : `{{cancel}} REJECTED · refunded $${usd(data[0].r_refund)}`);
    }
    case 'ods': {
      const { data } = await sb.rpc('stop_order', { tid: id });
      if (!data || !data.length) return send(c, `Order #${id} cannot be stopped (not live).`);
      const { data: tk } = await sb.from('tasks').select('title').eq('id', id).single();
      await notifyOwner(data[0].r_owner, 'adStopped', { id, title: cleanTitle(tk.title), refund: usd(data[0].r_refund) });
      return send(c, `{{done}} Order #${id} stopped. $${usd(data[0].r_refund)} refunded to the owner.`);
    }
    case 'odt': {
      const { data: tk } = await sb.from('tasks').select('chat_id').eq('id', id).single();
      if (!tk || !tk.chat_id) return send(c, '{{warn}} This order has no channel to verify (link-click task).');
      const me = await tg('getMe');
      const r = await tg('getChatMember', { chat_id: tk.chat_id, user_id: me.result.id });
      const good = r.ok && ['administrator', 'creator'].includes(r.result.status);
      return send(c, good ? `{{done}} OK. Bot is admin in ${tk.chat_id}. Join verification will work.` : `{{warn}} Problem: ${r.ok ? `bot is only "${r.result.status}" there. The owner must make the bot ADMIN.` : r.description}`);
    }
  }
}

async function adminInput(m, user) {
  const c = m.chat.id, d = user.state_data || {};
  if (user.state !== 'a_dp_amt') return;
  const amt = Number(String(m.text || '').replace(',', '.'));
  if (!isFinite(amt) || amt <= 0) return send(c, '{{warn}} Send a valid amount.');
  await setState(user.id, null);
  const r = await settleDeposit(d.id, true, amt);
  return send(c, r ? `{{done}} Deposit #${d.id} approved. $${usd(amt)} credited.` : `{{warn}} Deposit #${d.id} was already processed.`);
}

module.exports = { intro, cb, input, adminCb, adminInput, finished };
