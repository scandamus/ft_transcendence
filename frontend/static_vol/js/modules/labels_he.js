'use strict';

import { CREATE_TOURNAMENT_TIMELIMIT_MIN } from './env.js';

export const labels_he = {
    langCode: 'he',
    langName: 'עברית',
    common: {
        switchLang: ''
    },
    home: {
        title: 'Home',
        labelUsername: 'שם משתמש',
        labelPassword: 'סיסמה',
        labelButtonLogin: 'להתחבר',
        labelButtonLogout: 'להתנתק',
        textSignUp: 'אם זו הפעם הראשונה שלך',
        labelLinkSignUp: 'הירשם',
    },
    register: {
        title: 'Register',
        labelUsername: 'שם משתמש',
        labelPassword: 'סיסמה',
        labelPasswordConfirm: 'תכניס מחדש סיסמה',
        descUsername: ['זמין: אותיות קטנות, מספרים, סמלים (_)', 'נדרש: אות קטנה או מספר', '3-32 תווים'],
        descPassword: ['זמין: אותיות רישיות, אותיות קטנות, מספרים וסמלים(@_#$%&!.,+*~\')', 'נדרש: אות קטנה אחת, אות גדולה אחת, מספר אחד, סמל אחד', '8-24 תווים'],
        descPasswordConfirm: 'אנא הזן שוב את הסיסמה שלך',
        labelButtonConfirm: 'לאשר',
        textConfirm: 'להרשם עם הפרטים הבאים ',
        labelButtonRegister: 'הירשם',
        labelButtonBack: 'לשנות',
        textComplete: 'ההרשמה הושלמה',
        labelButtonLogin: 'להתחבר',
    },
    formErrorMessages: {
        valueMissing: 'נא למלא טופס זה',
        patternMismatch: 'אנא בדוק את התווים הזמינים והנדרשים',
        tooLong: 'יותר מדי',
        tooShort: 'קצר מדי',
        passwordIsNotSame: 'אנא הזן את אותה סיסמה',
        isExists: 'שם המשתמש כבר בשימוש',
        outOfRange: '',
        intervalError: '',
        tournamentNameAlreadyExists: '',
        loginError1: 'בדק את שמך וסיסמתך',
        loginError2: 'משהו השתבש',
    },

    dashboard: {
        title: 'Dashboard',
        labelChangeAvatar: 'לשנות את האווטאר',
        labelCancel: 'לטבל',
        labelUpload: 'לשנות',
        msgAvatarSwitched: 'האווטאר השתנה',
        msgInvalidFile: 'קובץ לא תקין',
        msgInvalidFileFormat: 'פורמט קובץ לא חוקי (רק .jpg, .png )',
        labelViewAllFriends: 'לראות כל החברים',
    },
    friends: {
        title: 'Friends',
        labelMatch: 'לשחק נגד',
        labelReceiveMatch: 'קבל התאמה',
        labelCancel: 'לבטל',
        labelRmFriend: 'הסר חבר',
        labelAccept: 'לקבל',
        labelDecline: 'למחוק',
        labelApply: 'לשחק נגד',
        labelSearch: 'לשלוח בקשת חברות',
        labelSendRequest: 'שלח',
        labelRequest: 'להיות חברים',
        msgNoUsername: 'אנא הזן שם משתמש כדי לשלוח אליו בקשת חברות',
        msgNoFriends: 'אין לך עדיין חברים',
        labelListFriends: 'רשימת חברים',
        labelReceivedRequest: 'בקשות חברות שקיבלת',
        labelRecommended: 'מומלץ עבורך',
        msgNoRecommended: 'אין מומלץ עבורך',
    },
    lounge: {
        title: 'Lounge',
        labelMatch: 'להצטרף',
        labelCreateRoom: 'צור חדר',
        labelDualGame: '2 שחקנים',
        labelQuadGame: '4 שחקנים',
        labelCapacity: 'קיבולת',
        labelAvailable: 'גיוס',
        labelWaiting: 'מחפש יריבים',
    },
    match: {
        title: '',
        labelMatch: 'לשחק נגד',
        labelReceiveMatch: 'קבל התאמות',
        labelMatchLog: 'שיא התאמה',
        labelWins: 'ניצחונות',
        labelLosses: 'הפסדים',
        fmtWin: '$win ניצחונות',
        fmtLoss: '$loss הפסדים',
        msgNoMatch: 'אין תאמה',
    },
    tournament: {
        title: 'Tournament',
        labelCreateTournament: 'צור טורניר',
        labelTournamentTitle: 'שם הטורניר',
        labelStart: 'שעת התחלה',
        labelEntry: 'להתכנס',
        labelCancelEntry: 'לבטל',
        labelTitleUpcoming: 'הטורנירים הקרובים',
        labelTitleInPlay: 'טורנירים בעיצומם',
        labelTitleRecent: 'טורנירים שהושלמו',
        labelTournamentLog: 'שיאי טורניר',
        labelUpdateLists: '',
        descTournamentTitle: [''],
        descTournamentStart: ['', ''],
        descNickname: [''],
    },
    modal: {
        labelNickname: 'כינוי',
        labelEntry: 'להתכנס',
        labelCancel: 'לבטל',
        labelAccept: 'לשחק נגד',
        labelReject: 'לא עכשיו',
        labelCapacity: 'קיבולת',
        labelAvailable: 'עוד שחקן',
        labelExitGame:  '',
        labelReturnToGame:  '',
        titleSendMatchRequest: 'הגשת בקשה לשחק נגד',
        titleReceiveMatchRequest: 'קיבלת בקשת משחק',
        titleWaitForOpponent: 'מחכה ליריב...',
        titleEntryTournament:  'קיבלת בקשת משחק',
        titleExitGame:  '',
    },
    friendRequest: {
        alreadyFriends: '$name כבר חבר',
        usernameNotExists: '$name לא קיים',
        sendFriendReqSelf: 'אתה לא יכול לחבר את עצמך',
        invalidDeclineFriendReq: 'לא ניתן למחוק בקשת חברות',
        sentRequestSuccess: 'שלחת בקשת חברות ל-$name',
        acceptRequestSuccess: 'אתם עכשיו חברים עם $name',
        declineRequestSuccess: 'מחקת את בקשת החברות של $name',
        removeSuccess: 'מחקת את החבר $name',
        received: '$name שלח לך בקשת חברות',
        accepted: '$name קיבל את בקשת החברות שלך',
        removed: 'אתם כבר לא חברים עם $name',
    },
    matchRequest: {
        accepted: 'המשחק יתחיל',
        cancelled: 'היריב שלך ביטל את המשחק',
        rejected: 'ליריב שלך אין מצב רוח לשחק',
        userOffline: 'היריב שלך לא מקוון',
        playerNotWaitingStatus: 'היריב שלך עסוק',
    },
};
