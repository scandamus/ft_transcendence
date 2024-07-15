'use strict';

import { labels } from "./labels.js";
import { fetchTournaments } from "./tounamentApi.js";
import { formatDateToLocal } from "./formatDateToLocal.js";
import { resetListenUpcomingTournamentList, addListenFinishedTournamentDetail, addListenLinkTournamentEntered } from "./tournamentListListener.js";

const updateUpcomingTournamentList = async (pageInstance) => {
    try {
        const tournaments = await fetchTournaments('upcoming');
        const listWrapper = document.querySelector('.blockTournamentList_upcoming');        
        if (tournaments.length === 0) {
            listWrapper.innerHTML = `<p>${'No upcoming tournament'}</p>`;
//            listWrapper.innerHTML = `<p>${labels.tournament.msgNoUpcoming}</p>`;
        } else {
            listWrapper.innerHTML = '';
            tournaments.forEach(tournament => {
                const formatedStartDate = formatDateToLocal(tournament.start);
                let nicknameHtml = '';
                let buttonHtml = '';
                if (tournament.nickname != '') {
                    nicknameHtml = `<p class="unitTournament_nickname">as ${tournament.nickname}</p>`;
                    buttonHtml = `<p class="blockForm_button"><button type="submit" class="unitUpcomingTournamentButton_cancel unitButtonDecline" data-name="${tournament.name}" data-id="${tournament.id}">${labels.tournament.labelCancelEntry}</button></p>`;                   
                } else if (tournament.current_participants >= tournament.max_participants) {
                    buttonHtml = `<p class="blockForm_label">FULL</p>`;
                //    buttonHtml = `<p class="blockForm_button"><button type="button" disabled>${labels.tournament.labelFull}</p>`;
                } else if (tournament.nickname === '') {
                    buttonHtml = `<p class="blockForm_button"><button type="button" class="unitUpcomingTournamentButton_entry unitButton">${labels.tournament.labelEntry}</button></p>`;
                } 
                const tournamentElement = `
                    <section class="unitTournament">
                        <header class="unitTournament_header">
                            <h4 class="unitTournament_title">${tournament.name}</h4>
                            <p class="unitTournament_start">${formatedStartDate}</p>
                        </header>
                        <div class="unitTournament_body">
                            <p class="unitTournament_capacity">( <strong>${tournament.current_participants}</strong> / ${tournament.max_participants} )</p>
                            ${nicknameHtml}
                            <form class="unitTournament_form" action="" method="post">
                                <input type="hidden" name="idTitle" value="${tournament.id}">
                                <input type="hidden" name="title" value="${tournament.name}">
                                <input type="hidden" name="start" value="${formatedStartDate}">
                                ${buttonHtml}
                            </form>
                        </div>
                    </section>
                `;
                listWrapper.innerHTML += tournamentElement;
            });
            resetListenUpcomingTournamentList(pageInstance)
        }
    } catch (error) {
        console.error('Failed to update upcoming tournaments list: ', error);
    }
};

const updateOngoingTournamentList = async (pageInstance) => {
    try {
        const tournaments = await fetchTournaments('ongoing');
        const listWrapper = document.querySelector('.blockTournamentList_ongoing');        
        if (tournaments.length === 0) {
            listWrapper.innerHTML = `<p>${'No ongoing tournament'}</p>`;
//            listWrapper.innerHTML = `<p>${labels.tournament.msgNoOngoing}</p>`;
        } else {
            listWrapper.innerHTML = '';
            tournaments.forEach(tournament => {
                const formatedStartDate = formatDateToLocal(tournament.start);
                const nicknameHtml = tournament.nickname ? `
                    <div class="unitTournament_body">
                        <p class="unitTournament_nickname">as ${tournament.nickname}</p>
                    </div>`:'';
                const tournamentElement = `
                    <section class="unitTournament unitTournament-link">
                        <span>
                            <header class="unitTournament_header">
                                <h4 class="unitTournament_title">${tournament.name}</h4>
                                <p class="unitTournament_start">${formatedStartDate}</p>
                            </header>
                            ${nicknameHtml}
                        </span>
                    </section>
                `;
                listWrapper.innerHTML += tournamentElement;
            });
        }
    } catch (error) {
        console.error('Failed to update upcoming tournaments list: ', error);
    }
};

const updateFinishedTournamentList = async (pageInstance) => {
    try {
        const tournaments = await fetchTournaments('finished');
        const listWrapper = document.querySelector('.blockTournamentList_finished');
        if (tournaments.length === 0) {
            listWrapper.innerHTML = `<p>${'No finished tournament'}</p>`;
//            listWrapper.innerHTML = `<p>${labels.tournament.msgNoOngoing}</p>`;
        } else {
            listWrapper.innerHTML = '';
            tournaments.forEach(tournament => {
                const formatedStartDate = formatDateToLocal(tournament.start);
                const nicknameHtml = tournament.nickname ? `
                    <div class="unitTournament_body">
                        <p class="unitTournament_nickname">as ${tournament.nickname}</p>
                    </div>`:'';
                const tournamentElement = `
                    <section class="unitTournament unitTournament-link">
                        <a href="/tournament/detail:${tournament.id}" data-link>
                            <header class="unitTournament_header">
                                <h4 class="unitTournament_title">${tournament.name}</h4>
                                <p class="unitTournament_start">${formatedStartDate}</p>
                            </header>
                            ${nicknameHtml}
                        </a>
                    </section>
                `;
                listWrapper.innerHTML += tournamentElement;
            });
            addListenFinishedTournamentDetail(pageInstance)
        }
    } catch (error) {
        console.error('Failed to update upcoming tournaments list: ', error);
    }
};

const getTournamentLog = async (pageInstance) => {
    try {
        const tournaments = await fetchTournaments('finished');
        console.log(`${tournaments}`)
        const listWrapper = document.querySelector('.blockDashboardLog_listTournament');
        listWrapper.innerHTML = '';
        tournaments.forEach(tournament => {
            if (tournament.nickname) {
                const formatedStartDate = formatDateToLocal(tournament.start);
                let rankHtml = ``;
                if (tournament.rank === 'winner') {
                    rankHtml = `<p class="unitTournament_rank">${labels.tournament.labelWinner}</p>`;
                } else if (tournament.rank === 'second_place') {
                    rankHtml = `<p class="unitTournament_rank">${labels.tournament.labelSecondPlace}</p>`;
                } else if (tournament.rank === 'third_place') {
                    rankHtml = `<p class="unitTournament_rank">${labels.tournament.labelThirdPlace}</p>`;
                }
                const nicknameHtml = `
                    <div class="unitTournament_body">
                        <p class="unitTournament_nickname">as ${tournament.nickname}</p>
                        ${rankHtml}
                    </div>`;
                const tournamentElement = `
                    <section class="unitTournamentResult unitTournament-link">
                        <a href="/tournament/detail:${tournament.id}" data-link>
                            <header class="unitTournament_header">
                                <h4 class="unitTournament_title">${tournament.name}</h4>
                                <p class="unitTournament_start">${formatedStartDate}</p>
                            </header>
                            ${nicknameHtml}
                        </a>
                    </section>
                `;
                listWrapper.innerHTML += tournamentElement;
            }
        });
        if (listWrapper.innerHTML === '') {
            listWrapper.innerHTML = `<p>${labels.tournament.msgNoEntered}</p>`;
        } else {
            addListenLinkTournamentEntered(pageInstance);
        }
    } catch (error) {
        console.error('Failed to entered tournaments list: ', error);
    }
};

export { updateUpcomingTournamentList, updateOngoingTournamentList, updateFinishedTournamentList, getTournamentLog };