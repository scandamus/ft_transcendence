'use strict';

export const labels_ja = {
    langCode: 'ja',
    langName: '日本語',
    common: {
        switchLang: '言語選択'
    },
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
        outOfRange: 'その日時は指定できません',
        intervalError: '他のトーナメントと6時間以上間隔を空けてください',
        tournamentNameAlreadyExists: '同名のトーナメントがすでに存在しています',
        loginError1: 'ログインに失敗しました。ユーザー名とパスワードを確認してください',
        loginError2: 'ログインできません',
    },

    dashboard: {
        title: 'Dashboard',
        labelChangeAvatar: 'アバターを変更',
        labelCancel: 'キャンセル',
        labelUpload: '変更する',
        msgAvatarSwitched: 'アバターを変更しました',
        msgInvalidFile: '不正なファイルです',
        msgInvalidFileFormat: '不正なファイル形式です(.jpg, .png のみ設定できます)',
        labelViewAllFriends: '全ての友達を見る',
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
        labelRequest: '友達申請',
        msgNoUsername: '友達申請を送るユーザー名を入力してください',
        msgNoFriends: '友達はまだいません',
        labelListFriends: '友達一覧',
        labelReceivedRequest: '受け取った友達申請',
        labelRecommended: 'あなたへのおすすめ',
        msgNoRecommended: 'おすすめユーザーはいません',
    },
    lounge: {
        title: 'Lounge',
        labelMatch: '参加する',
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
        fmtWin: '$win勝',
        fmtLoss: '$loss敗',
        msgNoMatch: '対戦結果がありません',
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
        labelUpdateLists: 'リストを再読み込み',
        descTournamentTitle: ['[使用可能] 半角英小文字,半角数字,ひらがな,カタカナ,漢字,記号(@_#$%&!.+*~)', '3〜50文字'],
        descTournamentStart: ['[指定可能範囲] 1時間後〜1ヶ月後', '[他トーナメントとの間隔] 6時間以上'],
        descNickname: ['[使用可能] 半角英小文字,半角数字,ひらがな,カタカナ,漢字,記号(@_#$%&!.+*~)', '3〜20文字'],
    },
    modal: {
        labelNickname: 'ニックネーム',
        labelEntry: '出場申込',
        labelCancel: 'キャンセル',
        labelAccept: '対戦する',
        labelReject: 'やめておく',
        labelCapacity: '定員',
        labelAvailable: '募集中',
        labelExitGame:  '退出',
        labelReturnToGame:  'ゲームに戻る',
        titleSendMatchRequest: '対戦を申し込みました',
        titleReceiveMatchRequest: '対戦申し込みがありました',
        titleWaitForOpponent: '対戦相手を待っています...',
        titleEntryTournament:  'トーナメントに出場する',
        titleExitGame:  'ゲームから退出しますか?',
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
    matchRequest: {
        accepted: '対戦が始まります',
        cancelled: '相手が対戦をキャンセルしました',
        rejected: '相手は対戦したくない気分です',
        userOffline: '相手はオフラインです',
        playerNotWaitingStatus: '相手は取り込み中です',
    },
};
