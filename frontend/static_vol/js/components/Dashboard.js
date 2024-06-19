'use strict';

import PageBase from './PageBase.js';
import { getUserList } from '../modules/users.js';
//import { showModal } from '../modules/modal.js';
//import { join_game } from '../modules/match.js';
import { fetchFriends, fetchFriendRequests } from '../modules/friendsApi.js';
import { sendFriendRequest, acceptFriendRequest, declineFriendRequest, removeFriend } from '../modules/friendsRequest.js';
import { labels } from '../modules/labels.js';
import { showModalSendMatchRequest } from '../modules/modal.js';
import { updateFriendsList, updateFriendRequestList } from '../modules/friendList.js';


export default class Dashboard extends PageBase {
    constructor(params) {
        super(params);
        Dashboard.instance = this;
        this.playerNameTmp = 'playername';
        this.setTitle(`Dashboard: ${this.playerNameTmp}`);
        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.showUserList.bind(this));

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
                    <section class="blockMatchLog">
                        <h3 class="blockMatchLog_title unitTitle1">Tournament Log</h3>
                        <ul class="blockMatchLog_log listMatchLog listLineDivide">
                            <li class="listMatchLog_item"><strong>RANK: 4</strong> <span>(2024/4/2 tournament52)</span></li>
                        </ul>
                    </section>
                    <section class="blockMatchLog">
                        <h3 class="blockMatchLog_title unitTitle1">Match Log</h3>
                        <ul class="blockMatchLog_log listMatchLog listLineDivide">
                            <li class="listMatchLog_item"><strong>RANK: 4</strong> <span>(2024/4/2 tournament52)</span></li>
                        </ul>
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
            await updateFriendsList();
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
            this.addListListenInInstance(btn, showModalSendMatchRequest, 'click');//todo: rm 確認
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
            this.addListListenInInstance(btn, this.showModalMatchRequest, 'click');
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

    destroy() {
        super.destroy();
    }
}
