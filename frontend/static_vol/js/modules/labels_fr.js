'use strict';

export const labels_fr = {
    langCode: 'fr',
    langName: 'français',
    common: {
        switchLang: '',
        logoutTokenExpired: ''
    },
    home: {
        title: 'Accueil',
        labelUsername: 'Nom d’utilisateur',
        labelPassword: 'Mot de passe',
        labelButtonLogin: 'Se connecter',
        labelButtonLogout: 'Se déconnecter',
        textSignUp: 'Vous n’avez pas encore de compte ?',
        labelLinkSignUp: 'Créer un compte',
    },
    register: {
        title: 'Register',
        labelUsername: 'Nom d’utilisateur',
        labelPassword: 'Mot de passe',
        labelPasswordConfirm: 'Confirmez le mot de passe',
        descUsername: ['[Disponible] lettres minuscules, chiffres et symboles (_)]', '[Obligatoire] une lettre minuscule ou un chiffre', '3-32 caractères'],
        descPassword: ['[Disponible] Caractères alphanumériques et symboles (@_#$%&!.,+*~\')', '[Obligatoire] une majuscule, une minuscule, un chiffre et un symbol', '8-24 caractères'],
        descPasswordConfirm: 'Veuillez saisir à nouveau votre mot de passe pour confirmation',
        labelButtonConfirm: 'Confirmer',
        textConfirm: 'Souhaitez-vous vous enregistrer avec les informations suivantes ?',
        labelButtonRegister: 'S’inscrire',
        labelButtonBack: 'Modifier',
        textComplete: 'Enregistrement terminé',
        labelButtonLogin: 'Se connecter',
    },
    formErrorMessages: {
        valueMissing: 'Veuillez saisir une valeur',
        patternMismatch: 'Veuillez vérifier les caractères disponibles et requis',
        tooLong: 'Trop long',
        tooShort: 'Trop court',
        passwordIsNotSame: 'Veuillez saisir le même mot de passe',
        isExists: 'Ce nom d’utilisateur est utilisé',
        outOfRange: '',
        loginError1: 'Veuillez vérifier le nom d’utilisateur et le mot de passe',
        loginError2: 'quelque chose s’est mal passé',
    },

    dashboard: {
        title: 'Tableau de bord',
        labelChangeAvatar: 'Changer l’avatar',
        labelCancel: 'Annuler',
        labelUpload: 'Changer',
        msgAvatarSwitched : 'L’avatar a été modifié',
        msgInvalidFile : 'Fichier non valide',
        msgInvalidFileFormat : 'Format de fichier non valide (.jpg, .png uniquement)',
        labelViewAllFriends: 'Voir la liste complète des amis',
    },
    friends: {
        title: 'Amis',
        labelMatch: 'jouer contre',
        labelReceiveMatch: 'Recevoir la rencontre',
        labelCancel: 'Annuler',
        labelRmFriend: 'Annuler l’amitié',
        labelAccept: 'Accepter',
        labelDecline: 'Supprimer',
        labelApply: 'Jouer contre',
        labelSearch: 'Envoyer une demande d’ami',
        labelSendRequest: 'Envoyer',
        labelRequest: 'être amis',
        msgNoUsername: 'Veuillez entrer un nom d’utilisateur à qui envoyer une demande d’ami',
        msgNoFriends: 'Vous n’avez pas encore d’amis',
        labelListFriends: 'Liste d’amis',
        labelReceivedRequest: 'Demandes d’amis reçues',
        labelRecommended: 'Recommandations pour vous',
        msgNoRecommended: 'aucune recommandation',
    },
    lounge: {
        title: 'Lounge',
        labelMatch: 'Rejoindre',
        labelCreateRoom: 'Créer une salle',
        labelDualGame: 'Jeu à 2 joueurs',
        labelQuadGame: 'Jeu à 4 joueur',
        labelCapacity: 'Capacité',
        labelAvailable: 'Disponible',
        labelWaiting: 'Recherche d’adversaires',
    },
    match: {
        title: '',
        labelMatch: 'jouer contre',
        labelReceiveMatch: 'Recevoir le match',
        labelMatchLog: 'Journal du match',
        labelWins: 'victoires',
        labelLosses: 'défaites',
        fmtWin: '$win victoires',
        fmtLoss: '$loss défaites',
        msgNoMatch: 'aucune match',
    },
    tournament: {
        title: 'Tournament',
        labelCreateTournament: 'Créer un tournoi',
        labelTournamentTitle: 'Nom du tournoi',
        labelStart: 'Heure de début',
        labelEntry: 'Entrer',
        labelCancelEntry: 'Annuler',
        labelTitleUpcoming: 'Tournoi à venir',
        labelTitleInPlay: 'Tournoi en cours',
        labelTitleRecent: 'Tournoi terminé',
        labelTournamentLog: 'Journal du tournoi',
        labelUpdateLists: '',
        descTournamentTitle: [''],
        descTournamentStart: [''],
        descNickname: [''],
        labelNextMatch: '',
        labelRound1: '',
        labelRound2: '',
        labelRound3: '',
        labelRoundThirdPlaceRound: '',
        labelRoundSemiFinal: '',
        labelRoundFinal: '',
        labelByePlayer: '',
        labelWinner: '<strong>1</strong>',
        labelSecondPlace: '<strong>2</strong>',
        labelThirdPlace: '<strong>3</strong>',
        msgNoUpcoming: '',
        msgNoOngoing: '',
        msgNoFinished: '',
        msgNoEntered: '',
        labelWaitBye: '',
        msgWaitBye: '<p></p>',
        labelWaitLose: '',
        msgWaitLose: '<p></p>',
        labelWaitStart: '',
        msgWaitStart: '<p></p>',
        labelWaitRound: '',
        msgWaitRound: '<p></p>',
        labelWaitSemiFinal: '',
        msgWaitSemiFinal: '<p></p>',
        labelWaitFinal: '',
        msgWaitFinal: '<p></p>',
        labelFinalOnGoing: '',
        msgFinalOnGoing: '<p></p>',
    },
    modal: {
        labelNickname: 'pseudo',
        labelEntry: 'Demande d’entrée',
        labelCancel: 'Annuler',
        labelAccept: 'jouer contre',
        labelReject: 'Ne le fais pas',
        labelCapacity: 'Capacité',
        labelAvailable: 'Disponible',
        labelExitGame:  '',
        labelReturnToGame:  '',
        titleSendMatchRequest: 'Vous avez demandé un match',
        titleReceiveMatchRequest: 'Vous avez reçu une demande de match',
        titleWaitForOpponent: 'En attente d’un adversaire...',
        titleEntryTournament:  'Entrer',
        titleExitGame:  '',
    },
    friendRequest: {
        alreadyFriends: '$name est déjà un ami',
        usernameNotExists: '$name n’existe pas',
        sendFriendReqSelf: 'Vous ne pouvez pas être ami avec vous-même',
        invalidDeclineFriendReq: 'Impossible de supprimer la demande d’ami',
        sentRequestSuccess: 'Demande d’amitié envoyée à $name ',
        acceptRequestSuccess: 'Vous êtes maintenant ami avec $name ',
        declineRequestSuccess: 'La demande d’amitié de $name a été annulé',
        removeSuccess: 'Vous avez supprimé l’amitié de $name',
        received: 'Vous avez reçu une demande d’amitié de la part de $name ',
        accepted: '$name a accepté votre demande d’amitié',
        removed: 'Vous n’êtes plus ami avec $name',
    },
    matchRequest: {
        accepted: 'Le match va commencer',
        cancelled: 'Votre adversaire a annulé votre match',
        rejected: 'L’adversaire n’est pas d’humeur à jouer',
        userOffline: 'Votre adversaire est hors ligne',
        playerNotWaitingStatus: 'Votre adversaire est occupé',
    },
};
