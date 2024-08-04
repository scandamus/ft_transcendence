'use strict';

import { CREATE_TOURNAMENT_TIMELIMIT_MIN, FRIENDS_MAX } from './env.js';

export const labels_ja = {
    langCode: 'ja',
    langName: '日本語',
    common: {
        switchLang: '言語選択',
        logoutTokenExpired: 'セッション期限が切れました。再ログインしてください。',
        disconnected: 'サーバーとの接続が切れました',
        disconnectedByNewLogin: 'サーバーに新しいログインがあったため切断されました'
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
        startTimeInvalid: `トーナメントの開始時刻は${CREATE_TOURNAMENT_TIMELIMIT_MIN}分後以降に設定してください`,
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
        msgFriendsFull: `友達が上限の${FRIENDS_MAX}人に達しています。<br>他のPlayerと友達になりたい場合、友達解除をして枠を空けてください。`,
        labelOnline: 'ログイン',
        labelOffline: 'ログアウト',
        msgChangeFriendOnline: '$friend が $online しました',
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
        title: 'Match',
        labelMatch: '対戦する',
        labelReceiveMatch: '対戦を受ける',
        labelMatchLog: '対戦記録',
        labelWins: '勝',
        labelLosses: '敗',
        fmtWin: '$win勝',
        fmtLoss: '$loss敗',
        msgNoMatch: '対戦結果がありません',
        msgReconnectMatch: '試合中のゲームに復帰します',
    },
    tournament: {
        title: 'Tournament',
        labelCreateTournament: 'トーナメントを作成',
        msgCreateDone: '$tournament - $start が作成されました',
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
        descTournamentStart: [`[指定可能範囲] ${CREATE_TOURNAMENT_TIMELIMIT_MIN}分後〜1ヶ月後`, '[他トーナメントとの間隔] 6時間以上'],
        descNickname: ['[使用可能] 半角英小文字,半角数字,ひらがな,カタカナ,漢字,記号(@_#$%&!.+*~)', '3〜20文字'],
        labelNextMatch: '次の対戦',
        labelRound1: '第1ラウンド',
        labelRound2: '第2ラウンド',
        labelRound3: '第3ラウンド',
        labelRoundThirdPlaceRound: '3位決定戦',
        labelRoundSemiFinal: '準決勝',
        labelRoundFinal: '決勝',
        labelByePlayer: '不戦勝',
        labelWinner: '<strong>優勝</strong>',
        labelSecondPlace: '<strong>2</strong>位',
        labelThirdPlace: '<strong>3</strong>位',
        msgNoUpcoming: '開催予定のトーナメントはありません',
        msgNoOngoing: '進行中のトーナメントはありません',
        msgNoFinished: '終了したトーナメントはありません',
        msgNoEntered: 'トーナメント記録はありません',
        labelWaitBye: '不戦勝',
        msgWaitBye: '<p>ラウンド終了までお待ちください</p>',
        labelWaitLose: '勝ち残れませんでした',
        msgWaitLose: '<p>トーナメント終了をお待ちください</p>',
        labelWaitStart: 'トーナメント開始待ち',
        msgWaitStart: '<p>もうすぐトーナメントが開始されます</p>',
        labelWaitRound: 'ラウンド終了待ち',
        msgWaitRound: '<p>ラウンド終了までお待ちください</p>',
        labelWaitSemiFinal: '準決勝戦待ち',
        msgWaitSemiFinal: '<p>対戦開始までお待ちください</p>',
        labelWaitFinal: '決勝戦待ち',
        msgWaitFinal: '<p>対戦開始までお待ちください</p>',
        labelFinalOnGoing: '決勝戦進行中',
        msgFinalOnGoing: '<p>決勝戦終了までお待ちください</p>',
        msgEntryDone: 'トーナメント $tournament へのエントリーが完了しました',
        msgNoEntry: 'トーナメントへのエントリーがありません',
        msgInvalidEntry: '登録期限を過ぎたなど無効なリクエストです',
        msgPrepare: 'トーナメント $tournament の開始５分前になりました',
        msgEnterRoom: 'トーナメント $tournament の控室に移動します',
        msgCanceled: 'トーナメント $tournament は催行人数に達しなかったためキャンセルされました',
        msgStart: 'トーナメント $tournament を開始します',
        msgFinished: 'トーナメント $tournament は終了しました',
        msgDeadHasPassed: 'トーナメント $tournament のエントリー期限を過ぎています',
        msgEntryCanceled: 'トーナメント $tournament への参加をキャンセルしました',
        msgEntryDupNickname: 'すでに同名のニックネームが使われています',
        msgAlreadyEntered: 'すでにエントリー済みのトーナメントです',
        msgCapacityFull: '満員のためトーナメントにエントリー出来ませんでした',
        msgEntryInvalidTournament: '無効なトーナメントへのリクエストです',
        msgEntryInvalidPlayer: 'トーナメントにエントリー出来ませんでした',
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
        mutualReq: '$name さんからはすでに友達申請を受け取っています',
        alreadyReq: '$name さんへの友達申請は送信済みです',
        received: '$name さんから友達申請が来ました',
        accepted: '$name さんが友達申請を承認しました',
        removed: '$name さんと友達じゃなくなりました',
        missedRequestAccept: '$name さんが友達申請を承認しようとしましたが、あなたの友達が上限に達しています。友達解除をして枠を空けてください。',
        acceptRequestFailedFull: '$name さんの友達が上限に達しているため今は友達になれませんでした。',
        acceptRequestFailedFull2: 'あなたの友達が上限に達しているため友達になれませんでした。友達解除をして枠を空けてください。',
    },
    matchRequest: {
        accepted: '対戦が始まります',
        cancelled: '相手が対戦をキャンセルしました',
        rejected: '相手は対戦したくない気分です',
        userOffline: '相手はオフラインです',
        playerNotWaitingStatus: '相手は取り込み中です',
        msgCannotRequestInTournament: 'トーナメント中にマッチリクエストできません',
        msgCannotRequestInMatch: 'マッチ中にほかのマッチリクエストはできません',
        msgCannotRequestInMatchWaiting: 'マッチ待機中にマッチリクエストできません',
    },
};
