'use strict';

export const labels_la = {
    langCode: 'la',
    langName: 'Latina',
    home: {
        title: 'Domus',
        labelUsername: 'nomen usoris',
        labelPassword: 'tessera',
        labelButtonLogin: 'nomen dare',
        labelButtonLogout: 'secedere',
        textSignUp: 'si novus es',
        labelLinkSignUp: 'nomen imponere',
    },
    register: {
        title: 'Registere',
        labelUsername: 'nomen usoris',
        labelPassword: 'tessera',
        labelPasswordConfirm: 'tesseram confirma',
        descUsername: ['utendi: alphabeta minuscula, numeri, et symbola (_)', 'necesse: alphabetum minusculum vel numerus', 'inter 3 - 32 litterae'],
        descPassword: ['utendi: alphabeta majuscula et minuscula, numeri, et symbola (@_#$%&!.,+*~\')', 'necesse: unusquisque de utendo', 'inter 8 - 24 litterae'],
        descPasswordConfirm: 'scriba eamdem tesseram confirmare',
        labelButtonConfirm: 'confirma',
        textConfirm: 'nomen tibi sic imponere',
        labelButtonRegister: 'nomen impone',
        labelButtonBack: 'revertere',
        textComplete: 'nomen tibi impositum est',
        labelButtonLogin: 'nomen dare',
    },
    formErrorMessages: {
        valueMissing: 'scriba',
        patternMismatch: 'lege de litteris necesse',
        tooLong: 'nimis longa',
        tooShort: 'nimis brevis',
        passwordIsNotSame: 'non eadem tessera',
        isExists: 'nomen usoris alium selige',
        loginError1: 'verifica iterum nomen et tesseram',
        loginError2: 'nunc non potest nomen dare',
    },

    dashboard: {
        title: 'Tabula',
        labelChangeAvatar: 'iconem mutare',
        labelCancel: 'reverte',
        labelUpload: 'mutare',
        msgAvatarSwitched: 'icon tibi mutata est',
        msgInvalidFile: 'fasciculus non acceptus',
        msgInvalidFileFormat: 'forma fasciculi non accepta est (soli .jpg, .png)',
        labelViewAllFriends: 'omnes amicos spectere',
    },
    friends: {
        title: 'Amici',
        labelMatch: 'pugnabo',
        labelReceiveMatch: 'pugnabo',
        labelCancel: 'reverte',
        labelRmFriend: 'non amici esse',
        labelAccept: 'accipio',
        labelDecline: 'nego',
        labelApply: 'pugno',
        labelSearch: 'petere amici esse',
        labelSendRequest: 'peto',
        labelRequest: 'amici esse',
        msgNoUsername: 'scriba nomen qui voles amici esse',
        msgNoFriends: 'nullus iam tibi amicus est',
        labelListFriends: 'index amicorum',
        labelReceivedRequest: 'tibi amici esse volunt',
        labelRecommended: 'usores commendati tibi',
        msgNoRecommended: 'nullus iam commendatus',
    },
    lounge: {
        title: 'Sessorium',
        labelMatch: 'intro',
        labelCreateRoom: 'cellam facere',
        labelDualGame: 'ludus dualis',
        labelQuadGame: 'ludus quartus',
        labelCapacity: 'capacitas',
        labelAvailable: 'alii',
        labelWaiting: 'exspectamus opponentes',
    },
    match: {
        title: '',
        labelMatch: 'pugnabo',
        labelReceiveMatch: 'pugnabo',
        labelMatchLog: 'index ludorum',
        labelWins: 'victoria',
        labelLosses: 'clades',
        fmtWinLoss: '$win victoriae - $loss clades',
        msgNoMatch: 'nullum iam ludum',
    },
    tournament: {
        title: 'Certamen',
        labelCreateTournament: 'certamen facere',
        labelTournamentTitle: 'nomen certaminis',
        labelStart: 'tempus',
        labelEntry: 'intro',
        labelCancelEntry: 'revertere',
        labelTitleUpcoming: 'certamina ventura',
        labelTitleInPlay: 'certamina praesentia',
        labelTitleRecent: 'certamina perfecta',
        labelTournamentLog: 'index certaminium',
        labelRound1: '',
        labelRound2: '',
        labelRound3: '',
        labelRoundFinal: '',
        labelWinner: '<strong>1</strong>',
        labelSecondPlace: '<strong>2</strong>',
        labelThirdPlace: '<strong>3</strong>',
    },
    modal: {
        labelNickname: 'agnomen',
        labelEntry: 'intro',
        labelCancel: 'reverte',
        labelAccept: 'pugnabo',
        labelReject: 'nolo',
        labelCapacity: 'capacitas',
        labelAvailable: 'alii',
        labelExitGame:  '',
        labelReturnToGame:  '',
        titleSendMatchRequest: 'petivisti pugnare',
        titleReceiveMatchRequest: 'petivit pugnare',
        titleWaitForOpponent: 'exspecto opponentes...',
        titleEntryTournament:  'intrare certamen',
        titleExitGame:  '',
    },
    friendRequest: {
        alreadyFriends: '$name et tu iam amici',
        usernameNotExists: 'nomen $name non est',
        sendFriendReqSelf: 'non potest tibi amicus esse',
        invalidDeclineFriendReq: 'petitio non deleta est',
        sentRequestSuccess: 'petitio ad $name missa est',
        acceptRequestSuccess: '$name et tu iam amici sunt',
        declineRequestSuccess: 'petitio de $name deleta est',
        removeSuccess: 'iam $name non amicus tibi',
        received: '$name vult tibi amici esse',
        accepted: '$name accepit amici esse',
        removed: '$name non vult amici esse',
    },
    matchRequest: {
        accepted: 'ludum praesens est',
        cancelled: 'opponens revertavit',
        rejected: 'opponens non vult pugnare',
        userOffline: 'opponens non connexus est',
        playerNotWaitingStatus: 'opponens occupatus est',
    },
};
