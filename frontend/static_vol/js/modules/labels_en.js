'use strict';

export const labels_en = {
    langCode: 'en',
    langName: 'English',
    common: {
        switchLang: 'Switch Language',
        btnEnable: 'The button becomes clickable when valid values are entered.'
    },
    home: {
        title: 'Log In',
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
        descUsername: ['You can use lowercase alphabets, numbers, and underscore (a-z 0-9 _)', 'You need to use at least one alphabet or number', '3 to 32 characters long'],
        descPassword: ['You can use uppercase and lowercase alphabets, numbers, and following symbols (@_#$%&!.,+*~\')', 'You need to use at least one uppercase, one lowercase, one number, and one symbol', '8 to 24 characters long'],
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
        isExists: 'This username is already taken.',
        outOfRange: 'That date and time cannot be specified',
        loginError1: 'Login failed. Please check your username and password.',
        loginError2: 'Something went wrong. Unable to log in.',
    },
    dashboard: {
        title: 'Dashboard',
        labelChangeAvatar: 'change avatar',
        labelCancel: 'cancel',
        labelUpload: 'upload',
        msgAvatarSwitched: 'avatar successfully changed',
        msgInvalidFile: 'file is invalid',
        msgInvalidFileFormat: 'invalid file format (only .jpg and .png are accepted)',
        labelViewAllFriends: 'View all friends',
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
        labelRequest: 'friend request',
        msgNoUsername: 'Enter a username to send friend request',
        msgNoFriends: 'no friends yet',
        labelListFriends: 'friends',
        labelReceivedRequest: 'friend requests',
        labelRecommended: 'recommended',
        msgNoRecommended: 'no recommended player',
    },
    lounge: {
        title: 'Lounge',
        labelMatch: 'enter',
        labelCreateRoom: 'create a room',
        labelDualGame: '2-player match',
        labelQuadGame: '4-player match',
        labelCapacity: 'capacity',
        labelAvailable: 'available',
        labelWaiting: 'looking for opponent',
    },
    match: {
        title: '',
        labelMatch: 'start a match',
        labelReceiveMatch: 'take the match',
        labelMatchLog: 'match log',
        labelWins: 'wins',
        labelLosses: 'losses',
        fmtWin: '$win wins,',
        fmtLoss: '$loss losses',
        msgNoMatch: 'no match log',
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
        labelUpdateLists: 'Update Lists',
        descTournamentTitle: ['You can use lowercase alphabets, numbers, hiragana, katakana, kanji, and symbols(@_#$%&!.+*~)', 'Between 3 and 50 characters long'],
        descTournamentStart: ['[Allowable Range] From 1 hour later to 1 month later.'],
        descNickname: ['You can use lowercase alphabets, numbers, hiragana, katakana, kanji, and symbols(@_#$%&!.+*~)', 'Between 3 and 20 characters long'],
        labelNextMatch: 'Next Match',
        labelRound1: 'First Round',
        labelRound2: 'Second Round',
        labelRound3: 'Third Round',
        labelRoundThirdPlaceRound: 'Third Place Round',
        labelRoundSemiFinal: 'Semi-final Round',
        labelRoundFinal: 'Final Round',
        labelByePlayer: 'Bye',
        labelWinner: '<strong>Winner</strong>',
        labelSecondPlace: 'Rank <strong>2</strong>',
        labelThirdPlace: 'Rank <strong>3</strong>',
        msgNoUpcoming: 'No upcoming tournament',
        msgNoOngoing: 'No ongoing tournament',
        msgNoFinished: 'No finished tournament',
        msgNoEntered: 'No entered tournament',
        labelWaitBye: 'Bye Victory',
        msgWaitBye: '<p>Please wait for the match to end</p>',
        labelWaitLose: 'Could not advance',
        msgWaitLose: '<p>Please wait for the tournament to end</p>',
        labelWaitStart: 'Waiting to Start',
        msgWaitStart: '<p>The tournament will start soon</p>',
        labelWaitRound: 'Waiting for Round End',
        msgWaitRound: '<p>Please wait for the round to end</p>',
        labelWaitSemiFinal: 'Waiting for Semi-final Match',
        msgWaitSemiFinal: '<p>Please wait for the semi-final match to start</p>',
        labelWaitFinal: 'Waiting for Final Match',
        msgWaitFinal: '<p>Please wait for the final match to start</p>',
        labelFinalOnGoing: 'Final Match In Progress',
        msgFinalOnGoing: '<p>Please wait for the final match to end</p>',
    },
    modal: {
        labelNickname: 'nickname',
        labelEntry: 'entry',
        labelCancel: 'cancel',
        labelAccept: 'accept',
        labelReject: 'reject',
        labelCapacity: 'capacity',
        labelAvailable: 'available',
        labelExitGame:  'exit',
        labelReturnToGame:  'Return to game',
        titleSendMatchRequest: 'sent a match request',
        titleReceiveMatchRequest: 'you received a match request',
        titleWaitForOpponent: 'waiting for an opponent...',
        titleEntryTournament:  'participate in tournament',
        titleExitGame:  'Leave the game?',
    },
    friendRequest: {
        alreadyFriends: '$name is already your friend',
        usernameNotExists: '$name does not exist',
        sendFriendReqSelf: 'you cannot be a friend of yourself',
        invalidDeclineFriendReq: 'failed to delete friend request',
        sentRequestSuccess: 'friend request has been sent to $name',
        acceptRequestSuccess: '$name is now your friend',
        declineRequestSuccess: 'friend request from $name has been deleted',
        removeSuccess: '$name is no longer your friend',
        received: '$name has sent you a friend request',
        accepted: '$name has accepted your friend request',
        removed: '$name is no longer your friend',
    },
    matchRequest: {
        accepted: 'game is starting',
        cancelled: 'opponent cancelled the match',
        rejected: 'opponent has rejected to play',
        userOffline: 'opponent is offline',
        playerNotWaitingStatus: 'opponent is busy now',
    },
};
