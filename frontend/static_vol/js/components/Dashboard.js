'use strict';

import PageBase from './PageBase.js';
import { getUserList } from '../modules/users.js';
//import { showModal } from '../modules/modal.js';
//import { join_game } from '../modules/match.js';
import { fetchFriends, fetchFriendRequests } from '../modules/friendsApi.js';
import { sendFriendRequest, acceptFriendRequest, declineFriendRequest, removeFriend } from '../modules/friendsRequest.js';
import { labels } from '../modules/labels.js';
import { pageInstances } from '../modules/pageInstances.js';
import { showModalSendMatchRequest } from '../modules/modal.js';
import { updateFriendsList, updateFriendRequestList } from '../modules/friendList.js';


export default class Dashboard extends PageBase {
    constructor(params) {
        super(params);

        this.playerNameTmp = 'playername';
        this.title = `Dashboard: ${this.playerNameTmp}`;
        this.setTitle(this.title);
        this.clearBreadcrumb();

        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.showUserList.bind(this));
        pageInstances.setInstance('Dashboard', this);

        this.showModalSendMatchRequestHandlerBound = this.showModalSendMatchRequestHandler.bind(this);
        this.acceptFriendRequestHandlerBound = this.acceptFriendRequestHandler.bind(this);
        this.declineFriendRequestHandlerBound = this.declineFriendRequestHandler.bind(this);
    }

    async renderHtml() {
        return `
            <div class="blockPlayerDetail">
                <div class="blockPlayerDetail_profile">
                    <p class="blockPlayerDetail_thumb thumb"><img src="//ui-avatars.com/api/?name=Gg Hh&background=872bac&color=ffffff" alt="" width="200" height="200"></p>
                    <p class="blockPlayerDetail_score unitBox">RANK: 4 <br>(70勝20敗)</p>
                    <ul class="unitListBtn unitListBtn-w100">
                        <li><a href="/lounge" class="unitButton" data-link>Lounge</a></li>
                        <li><a href="/tournament" class="unitButton" data-link>Tournament</a></li>
                    </ul>
                </div>
                <div class="blockPlayerDetail_detail">
                    <section class="blockFriendRequest">
                        <h3 class="blockFriendRequest_title unitTitle2">Received friend request</h3>
                        <div class="blockFriendRequest_friends listFriends listLineDivide"></div>
                    </section>
                    <section class="blockFriends">
                        <h3 class="blockFriends_title unitTitle1">Your Friends</h3>
                        <div class="blockFriends_friends listFriends listLineDivide"></div>
                        <p class="blockFriends_link unitLinkText unitLinkText-right"><a href="/friends" class="unitLink" data-link>View all friends</a></p>
                    </section>
                    <section class="blockDashboardLog">
                        <h3 class="blockDashboardLog_title unitTitle1">Tournament Log</h3>
                        <div class="blockDashboardLog_listTournament listLineDivide">
                            <section class="unitTournamentResult unitTournament-link">
                                <a href="/tournament/detail_id" data-link>
                                    <header class="unitTournament_header">
                                        <h4 class="unitTournament_title">TournamentTitle1</h4>
                                        <p class="unitTournament_start">2024/07/3 13:00</p>
                                    </header>
                                    <div class="unitTournament_body">
                                        <p class="unitTournament_rank">Rank 1</p>
                                    </div>
                                </a>
                            </section>
                            <section class="unitTournamentResult unitTournament-link">
                                <a href="/tournament/detail_id" data-link>
                                    <header class="unitTournament_header">
                                        <h4 class="unitTournament_title">TournamentTitle2</h4>
                                        <p class="unitTournament_start">2024/07/5 21:00</p>
                                    </header>
                                    <div class="unitTournament_body">
                                        <p class="unitTournament_rank">Rank 10</p>
                                    </div>
                                </a>
                            </section>
                        </div>
                    </section>
                    <section class="blockDashboardLog">
                        <h3 class="blockDashboardLog_title unitTitle1">Match Log</h3>
                        <div class="blockDashboardLog_listTournament listLineDivide">
                            <div class="blockMatch">
                                <section class="blockMatch_player unitMatchPlayer">
                                    <header class="unitMatchPlayer_header">
                                        <img src="//ui-avatars.com/api/?name=Aa Bb&background=e3ad03&color=ffffff" alt="" width="50" height="50">
                                        <h4 class="unitMatchPlayer_title">username</h4>
                                    </header>
                                    <p class="unitMatchPlayer_score">10</p>
                                    <p class="unitMatchPlayer_result">win</p>
                                </section>
                                <p class="blockMatch_vs">VS</p>
                                <section class="blockMatch_player unitMatchPlayer">
                                    <header class="unitMatchPlayer_header">
                                        <img src="//ui-avatars.com/api/?name=aa&background=3cbbc9&color=ffffff" alt="" width="50" height="50">
                                        <h4 class="unitMatchPlayer_title">01234567890123456789012345678901</h4>
                                    </header>
                                    <p class="unitMatchPlayer_score">3</p>
                                </section>
                            </div>
                            <div class="blockMatch">
                                <section class="blockMatch_player unitMatchPlayer">
                                    <header class="unitMatchPlayer_header">
                                        <img src="//ui-avatars.com/api/?name=Aa Bb&background=e3ad03&color=ffffff" alt="" width="50" height="50">
                                        <h4 class="unitMatchPlayer_title">01234567890123456789012345678901</h4>
                                    </header>
                                    <p class="unitMatchPlayer_score">5</p>
                                </section>
                                <p class="blockMatch_vs">VS</p>
                                <section class="blockMatch_player unitMatchPlayer">
                                    <header class="unitMatchPlayer_header">
                                        <img src="//ui-avatars.com/api/?name=aa&background=3cbbc9&color=ffffff" alt="" width="50" height="50">
                                        <h4 class="unitMatchPlayer_title">username</h4>
                                    </header>
                                    <p class="unitMatchPlayer_score">10</p>
                                    <p class="unitMatchPlayer_result">win</p>
                                </section>
                            </div>
                            <div class="blockMatch">
                                <section class="blockMatch_player unitMatchPlayer">
                                    <header class="unitMatchPlayer_header">
                                        <img src="//ui-avatars.com/api/?name=Aa Bb&background=e3ad03&color=ffffff" alt="" width="50" height="50">
                                        <h4 class="unitMatchPlayer_title">01234567890123456789012345678901</h4>
                                    </header>
                                    <p class="unitMatchPlayer_score">5</p>
                                </section>
                                <p class="blockMatch_vs">VS</p>
                                <section class="blockMatch_player unitMatchPlayer">
                                    <header class="unitMatchPlayer_header">
                                        <img src="//ui-avatars.com/api/?name=aa&background=3cbbc9&color=ffffff" alt="" width="50" height="50">
                                        <h4 class="unitMatchPlayer_title">username</h4>
                                    </header>
                                    <p class="unitMatchPlayer_score">10</p>
                                    <p class="unitMatchPlayer_result">win</p>
                                </section>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        `;
    }


    showUserList() {
        this.updateLists()
            .catch(error => {
                    console.error('Failed to update lists: ', error);
            });
    }

    async updateLists() {
        try {
            await updateFriendsList(false);
            await updateFriendRequestList();
            this.listenRequest();
        } catch (error) {
            console.error('Failed to update lists: ', error);
            throw error;
        }
    }

    listenRequestMatch() {
        const btnMatchRequest = document.querySelectorAll('.unitFriendButton_matchRequest');
        btnMatchRequest.forEach((btn) => {
            btn.addEventListener('click', showModalSendMatchRequest.bind(this));
            this.addListenEvent(btn, showModalSendMatchRequest, 'click');//todo: rm 確認
        });
    }

    showModalSendMatchRequestHandler(ev) {
        showModalSendMatchRequest(ev);
    }

    acceptFriendRequestHandler(requestId) {
        acceptFriendRequest(requestId);
    }

    declineFriendRequestHandler(requestId) {
        declineFriendRequest(requestId);
    }

    removeFriendHandler(username) {
        removeFriend(username);
    }

    removeEventListeners() {
        const btnMatchRequest = document.querySelectorAll('.unitFriendButton_matchRequest');
        btnMatchRequest.forEach((btn) => {
            btn.removeEventListener('click', this.showModalSendMatchRequestHandlerBound);
            console.log(`Removed match request listener from ${btn.dataset.username}`);
        });
    
        const btnAcceptFriendRequest = document.querySelectorAll('.unitFriendButton_friendAccept');
        btnAcceptFriendRequest.forEach((btn) => {
            btn.removeEventListener('click', this.acceptFriendRequestHandlerBound);
            console.log(`Removed accept friend request listener from ${btn.dataset.username}`);
        });

        const btnDeclineFriendRequest = document.querySelectorAll('.unitFriendButton_friendDecline');
        btnDeclineFriendRequest.forEach((btn) => {
            btn.removeEventListener('click', this.declineFriendRequestHandlerBound);
            console.log(`Removed decline friend request listener from ${btn.dataset.username}`);
        });
    }

    listenRequest() {
        this.removeEventListeners();

        const btnMatchRequest = document.querySelectorAll('.unitFriendButton_matchRequest');
        btnMatchRequest.forEach((btn) => {
            btn.addEventListener('click', this.showModalSendMatchRequestHandlerBound);
            this.addListenEvent(btn, this.showModalMatchRequest, 'click');
            console.log(`Added match request listener to ${btn.dataset.username}`);
        });

        const btnAcceptFriendRequest = document.querySelectorAll('.unitFriendButton_friendAccept');
        btnAcceptFriendRequest.forEach((btn) => {
            btn.addEventListener('click', (event) => {
                const username = event.target.dataset.username;
                const requestId = event.target.dataset.id;
                this.acceptFriendRequestHandlerBound(requestId);
                console.log(`Accept friend request from ${username} with id ${requestId}`)
            });
            console.log(`Add accept friend request listner to ${btn.dataset.username}`);
        });

        const btnDeclineFriendRequest = document.querySelectorAll('.unitFriendButton_friendDecline');
        btnDeclineFriendRequest.forEach((btn) => {
            btn.addEventListener('click', (event) => {
                const username =event.target.dataset.username;
                const requestId = event.target.dataset.id;
                this.declineFriendRequestHandlerBound(requestId);
                console.log(`Decline friend request from ${username} with id ${requestId}`);
            })
            console.log(`Add decline friend request listner to ${btn.dataset.username}`);
        });
    }
}
