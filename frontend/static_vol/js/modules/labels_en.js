'use strict';

import { CREATE_TOURNAMENT_TIMELIMIT_MIN, FRIENDS_MAX } from './env.js';

export const labels_en = {
    langCode: 'en',
    langName: 'English',
    common: {
        switchLang: 'Switch Language',
        logoutTokenExpired: 'Session expired. You have been logged out. Please log in again.',
        disconnected: 'Disconnected from the server',
        disconnectedByNewLogin: 'Disconnected due to a new login on the server'
    },
    home: {
        title: 'Home',
        labelUsername: 'username',
        labelPassword: 'password',
        labelButtonLogin: 'log in',
        labelButtonLogout: 'log out',
        textSignUp: 'If you don\'t have an account:',
        labelLinkSignUp: 'sign up',
        fail42Login1: 'No available accounts can be created with 42Login. Please register through sign up.',
        fail42Login2: 'Failed to log in with 42Login.',
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
        startTimeInvalid: `Please set the tournament start time to be at least ${CREATE_TOURNAMENT_TIMELIMIT_MIN} minutes from now.`,
        intervalError: 'An interval of at least 6 hours is required between tournaments.',
        tournamentNameAlreadyExists: 'Tournament name already exists.',
        loginError1: 'Login failed. Please check your username and password.',
        loginError2: 'Something went wrong. Unable to log in.',
    },

    dashboard: {
        title: 'Dashboard',
        labelChangeAvatar: 'change avatar',
        labelCancel: 'cancel',
        labelUpload: 'upload',
        msgAvatarSwitched: 'avatar successfully changed',
        msgFailAvatarUpload: 'Failed to change the avatar',
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
        msgFriendsFull: `You have reached the maximum limit of ${FRIENDS_MAX} friends.<br>If you want to add another player as a friend, please remove an existing friend to free up space.`,
        labelOnline: 'Online',
        labelOffline: 'Offline',
        msgChangeFriendOnline: '$friend is now $online ',
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
        title: 'Match',
        labelMatch: 'start a match',
        labelReceiveMatch: 'take the match',
        labelMatchLog: 'match log',
        fmtWin: '$win wins',
        fmtMatches: '$num matches',
        msgNoMatch: 'no match log',
        msgReconnectMatch: 'Reconnecting to the ongoing game',
    },
    tournament: {
        title: 'Tournament',
        labelCreateTournament: 'create a tournament',
        msgCreateDone: '$tournament - $start has been created',
        labelTournamentTitle: 'tournament title',
        labelStart: 'start time',
        labelEntry: 'entry',
        labelCancelEntry: 'cancel',
        labelTitleUpcoming: 'upcoming tournaments',
        labelTitleOnGoing: 'ongoing tournaments',
        labelTitleRecent: 'finished tournaments',
        labelTournamentLog: 'tournament log',
        labelCanceledRound: '(Cancellation due to player forfeiture)',
        labelUpdateLists: 'Update Lists',
        descTournamentTitle: ['You can use lowercase alphabets, numbers, hiragana, katakana, kanji, and symbols(@_#$%&!.+*~)', 'Between 3 and 50 characters long'],
        descTournamentStart: [`[Allowable Range] From ${CREATE_TOURNAMENT_TIMELIMIT_MIN} minutes later to 1 month later.`, '[between tournaments] At least 6 hours'],
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
        msgEntryDone: 'Entry to tournament $tournament has been completed',
        msgNoEntry: 'No entry for the tournament',
        msgInvalidEntry: 'Invalid request, such as missing the registration deadline',
        msgPrepare: '5 minutes left until the start of tournament $tournament',
        msgEnterRoom: 'Moving to the waiting room for tournament $tournament',
        msgCanceled: 'Tournament $tournament has been canceled due to insufficient participants',
        msgStart: 'Starting tournament $tournament',
        msgFinished: 'Tournament $tournament has finished',
        msgDeadHasPassed: 'The entry deadline for tournament $tournament has passed',
        msgEntryCanceled: 'Entry to tournament $tournament has been canceled',
        msgEntryDupNickname: 'A nickname with the same name is already in use',
        msgAlreadyEntered: 'You have already entered this tournament',
        msgCapacityFull: 'Unable to enter the tournament due to full capacity',
        msgEntryInvalidTournament: 'Request for an invalid tournament',
        msgEntryInvalidPlayer: 'Unable to enter the tournament',
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
        mutualReq: '$name has already sent you a friend request',
        alreadyReq: 'You have already sent a friend request to $name',
        received: '$name has sent you a friend request',
        accepted: '$name has accepted your friend request',
        removed: '$name is no longer your friend',
        missedRequestAccept: '$name tried to accept your friend request, but your friends list has reached its limit. Please remove some friends to make space.',
        acceptRequestFailedFull: 'You couldn\'t become friends with $name because your friend list is full at the moment.',
        acceptRequestFailedFull2: 'You couldn\'t become friends because your friend limit has been reached. Please remove some friends to free up space.',
    },
    matchRequest: {
        accepted: 'game is starting',
        cancelled: 'opponent cancelled the match',
        rejected: 'opponent has rejected to play',
        userOffline: 'opponent is offline',
        playerNotWaitingStatus: 'opponent is busy now',
        msgCannotRequestInTournament: 'Match requests cannot be made during a tournament',
        msgCannotRequestInMatch: 'Cannot request another match while in a match',
        msgCannotRequestInMatchWaiting: 'Match requests cannot be made while waiting for a match',
    },
};
