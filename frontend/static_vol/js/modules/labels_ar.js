'use strict';

export const labels_ar = {
    langCode: 'ar',
    langName: 'العربية',
    home: {
        title: 'Home',
        labelUsername: 'اسم المستخدم',
        labelPassword: 'كلمة المرور',
        labelButtonLogin: 'تسجيل الدخول',
        labelButtonLogout: 'تسجيل الخروج',
        textSignUp: 'أول مرة هنا',
        labelLinkSignUp: 'تسجيل',
    },
    register: {
        title: 'Register',
        labelUsername: 'اسم المستخدم',
        labelPassword: 'كلمة المرور',
        labelPasswordConfirm: 'كلمة المرور (إعادة كتابة)',
        descUsername: ['[متاح] أحد الأحرف الأبجدية الصغيرة أو الرقمية أو الرمز(_)', '[مطلوب] أحد الأحرف الأبجدية أو الرقمية ذات الأحرف الأبجدية الصغيرة', '3-32 حرفاً'],
        descPassword: ['مسموح: الأحرف الأبجدية الكبيرة والصغيرة والأرقام والرموز(@_#$%&!.,+*~\')', 'مطلوب: أحرف أبجدية صغيرة وأحرف أبجدية كبيرة وأرقام ورموز', '8-24 حرفاً'],
        descPasswordConfirm: 'الرجاء إدخال كلمة المرور مرة أخرى للتأكيد',
        labelButtonConfirm: 'تأكيد',
        textConfirm: 'أسجل بالتفاصيل التالية',
        labelButtonRegister: 'تسجيل',
        labelButtonBack: 'تعديل',
        textComplete: 'اكتمل التسجيل',
        labelButtonLogin: 'تسجيل الدخول',
    },
    formErrorMessages: {
        valueMissing: 'الرجاء إدخال',
        patternMismatch: 'الرجاء التحقق من الأحرف المتاحة والمطلوبة',
        tooLong: 'طويل جداً',
        tooShort: 'قصير جداً',
        passwordIsNotSame: 'الرجاء إدخال كلمة المرور نفسها',
        isExists: 'اسم المستخدم هذا قيد الاستخدام',
        outOfRange: '',
        loginError1: 'يُرجى التحقق من اسم المستخدم وكلمة المرور',
        loginError2: 'تعذر تسجيل الدخول',
    },

    dashboard: {
        title: 'Dashboard',
        labelChangeAvatar: 'تغيير الصورة الرمزية',
        labelCancel: 'إلغاء',
        labelUpload: 'تغيير',
        msgAvatarSwitched: 'لقد قمت بتغيير الصورة الرمزية الخاصة بك',
        msgInvalidFile: 'ملف سيء',
        msgInvalidFileFormat: 'تنسيق ملف سيء (يمكن تعيين .jpg، .png فقط)',
        labelViewAllFriends: 'عرض جميع الأصدقاء',
    },
    friends: {
        title: 'Friends',
        labelMatch: 'اللعب ضد',
        labelReceiveMatch: 'قبول التطابق',
        labelCancel: 'إلغاء',
        labelRmFriend: 'إلغاء صداقة',
        labelAccept: 'قبول',
        labelDecline: 'حذف',
        labelApply: 'اللعب ضد',
        labelSearch: 'إرسال طلب صداقة',
        labelSendRequest: 'إرسال',
        labelRequest: 'تكوين صداقات مع',
        msgNoUsername: 'الرجاء إدخال اسم مستخدم لإرسال طلب صداقة إليه',
        msgNoFriends: 'ليس لديك أصدقاء بعد',
        labelListFriends: 'قائمة الأصدقاء',
        labelReceivedRequest: 'طلبات الصداقة المستلمة',
        labelRecommended: 'توصيات لك',
        msgNoRecommended: 'لا توجد توصية',
    },
    lounge: {
        title: 'Lounge',
        labelMatch: 'الانضمام',
        labelCreateRoom: 'إنشاء غرفة',
        labelDualGame: '2 لاعبين',
        labelQuadGame: '4 لاعبين',
        labelCapacity: 'السعة',
        labelAvailable: 'تجنيد',
        labelWaiting: 'البحث عن خصوم',
    },
    match: {
        title: '',
        labelMatch: 'اللعب ضد',
        labelReceiveMatch: 'استقبال المباريات',
        labelMatchLog: 'سجل المباريات',
        labelWins: 'فوز',
        labelLosses: 'خسارة',
        fmtWinLoss: '$win فوز <br>$loss خسارة',
        msgNoMatch: 'لا توجد مباريات',
    },
    tournament: {
        title: 'Tournament',
        labelCreateTournament: 'نشاء بطولة',
        labelTournamentTitle: 'سم البطولة',
        labelStart: 'وقت البدء',
        labelEntry: 'دخول',
        labelCancelEntry: 'إلغاء',
        labelTitleUpcoming: 'البطولة المجدولة',
        labelTitleInPlay: 'بطولة قيد التنفيذ',
        labelTitleRecent: 'البطولات المكتملة',
        labelTournamentLog: 'سجلات البطولة',
        labelUpdateLists: '',
        descTournamentTitle: [''],
        descTournamentStart: [''],
        descNickname: [''],
    },
    modal: {
        labelNickname: 'اللقب',
        labelEntry: 'طلب اللعب',
        labelCancel: 'إلغاء',
        labelAccept: 'العب ضد',
        labelReject: 'لا تلعب',
        labelCapacity: 'القدرة',
        labelAvailable: 'مفتوح للمنافسة',
        labelExitGame:  '',
        labelReturnToGame:  '',
        titleSendMatchRequest: ' لقد تقدمت بطلب للمشاركة في مباراة',
        titleReceiveMatchRequest: 'لقد تقدمت بطلب للعب ضدك',
        titleWaitForOpponent: 'في انتظار الخصم...',
        titleEntryTournament:  'أنا أشارك في البطولة',
        titleExitGame:  '',
    },
    friendRequest: {
        alreadyFriends: '$name صديق بالفعل',
        usernameNotExists: '$name غير موجود',
        sendFriendReqSelf: 'لا يمكنك مصادقة نفسك',
        invalidDeclineFriendReq: 'تعذر حذف طلب الصداقة',
        sentRequestSuccess: 'لقد قمت بإرسال طلب صداقة إلى $name ',
        acceptRequestSuccess: 'أنت الآن صديق ل $name ',
        declineRequestSuccess: 'م حذف طلب صداقة ل $name ',
        removeSuccess: 'لقد قمت بإلغاء صداقة $name ',
        received: 'لقد تلقيت طلب صداقة من $name ',
        accepted: 'أنت الآن صديق ل $name ',
        removed: 'لم تعد صديقاً ل $name ',
    },
    matchRequest: {
        accepted: 'ستبدأ المباراة',
        cancelled: 'لقد ألغى خصمك المباراة',
        rejected: 'خصمك ليس في حالة مزاجية تسمح له باللعب',
        userOffline: 'خصمك غير متصل بالإنترنت',
        playerNotWaitingStatus: 'خصمك مشغول',
    },
};
