'use strict';

export const labels_en = {
	langCode: 'en',
	langName: 'English',
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
        outOfRange: 'That date and time cannot be specified',
        loginError1: 'Login failed. Please check your username and password.',
        loginError2: 'Something went wrong. Unable to log in.',
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
    },
};
