'use strict';

const labels_ja = {
    home: {
        title: 'Home',
        labelUsername: 'ユーザー名', 
        labelPassword: 'パスワード', 
        labelButtonLogin: 'ログイン',
        labelButtonLogout: 'ログアウト',
        textSignUp: '初めての方はこちら',
        labelLinkSignUp: '登録',
    },
    register: {
        title: 'Register',
        labelUsername: 'ユーザー名', 
        labelPassword: 'パスワード', 
        labelPasswordConfirm: 'パスワード(再入力)', 
        descUsername: ['[使用可能] 半角英小文字,半角数字,記号(_)', '[使用必須] 半角英小文字,半角数字 のいずれか', '3〜32文字'],
        descPassword: ['[使用可能] 半角英数字と記号(@_#$%&!.,+*~\')', '[使用必須] 英小文字,英大文字,数字,記号 のそれぞれ1文字', '8〜24文字'],
        descPasswordConfirm: '確認のためパスワードをもう一度入力してください',
        labelButtonConfirm: '確認する',
        textConfirm: '下記の内容で登録します',
        labelButtonRegister: '登録する',
        labelButtonBack: '修正する',
        textComplete: '登録完了しました',
        labelButtonLogin: 'ログイン',
    },
    formErrorMessages: {
        valueMissing: '入力してください',
        patternMismatch: '使用可能・使用必須の文字を確認してください',
        tooLong: '長すぎます',
        tooShort: '短すぎます',
        passwordIsNotSame: '同じパスワードを入力してください',
        isExists: 'このユーザー名は使われています',
    },

    dashboard: {
        title: 'Dashboard',
    },
    friends: {
        title: 'Friends',
        labelMatch: '対戦する',
        labelReceiveMatch: '対戦を受ける',
        labelCancel: 'キャンセル',
        labelRmFriend: '友達解除',
        labelAccept: '承諾',
        labelDecline: '削除',
        labelApply: '対戦する',
        labelSearch: '友達申請を送る',
        labelSendRequest: '送信',
        msgNoUsername: '友達申請を送るユーザー名を入力してください',
        msgNoFriends: '友達はまだいません',
        labelListFriends: '友達一覧',
        labelReceivedRequest: '受け取った友達申請',
        labelRecommended: 'あなたへのおすすめ',
    },
    lounge: {
        title: 'Lounge',
        labelMatch: '対戦する',
        labelCreateRoom: '部屋を作成',
        labelDualGame: '2人対戦',
        labelQuadGame: '4人対戦',
        labelCapacity: '定員',
        labelAvailable: '募集中',
        labelWaiting: '対戦相手を募集中',
    },
    match: {
        title: '',
        labelMatch: '対戦する',
        labelReceiveMatch: '対戦を受ける',
        labelMatchLog: '対戦記録',
        labelWins: '勝',
        labelLosses: '敗',
        fmtWinLoss: '$win勝 $loss敗',
    },
    tournament: {
        title: 'Tournament',
        labelCreateTournament: 'トーナメントを作成',
        labelTournamentTitle: 'トーナメント名',
        labelStart: '開始時刻',
        labelEntry: '出場する',
        labelCancelEntry: '取り消す',
        labelTitleUpcoming: '開催予定のトーナメント',
        labelTitleInPlay: '試合中のトーナメント',
        labelTitleRecent: '終了したトーナメント',
        labelTournamentLog: 'トーナメント記録',
    },
    modal: {
        title: '',
        labelNickname: 'ニックネーム',
        labelEntry: '出場申込',
        labelCancel: 'キャンセル',
        labelAccept: '対戦する',
        labelReject: 'やめておく',
        labelCapacity: '定員',
        labelAvailable: '募集中',
        titleSendMatchRequest: '対戦を申し込みました',
        titleReceiveMatchRequest: '対戦申し込みがありました',
        titleWaitForOpponent: '対戦相手を待っています...',
        titleEntryTournament:  'トーナメントに出場する',
    },
    friendRequest: {
        alreadyFriends: '$name さんはすでに友達です',
        usernameNotExists: '$name は存在しません',
        sendFriendReqSelf: '自分自身は友達になれないのですよ',
        invalidDeclineFriendReq: '友達申請の削除ができませんでした',
        sentRequestSuccess: '$name さんに友達申請が送信されました',
        acceptRequestSuccess: '$name さんと友達になりました',
        declineRequestSuccess: '$name さんの友達申請を削除しました',
        removeSuccess: '$name さんとの友達を解除しました',
        received: '$name さんから友達申請が来ました',
        accepted: '$name さんが友達申請を承認しました',
        removed: '$name さんと友達じゃなくなりました',
    },
};
const labels_en = {
    home: {
        title: 'Home',
        labelUsername: 'username', 
        labelPassword: 'password', 
        labelButtonLogin: 'log in',
        labelButtonLogout: 'log out',
        textSignUp: 'If you don\'t have an account:',
        labelLinkSignUp: 'sign up',
    },
    register: {
        title: 'Register',
        labelUsername: 'username', 
        labelPassword: 'password', 
        labelPasswordConfirm: 'confirm password', 
        descUsername: ['You can use lowercase alphabets, numbers, and underscore (a-z 0-9 _)', 'You need to use at least one alphabet or number', 'Between 3 and 32 characters long'],
        descPassword: ['You can use uppercase and lowercase alphabets, numbers, and following symbols (@_#$%&!.,+*~\')', 'You need to use at least one uppercase, one lowercase, one number, and one symbol', 'Between 8 and 24 characters long'],
        descPasswordConfirm: 'Please confirm the password',
        labelButtonConfirm: 'confirm',
        textConfirm: 'Do you want to register with the following information?',
        labelButtonRegister: 'register',
        labelButtonBack: 'go back',
        textComplete: 'Registration complete.',
        labelButtonLogin: 'log in',
    },
    formErrorMessages: {
        valueMissing: 'This field is required.',
        patternMismatch: 'Please check the character type requirement.',
        tooLong: 'Too many characters.',
        tooShort: 'Too few characters.',
        passwordIsNotSame: 'The passwords do not match.',
        isExists: 'This username is already talen.',
    },

    dashboard: {
        title: 'Dashboard',
    },
    friends: {
        title: 'Friends',
        labelMatch: 'start a match',
        labelReceiveMatch: 'take the match',
        labelCancel: 'cancel',
        labelRmFriend: 'remove friend',
        labelAccept: 'accept',
        labelDecline: 'decline',
        labelApply: 'start a match',
        labelSearch: 'send friend request',
        labelSendRequest: 'send',
        msgNoUsername: 'Enter a username to send friend request',
        msgNoFriends: 'no friends yet',
        labelListFriends: 'friends',
        labelReceivedRequest: 'friend requests',
        labelRecommended: 'recommended',
    },
    lounge: {
        title: 'Lounge',
        labelMatch: 'start a match',
        labelCreateRoom: 'create a room',
        labelDualGame: '2-player match',
        labelQuadGame: '4-player match',
        labelCapacity: 'capacity',
        labelAvailable: 'available',
        labelWaiting: 'looking for an opponent',
    },
    match: {
        title: '',
        labelMatch: 'start a match',
        labelReceiveMatch: 'take the match',
        labelMatchLog: 'match log',
        labelWins: 'wins',
        labelLosses: 'losses',
        fmtWinLoss: '$win wins, $loss losses',
    },
    tournament: {
        title: 'Tournament',
        labelCreateTournament: 'create a tournament',
        labelTournamentTitle: 'tournament title',
        labelStart: 'start time',
        labelEntry: 'entry',
        labelCancelEntry: 'cancel',
        labelTitleUpcoming: 'upcoming tournaments',
        labelTitleInPlay: 'ongoing tournaments',
        labelTitleRecent: 'finished tournaments',
        labelTournamentLog: 'tournament log',
    },
    modal: {
        title: '',
        labelNickname: 'nickname',
        labelEntry: 'entry',
        labelCancel: 'cancel',
        labelAccept: 'accept',
        labelReject: 'reject',
        labelCapacity: 'capacity',
        labelAvailable: 'available',
        titleSendMatchRequest: 'sent a match request',
        titleReceiveMatchRequest: 'you received a match request',
        titleWaitForOpponent: 'waiting for an opponent...',
        titleEntryTournament:  'participate in tournament',
    },
    friendRequest: {
        alreadyFriends: '$name is',
        usernameNotExists: '$name is',
        sendFriendReqSelf: 'is',
        invalidDeclineFriendReq: 'is',
        sentRequestSuccess: '$name is',
        acceptRequestSuccess: '$name is',
        declineRequestSuccess: '$name is',
        removeSuccess: '$name is',
        received: '$name is',
        accepted: '$name is',
        removed: '$name is',
    },
};
const labels_la = {
    home: {
        title: '',
        labelUsername: '', 
        labelPassword: '', 
        labelButtonLogin: '',
        labelButtonLogout: '',
        textSignUp: '',
        labelLinkSignUp: '',
    },
    register: {
        title: '',
        labelUsername: '', 
        labelPassword: '', 
        labelPasswordConfirm: '', 
        descUsername: [''],
        descPassword: [''],
        descPasswordConfirm: '',
        labelButtonConfirm: '',
        textConfirm: '',
        labelButtonRegister: '',
        labelButtonBack: '',
        textComplete: '',
        labelButtonLogin: '',
    },
    formErrorMessages: {
        valueMissing: '',
        patternMismatch: '',
        tooLong: '',
        tooShort: '',
        passwordIsNotSame: '',
        isExists: '',
    },

    dashboard: {
        title: '',
    },
    friends: {
        title: '',
        labelMatch: '',
        labelReceiveMatch: '',
        labelCancel: '',
        labelRmFriend: '',
        labelAccept: '',
        labelDecline: '',
        labelApply: '',
        labelSearch: '',
        labelSendRequest: '',
        msgNoUsername: '',
        msgNoFriends: '',
        labelListFriends: '',
        labelReceivedRequest: '',
        labelRecommended: '',
    },
    lounge: {
        title: '',
        labelMatch: '',
        labelCreateRoom: '',
        labelDualGame: '',
        labelQuadGame: '',
        labelCapacity: '',
        labelAvailable: '',
        labelWaiting: '',
    },
    match: {
        title: '',
        labelMatch: '',
        labelReceiveMatch: '',
        labelMatchLog: '',
        labelWins: '',
        labelLosses: '',
        fmtWinLoss: '$win $loss',
    },
    tournament: {
        title: '',
        labelCreateTournament: '',
        labelTournamentTitle: '',
        labelStart: '',
        labelEntry: '',
        labelCancelEntry: '',
        labelTitleUpcoming: '',
        labelTitleInPlay: '',
        labelTitleRecent: '',
        labelTournamentLog: '',
    },
    modal: {
        title: '',
        labelNickname: '',
        labelEntry: '',
        labelCancel: '',
        labelAccept: '',
        labelReject: '',
        labelCapacity: '',
        labelAvailable: '',
        titleSendMatchRequest: '',
        titleReceiveMatchRequest: '',
        titleWaitForOpponent: '',
        titleEntryTournament:  '',
    },
    friendRequest: {
        alreadyFriends: '$name ',
        usernameNotExists: '$name ',
        sendFriendReqSelf: '',
        invalidDeclineFriendReq: '',
        sentRequestSuccess: '$name ',
        acceptRequestSuccess: '$name ',
        declineRequestSuccess: '$name ',
        removeSuccess: '$name ',
        received: '$name ',
        accepted: '$name ',
        removed: '$name ',
    },
};
const labels_fr = labels_la;
const labels_he = Object.getPrototypeOf(labels_la);
const languageLabels = {
    'en': labels_en,
    'ja': labels_ja,
    'fr': labels_fr,
    'la': labels_la,
    'he': labels_he,
};

const switchLabels = (language) => {
    Object.assign(labels, languageLabels[language]);
};

const getLanguage = () => {
    return localStorage.getItem('configLang') || 'en';
}

const labels = labels_ja;
//const labels = languageLabels[getLanguage()];

export { labels, switchLabels };
