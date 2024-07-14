'use strict';

import { addListenerToList, removeListenerAndClearList } from './listenerCommon.js';
import { showModalEntryTournament } from './modal.js';
import { cancelEntryTournament } from './tournament.js';
import { linkSpa } from './router.js';

const cancelEntryTournamentHandler = (ev) => {
    ev.preventDefault();
    console.log('canclEntryTournamentHandler called');
    const tournamentName = ev.target.dataset.name;
    const tournamentId = ev.target.dataset.id;
    cancelEntryTournament(tournamentId, tournamentName);
}

const removeListenEntryTournament = (pageInstance) => {
    removeListenerAndClearList(pageInstance.listListenEntryTournament);
    pageInstance.listListenEntryTournament = [];
}

const removeListenCancelEntryTournament = (pageInstance) => {
    removeListenerAndClearList(pageInstance.listListenCancelEntryTournament);
    pageInstance.listListenCancelEntryTournament = [];
}

const addListenEntryTournament = (pageInstance) => {
    const btnEntryTournament = document.querySelectorAll('.unitUpcomingTournamentButton_entry');
    const boundShowModalEntryTournamentHandler = showModalEntryTournament.bind(pageInstance);
    btnEntryTournament.forEach((btn) => {
        addListenerToList(
            pageInstance.listListenEntryTournament,
            btn,
            boundShowModalEntryTournamentHandler,
            'click'
        );
        console.log(`[Add listener] entry tournament request: ${btn.dataset.name}`);
    })
}

const addListenCancelEntryTournament = (pageInstance) => {
    const btnCancelEntryTournament = document.querySelectorAll('.unitUpcomingTournamentButton_cancel');
    const boundCancelEntryTournamentHandler = cancelEntryTournamentHandler.bind(pageInstance);
    btnCancelEntryTournament.forEach((btn) => {
        addListenerToList(
            pageInstance.listListenCancelEntryTournament,
            btn,
            boundCancelEntryTournamentHandler,
            'click'
        );
        console.log(`[Add listener] cancel entry tournament request: ${btn.dataset.name}`)
    });
}

const addListenLinkTournamentDetail = (pageInstance) => {
    const LinkTournamentDetail = document.querySelectorAll('.blockTournamentList_finished a[data-link]');
    LinkTournamentDetail.forEach((linkPage) => {
        pageInstance.addListListenInInstance(linkPage, linkSpa, 'click');
    });
}

//resetListener
const removeListenUpcomingTournamentList = (pageInstance) => {
    removeListenEntryTournament(pageInstance);
    removeListenCancelEntryTournament(pageInstance);
}

const addListenUpcomingTournamentList = (pageInstance) => {
    addListenEntryTournament(pageInstance);
    addListenCancelEntryTournament(pageInstance);
}

const resetListenUpcomingTournamentList = (pageInstance) => {
    removeListenUpcomingTournamentList(pageInstance);
    addListenUpcomingTournamentList(pageInstance);
}

const addListenFinishedTournamentDetail = (pageInstance) => {
    addListenLinkTournamentDetail(pageInstance);
}

export {
    removeListenEntryTournament,
    removeListenCancelEntryTournament,
    addListenerToList,
    addListenCancelEntryTournament,
    resetListenUpcomingTournamentList,
    addListenFinishedTournamentDetail
}