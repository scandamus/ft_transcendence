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
        this.playerNameTmp = 'playername'; // TODO fetch username
        this.setTitle(`${labels.dashboard.title}: ${this.playerNameTmp}`);
        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.showUserList.bind(this));
        pageInstances.setInstance('Dashboard', this);

        this.showModalSendMatchRequestHandlerBound = this.showModalSendMatchRequestHandler.bind(this);
        this.acceptFriendRequestHandlerBound = this.acceptFriendRequestHandler.bind(this);
        this.declineFriendRequestHandlerBound = this.declineFriendRequestHandler.bind(this);
    }

    async renderHtml() {
        const win = 70, loss = 20;
        const textWinLoss = (labels.match.fmtWinLoss).replace('$win', win).replace('$loss', loss);
        return `
            <div class="blockPlayerDetail">
                <div class="blockPlayerDetail_profile">
                    <p class="blockPlayerDetail_thumb thumb"><img src="//ui-avatars.com/api/?name=Gg Hh&background=872bac&color=ffffff" alt="" width="200" height="200"></p>
                    <p class="blockPlayerDetail_score unitBox">RANK: ${42} <br>${textWinLoss}</p>
                    <ul class="unitListBtn unitListBtn-w100">
                        <li><a href="/lounge" class="unitButton" data-link>${labels.lounge.title}</a></li>
                        <li><a href="/tournament" class="unitButton" data-link>${labels.tournament.title}</a></li>
                    </ul>
                </div>
                <div class="blockPlayerDetail_detail">
                    <section class="blockFriendRequest">
                        <h3 class="blockFriendRequest_title unitTitle2">${labels.friends.labelReceivedRequest}</h3>
                        <div class="blockFriendRequest_friends listFriends listLineDivide"></div>
                    </section>
                    <section class="blockFriends">
                        <h3 class="blockFriends_title unitTitle1">${labels.friends.labelListFriends}</h3>
                        <div class="blockFriends_friends listFriends listLineDivide"></div>
                        <p class="blockFriends_link unitLinkText unitLinkText-right"><a href="/friends" class="unitLink" data-link>View all friends</a></p>
                    </section>
                    <section class="blockMatchLog">
                        <h3 class="blockMatchLog_title unitTitle1">${labels.match.labelMatchLog}</h3>
                        <ul class="blockMatchLog_log listMatchLog listLineDivide">
                            <li class="listMatchLog_item"><strong>RANK: ${42}</strong> <span>${'(2024/4/2 tournament52)'}</span></li>
                        </ul>
                    </section>
                    <section class="blockMatchLog">
                        <h3 class="blockMatchLog_title unitTitle1">${labels.tournament.labelTournamentLog}</h3>
                        <ul class="blockMatchLog_log listMatchLog listLineDivide">
                            <li class="listMatchLog_item"><strong>RANK: ${42}</strong> <span>${'(2024/4/2 tournament52)'}</span></li>
                        </ul>
                    </section>
                </div>
            </div>
        `;
    }

    updateFriendsList = async () => {
        console.log('updateFriendList in');
        try {
            const friends = await fetchFriends();
            const listFriendsWrappr = document.querySelector('.blockFriends_friends');
            listFriendsWrappr.innerHTML = '';
    
            friends.forEach(friend => {
                const friendElement = `
                    <section class="unitFriend">
                        <header class="unitFriend_header">
                            <h4 class="unitFriend_name">${friend.username}</h4>
                            <p class="unitFriend_thumb"><img src="//ui-avatars.com/api/?name=${friend.username}&background=3cbbc9&color=ffffff" alt="" width="100" height="100"></p>
                        </header>
                        <ul class="unitFriendButton unitListBtn unitListBtn-horizontal">
                            <li><button type="button" class="unitFriendButton_matchRequest unitButton" data-username="${friend.username}">${labels.friends.labelMatch}</button></li>
                        </ul>
                    </section>
                `;
                listFriendsWrappr.innerHTML += friendElement;
            });
        } catch (error) {
            console.error('Failed to update friends list: ', error);
        }
    }
    
    updateFriendRequestList = async () => {
        console.log('updateFriendRequestList in');
        try {
            const requests = await fetchFriendRequests();
            const listRequestWrapper = document.querySelector('.blockFriendRequest_friends');
            listRequestWrapper.innerHTML = '';
    
            requests.forEach(request => {
                const requestElement = `
                    <section class="unitFriend">
                        <header class="unitFriend_header">
                            <h4 class="unitFriend_name">${request.from_user}</h4>
                            <p class="unitFriend_thumb"><img src="//ui-avatars.com/api/?name=${request.from_user}&background=3cbbc9&color=ffffff" alt="" width="100" height="100"></p>
                        </header>
                        <ul class="unitFriendButton unitListBtn unitListBtn-horizontal">
                            <li><button type="button" class="unitFriendButton_friendAccept unitButton btnAccept" data-username="${request.from_user}" data-id="${request.id}">${labels.friends.labelAccept}</button></li>
                            <li><button type="button" class="unitFriendButton_friendDecline unitButtonDecline unitButtonDecline-ico" data-username="${request.from_user}" data-id="${request.id}"><img src="/images/ico-cross.svg" alt="${labels.friends.labelDecline}" width="16px" height="16px"></button></li>
                        </ul>
                    </section>
                `;
                listRequestWrapper.innerHTML += requestElement;
            });
        } catch (error) {
            console.error('Failed to update friend requests: ', error);
        }
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
