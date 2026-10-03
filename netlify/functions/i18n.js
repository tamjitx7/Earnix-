const NAMES = { ar: 'العربية', ru: 'Русский', en: 'English' };

// Placeholder: %name%  |  Emoji: {{money}}
const T = {
  btn_bal: { vars: '', en: '{{wallet}} Balance', ar: '{{wallet}} الرصيد', ru: '{{wallet}} Баланс' },
  btn_tasks: { vars: '', en: '{{tasks}} Tasks', ar: '{{tasks}} المهام', ru: '{{tasks}} Задания' },
  btn_ref: { vars: '', en: '{{follow}} Referral', ar: '{{follow}} الإحالة', ru: '{{follow}} Рефералы' },
  btn_sup: { vars: '', en: '{{support}} Support', ar: '{{support}} الدعم', ru: '{{support}} Поддержка' },
  btn_lang: { vars: '', en: '{{lang}} Language', ar: '{{lang}} اللغة', ru: '{{lang}} Язык' },
  chooseLang: { vars: '', en: '{{lang}} Choose your language', ar: '{{lang}} اختر لغتك', ru: '{{lang}} Выберите язык' },
  welcome: {
    vars: '%name%',
    en: '{{rocket}} Welcome to Earnix, %name%!\n\n{{money}} Complete simple tasks and earn real USDT rewards.\n{{follow}} Invite friends and get paid for every valid referral.\n{{wallet}} Withdraw your balance to Binance in just a few taps.\n\n{{fire}} Choose an option below to get started.',
    ar: '{{rocket}} أهلاً بك في Earnix يا %name%!\n\n{{money}} أكمل مهام بسيطة واربح مكافآت USDT حقيقية.\n{{follow}} ادعُ أصدقاءك واربح عن كل إحالة صالحة.\n{{wallet}} اسحب رصيدك إلى Binance ببضع نقرات.\n\n{{fire}} اختر من القائمة أدناه للبدء.',
    ru: '{{rocket}} Добро пожаловать в Earnix, %name%!\n\n{{money}} Выполняйте простые задания и получайте реальные награды в USDT.\n{{follow}} Приглашайте друзей и получайте оплату за каждого активного реферала.\n{{wallet}} Выводите баланс на Binance в несколько касаний.\n\n{{fire}} Выберите пункт ниже, чтобы начать.'
  },
  gateTitle: {
    vars: '%name%',
    en: '{{lock}} One last step, %name%!\n\nJoin all the channels below, then tap Continue to unlock the bot.\n\n{{warn}} You must stay joined to keep using Earnix.',
    ar: '{{lock}} خطوة أخيرة يا %name%!\n\nانضم إلى جميع القنوات أدناه ثم اضغط متابعة لفتح البوت.\n\n{{warn}} يجب أن تبقى منضماً لتستمر في استخدام Earnix.',
    ru: '{{lock}} Последний шаг, %name%!\n\nВступите во все каналы ниже и нажмите «Продолжить», чтобы открыть бота.\n\n{{warn}} Чтобы пользоваться Earnix, нужно оставаться подписанным.'
  },
  gateContinue: { vars: '', en: '{{verified}} Continue', ar: '{{verified}} متابعة', ru: '{{verified}} Продолжить' },
  gateMissing: { vars: '%list%', en: '{{warn}} Please join first: %list%', ar: '{{warn}} انضم أولاً إلى: %list%', ru: '{{warn}} Сначала вступите: %list%' },
  gateOk: { vars: '', en: '{{done}} Verified! Welcome aboard.', ar: '{{done}} تم التحقق! أهلاً بك.', ru: '{{done}} Проверка пройдена! Добро пожаловать.' },
  bal: {
    vars: '%balance% %earned% %withdrawn%',
    en: '{{wallet}} Your Balance\n\n{{money}} Current balance: $%balance% USDT\n{{uptrend}} Total earned: $%earned% USDT\n{{verified}} Total withdrawn: $%withdrawn% USDT',
    ar: '{{wallet}} رصيدك\n\n{{money}} الرصيد الحالي: $%balance% USDT\n{{uptrend}} إجمالي الأرباح: $%earned% USDT\n{{verified}} إجمالي السحوبات: $%withdrawn% USDT',
    ru: '{{wallet}} Ваш баланс\n\n{{money}} Текущий баланс: $%balance% USDT\n{{uptrend}} Всего заработано: $%earned% USDT\n{{verified}} Всего выведено: $%withdrawn% USDT'
  },
  withdraw: { vars: '', en: '{{wallet}} Withdraw', ar: '{{wallet}} سحب', ru: '{{wallet}} Вывести' },
  insufficient: {
    vars: '%balance% %min%',
    en: '{{warn}} Insufficient balance.\n\n{{money}} Available balance: $%balance% USDT\n{{pin}} Minimum withdrawal: $%min% USDT',
    ar: '{{warn}} الرصيد غير كافٍ.\n\n{{money}} الرصيد المتاح: $%balance% USDT\n{{pin}} الحد الأدنى للسحب: $%min% USDT',
    ru: '{{warn}} Недостаточно средств.\n\n{{money}} Доступный баланс: $%balance% USDT\n{{pin}} Минимальный вывод: $%min% USDT'
  },
  verifyNeeded: { vars: '', en: '{{lock}} Device Verification is required before withdrawing.\nTap the button below.', ar: '{{lock}} التحقق من الجهاز مطلوب قبل السحب.\nاضغط على الزر أدناه.', ru: '{{lock}} Перед выводом нужна проверка устройства.\nНажмите кнопку ниже.' },
  verifyBtn: { vars: '', en: '{{lock}} Verify Device', ar: '{{lock}} تحقق من الجهاز', ru: '{{lock}} Проверить устройство' },
  verifyFail: { vars: '', en: '{{stop}} Verification failed. This device appears to be linked to another account.', ar: '{{stop}} فشل التحقق. يبدو أن هذا الجهاز مرتبط بحساب آخر.', ru: '{{stop}} Проверка не пройдена. Похоже, это устройство привязано к другому аккаунту.' },
  verifyOk: { vars: '', en: '{{verified}} Device verified.', ar: '{{verified}} تم التحقق من الجهاز.', ru: '{{verified}} Устройство подтверждено.' },
  sendUid: {
    vars: '',
    en: '{{binance}} Binance UID Withdrawal\n\nPlease send your Binance UID.\n\nExample:\n\n1234567890',
    ar: '{{binance}} السحب عبر Binance UID\n\nأرسل معرّف Binance UID الخاص بك.\n\nمثال:\n\n1234567890',
    ru: '{{binance}} Вывод на Binance UID\n\nОтправьте ваш Binance UID.\n\nПример:\n\n1234567890'
  },
  badUid: { vars: '', en: '{{warn}} Invalid UID. Send numbers only.', ar: '{{warn}} معرّف غير صالح. أرسل أرقاماً فقط.', ru: '{{warn}} Неверный UID. Отправьте только цифры.' },
  sendAmount: {
    vars: '%min% %max%',
    en: '{{money}} Send the amount of USDT to withdraw.\nMin: $%min% | Max: $%max%',
    ar: '{{money}} أرسل مبلغ USDT المراد سحبه.\nالأدنى: $%min% | الأقصى: $%max%',
    ru: '{{money}} Отправьте сумму USDT для вывода.\nМин: $%min% | Макс: $%max%'
  },
  badAmount: { vars: '', en: '{{warn}} Invalid amount (check min/max and your balance).', ar: '{{warn}} مبلغ غير صالح (تحقق من الحدود ورصيدك).', ru: '{{warn}} Неверная сумма (проверьте лимиты и баланс).' },
  confirm: {
    vars: '%uid% %amount%',
    en: '{{info}} Withdrawal Confirmation\n\nMethod: {{binance}} Binance UID\nUID: %uid%\nAmount: $%amount% USDT\n\nConfirm your request?',
    ar: '{{info}} تأكيد السحب\n\nالطريقة: {{binance}} Binance UID\nUID: %uid%\nالمبلغ: $%amount% USDT\n\nهل تؤكد طلبك؟',
    ru: '{{info}} Подтверждение вывода\n\nМетод: {{binance}} Binance UID\nUID: %uid%\nСумма: $%amount% USDT\n\nПодтвердить запрос?'
  },
  btnConfirm: { vars: '', en: '{{verified}} Confirm', ar: '{{verified}} تأكيد', ru: '{{verified}} Подтвердить' },
  btnCancel: { vars: '', en: '{{cancel}} Cancel', ar: '{{cancel}} إلغاء', ru: '{{cancel}} Отмена' },
  submitted: { vars: '', en: '{{done}} Withdrawal request submitted. It will be processed soon.', ar: '{{done}} تم إرسال طلب السحب. ستتم معالجته قريباً.', ru: '{{done}} Заявка на вывод отправлена. Она будет обработана в ближайшее время.' },
  cancelled: { vars: '', en: '{{cancel}} Cancelled.', ar: '{{cancel}} تم الإلغاء.', ru: '{{cancel}} Отменено.' },
  approved: { vars: '%amount%', en: '{{done}} Your withdrawal of $%amount% USDT was approved.', ar: '{{done}} تمت الموافقة على سحبك بمبلغ $%amount% USDT.', ru: '{{done}} Ваш вывод на $%amount% USDT одобрен.' },
  rejected: { vars: '%amount%', en: '{{stop}} Your withdrawal of $%amount% USDT was rejected. The amount was returned to your balance.', ar: '{{stop}} تم رفض سحبك بمبلغ $%amount% USDT. أُعيد المبلغ إلى رصيدك.', ru: '{{stop}} Ваш вывод на $%amount% USDT отклонён. Сумма возвращена на баланс.' },
  cooldown: {
    vars: '%time% %hours%',
    en: '{{time}} Please wait before your next withdrawal.\n\nYou can withdraw again in %time%.\n{{info}} Limit: one withdrawal every %hours% hours.',
    ar: '{{time}} يرجى الانتظار قبل السحب التالي.\n\nيمكنك السحب مجدداً بعد %time%.\n{{info}} الحد: سحب واحد كل %hours% ساعات.',
    ru: '{{time}} Подождите до следующего вывода.\n\nВы сможете вывести снова через %time%.\n{{info}} Лимит: один вывод раз в %hours% ч.'
  },
  wdOff: { vars: '', en: '{{stop}} Withdrawals are temporarily disabled.', ar: '{{stop}} السحب متوقف مؤقتاً.', ru: '{{stop}} Вывод временно отключён.' },
  maint: { vars: '', en: '{{warn}} The bot is under maintenance. Please try again later.', ar: '{{warn}} البوت قيد الصيانة. حاول مرة أخرى لاحقاً.', ru: '{{warn}} Бот на техническом обслуживании. Попробуйте позже.' },
  tasksTitle: {
    vars: '%total% %done% %remaining% %earned% %next%',
    en: '{{tasks}} Available Tasks\n\n{{pin}} Total tasks: %total%\n{{verified}} Completed: %done%\n{{time}} Remaining: %remaining%\n{{money}} Earned from tasks: $%earned% USDT%next%',
    ar: '{{tasks}} المهام المتاحة\n\n{{pin}} إجمالي المهام: %total%\n{{verified}} المكتملة: %done%\n{{time}} المتبقية: %remaining%\n{{money}} الأرباح من المهام: $%earned% USDT%next%',
    ru: '{{tasks}} Доступные задания\n\n{{pin}} Всего заданий: %total%\n{{verified}} Выполнено: %done%\n{{time}} Осталось: %remaining%\n{{money}} Заработано на заданиях: $%earned% USDT%next%'
  },
  tasksNext: { vars: '%time%', en: '{{time}} Next reset in: %time%', ar: '{{time}} إعادة التعيين بعد: %time%', ru: '{{time}} Следующий сброс через: %time%' },
  tasksNone: { vars: '', en: '{{done}} You completed everything for now. New tasks unlock after the reset!', ar: '{{done}} أكملت كل شيء حالياً. ستظهر مهام جديدة بعد إعادة التعيين!', ru: '{{done}} Пока всё выполнено. Новые задания появятся после сброса!' },
  noTasks: { vars: '', en: '{{soon}} No tasks available right now.', ar: '{{soon}} لا توجد مهام حالياً.', ru: '{{soon}} Сейчас нет заданий.' },
  check: { vars: '', en: '{{verified}} Check', ar: '{{verified}} تحقق', ru: '{{verified}} Проверить' },
  done: { vars: '%reward%', en: '{{verified}} Task completed! +$%reward%', ar: '{{verified}} اكتملت المهمة! +$%reward%', ru: '{{verified}} Задание выполнено! +$%reward%' },
  already: { vars: '', en: '{{info}} You already completed this task.', ar: '{{info}} لقد أكملت هذه المهمة مسبقاً.', ru: '{{info}} Вы уже выполнили это задание.' },
  wait: { vars: '%time%', en: '{{time}} You can do this task again in %time%.', ar: '{{time}} يمكنك تنفيذ هذه المهمة مجدداً بعد %time%.', ru: '{{time}} Это задание снова будет доступно через %time%.' },
  notJoined: { vars: '', en: '{{warn}} You have not completed this task yet.', ar: '{{warn}} لم تكمل هذه المهمة بعد.', ru: '{{warn}} Вы ещё не выполнили это задание.' },
  ref: {
    vars: '%reward% %total% %valid% %pending% %refEarned% %link%',
    en: '{{follow}} Referral Program\n\n{{money}} Reward per valid referral: $%reward% USDT\n{{profile}} Total invited: %total%\n{{verified}} Valid referrals: %valid%\n{{time}} Pending: %pending%\n{{uptrend}} Earned from referrals: $%refEarned% USDT\n\n{{pin}} Your link:\n%link%\n\n{{info}} A referral becomes valid after your friend joins all required channels.',
    ar: '{{follow}} برنامج الإحالة\n\n{{money}} المكافأة لكل إحالة صالحة: $%reward% USDT\n{{profile}} إجمالي المدعوين: %total%\n{{verified}} الإحالات الصالحة: %valid%\n{{time}} قيد الانتظار: %pending%\n{{uptrend}} الأرباح من الإحالات: $%refEarned% USDT\n\n{{pin}} رابطك:\n%link%\n\n{{info}} تصبح الإحالة صالحة بعد انضمام صديقك إلى جميع القنوات المطلوبة.',
    ru: '{{follow}} Реферальная программа\n\n{{money}} Награда за активного реферала: $%reward% USDT\n{{profile}} Всего приглашено: %total%\n{{verified}} Активные рефералы: %valid%\n{{time}} В ожидании: %pending%\n{{uptrend}} Заработано на рефералах: $%refEarned% USDT\n\n{{pin}} Ваша ссылка:\n%link%\n\n{{info}} Реферал считается активным, когда друг вступит во все обязательные каналы.'
  },
  refShareBtn: { vars: '', en: '{{announce}} Share link', ar: '{{announce}} مشاركة الرابط', ru: '{{announce}} Поделиться ссылкой' },
  refShareText: { vars: '', en: 'Join Earnix, complete tasks and earn USDT!', ar: 'انضم إلى Earnix، أكمل المهام واربح USDT!', ru: 'Присоединяйся к Earnix, выполняй задания и зарабатывай USDT!' },
  sup: { vars: '', en: '{{support}} Need help?\n\nOur support team is here for you. Tap the button below to contact us.', ar: '{{support}} هل تحتاج مساعدة؟\n\nفريق الدعم جاهز لخدمتك. اضغط على الزر أدناه للتواصل معنا.', ru: '{{support}} Нужна помощь?\n\nНаша поддержка всегда на связи. Нажмите кнопку ниже, чтобы написать нам.' },
  supBtn: { vars: '', en: '{{chat}} Contact Support', ar: '{{chat}} تواصل مع الدعم', ru: '{{chat}} Связаться с поддержкой' },
  banned: { vars: '', en: '{{stop}} Your account is banned.', ar: '{{stop}} حسابك محظور.', ru: '{{stop}} Ваш аккаунт заблокирован.' },
  spamWarn: {
    vars: '',
    en: '{{warn}} Warning!\n\nPlease use the menu buttons only. Repeated spam will lead to temporary restrictions and then a ban.',
    ar: '{{warn}} تحذير!\n\nيرجى استخدام أزرار القائمة فقط. التكرار سيؤدي إلى تقييد مؤقت ثم حظر.',
    ru: '{{warn}} Предупреждение!\n\nПользуйтесь только кнопками меню. Повторный спам приведёт к временным ограничениям, а затем к бану.'
  },
  spamMute: { vars: '%time%', en: '{{stop}} You are restricted for %time% because of spam.', ar: '{{stop}} تم تقييدك لمدة %time% بسبب الإزعاج.', ru: '{{stop}} Вы ограничены на %time% из-за спама.' },
  spamBan: { vars: '', en: '{{stop}} You have been banned for repeated spam.', ar: '{{stop}} تم حظرك بسبب تكرار الإزعاج.', ru: '{{stop}} Вы заблокированы за повторный спам.' },
  muted: { vars: '%time%', en: '{{time}} You are restricted. Try again in %time%.', ar: '{{time}} أنت مقيّد. حاول بعد %time%.', ru: '{{time}} Вы ограничены. Повторите через %time%.' },
  promoUsage: { vars: '', en: '{{gift}} Send: /promo YOURCODE', ar: '{{gift}} أرسل: /promo الكود', ru: '{{gift}} Отправьте: /promo КОД' },
  promoOk: { vars: '%reward%', en: '{{gift}} Promo code applied! +$%reward%', ar: '{{gift}} تم تطبيق الكود! +$%reward%', ru: '{{gift}} Промокод применён! +$%reward%' },
  promoBad: { vars: '', en: '{{warn}} Invalid promo code.', ar: '{{warn}} كود غير صالح.', ru: '{{warn}} Неверный промокод.' },
  promoUsed: { vars: '', en: '{{stop}} You already used this code.', ar: '{{stop}} لقد استخدمت هذا الكود مسبقاً.', ru: '{{stop}} Вы уже использовали этот код.' },
  promoEnd: { vars: '', en: '{{stop}} This promo code has reached its limit.', ar: '{{stop}} وصل هذا الكود إلى حده الأقصى.', ru: '{{stop}} Лимит этого промокода исчерпан.' }
};

module.exports = { T, NAMES, LANGS: ['ar', 'ru', 'en'] };
