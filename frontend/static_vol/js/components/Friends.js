'use strict';

import PageBase from './PageBase.js';
//import { getUserList } from "../modules/users.js";
//import { join_game } from "../modules/match.js";
//import { showModal } from "../modules/modal.js";
import { webSocketManager } from '../modules/websocket.js';
import { initToken } from '../modules/token.js';
import { pongHandler } from '../modules/websocketHandler.js';
import { fetchFriends, fetchFriendRequests } from '../modules/friendsApi.js';
import { sendFriendRequest, acceptFriendRequest, declineFriendRequest, removeFriend } from '../modules/friendsRequest.js';
import { labels } from '../modules/labels.js';
import { pageInstances } from '../modules/pageInstances.js';
import { showModalSendMatchRequest } from '../modules/modal.js';
import { checkSimpleInputValid } from "../modules/form.js";

export default class Friends extends PageBase {
    constructor(params) {
        super(params);
        this.setTitle('Friends');
        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.showUserList.bind(this));
        //this.addAfterRenderHandler(this.listenSearchFriends.bind(this));
        pageInstances.setInstance('Friends', this);

        this.showModalSendMatchRequestHandlerBound = this.showModalSendMatchRequestHandler.bind(this);
        this.acceptFriendRequestHandlerBound = this.acceptFriendRequestHandler.bind(this);
        this.declineFriendRequestHandlerBound = this.declineFriendRequestHandler.bind(this);
        this.removeFriendHandlerBound = this.removeFriendHandler.bind(this);
        this.handleSearchFriendBound = this.handleSearchFriend.bind(this);

        //ページ破棄のタイミングでイベントリスナーを削除
//        window.addEventListener('beforeunload', this.cleanup.bind(this));
    }

    // cleanup() {
    //     this.removeEventListeners();
    //     pageInstances.removeInstance('Friends');
    // }
    async renderHtml() {
        return `
            <div class="blockUsers">
                <div class="blockUsers_column">
                    <section class="blockFriends">
                        <h3 class="blockFriends_title unitTitle1">Your Friends</h3>
                        <div class="blockFriends_friends listFriends listLineDivide"></div>
                    </section>
                </div>
                <div class="blockUsers_column">
                    <section class="blockFriendRequest">
                        <h3 class="blockFriendRequest_title unitTitle2">Received friend request</h3>
                        <div class="blockFriendRequest_friends listFriends listLineDivide"></div>
                    </section>
                    <section class="blockSearchFriend">
                        <h3 class="blockSearchFriend_title unitTitle1">Search Friends</h3>
                        <form action="" method="post" class="blockSearchFriend_form blockForm" id="friendSearchForm">
                            <p class="blockForm_input"><input type="text" id="inputFriendsName" name="nameFriend" placeholder="Enter friend's name" pattern="(?=.*[a-z0-9])[a-z0-9_]+" minlength="3" maxlength="32" required></p>
                            <p class="blockForm_button"><button type="submit" id="btnSearchFriend" class="unitButton">${labels.labelSearch}</button></p>
                            <ul class="listError"></ul>
                        </form>
                    </section>
                    <section class="blockFriendRecommended">
                        <h3 class="blockFriendRecommended_title unitTitle1">Recommended</h3>
                        <div class="blockFriendRecommended_friends listFriends listLineDivide">
                            <section class="unitFriend">
                                <header class="unitFriend_header">
                                    <h4 class="unitFriend_name">username</h4>
                                    <p class="unitFriend_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="" width="100" height="100"></p>
                                </header>
                                <ul class="unitFriendButton unitListBtn unitListBtn-horizontal">
                                    <li><button type="button" class="unitFriendButton_matchRequest unitButton btnApply">${labels.labelApply}</button></li>
                                </ul>
                            </section>
                            <section class="unitFriend">
                                <header class="unitFriend_header">
                                    <h4 class="unitFriend_name">01234567890123456789012345678901</h4>
                                    <p class="unitFriend_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="" width="100" height="100"></p>
                                </header>
                                <ul class="unitFriendButton unitListBtn unitListBtn-horizontal">
                                    <li><button type="button" class="unitFriendButton_matchRequest unitButton btnApply">${labels.labelApply}</button></li>
                                </ul>
                            </section>
                            <section class="unitFriend">
                                <header class="unitFriend_header">
                                    <h4 class="unitFriend_name">012</h4>
                                    <p class="unitFriend_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="" width="100" height="100"></p>
                                </header>
                                <ul class="unitFriendButton unitListBtn unitListBtn-horizontal">
                                    <li><button type="button" class="unitFriendButton_matchRequest unitButton btnApply">${labels.labelApply}</button></li>
                                </ul>
                            </section>
                        </div>
                    </section>
                </div>
            </div>
            <ol class="breadcrumb">
            <li><a href="/">dashboard</a></li>
            <li>Friends</li>
            </ol>
        `;
    }

    updateFriendsList = async () => {
        console.log('updateFriendList in');
        try {
            const friends = await fetchFriends();
            const listFriendsWrappr = document.querySelector('.blockFriends_friends');
            if (friends.length === 0) {
                listFriendsWrappr.innerHTML = `<p>${labels.msgNoFriends}</p>`
            } else {
                listFriendsWrappr.innerHTML = '';
                friends.forEach(friend => {
                    const friendElement = `
                        <section class="unitFriend">
                            <header class="unitFriend_header">
                                <h4 class="unitFriend_name">${friend.username}</h4>
                                <p class="unitFriend_thumb"><img src="//ui-avatars.com/api/?name=${friend.username}&background=3cbbc9&color=ffffff" alt="" width="100" height="100"></p>
                            </header>
                            <ul class="unitFriendButton unitListBtn unitListBtn-horizontal">
                                <li><button type="button" class="unitFriendButton_matchRequest unitButton" data-username="${friend.username}">${labels.labelMatch}</button></li>
                                <li><button type="button" class="unitFriendButton_removeFriend unitButton" data-username="${friend.username}">${labels.labelRmFriend}</button></li>
                            </ul>
                        </section>
                    `;
                    listFriendsWrappr.innerHTML += friendElement;
                });
            }
        } catch (error) {
            console.error('Failed to update friends list: ', error);
        }
    }
    
    updateFriendRequestList = async () => {
        console.log('updateFriendRequestList in');
        try {
            const requests = await fetchFriendRequests();
                const secRequestWrapper = document.querySelector('.blockFriendRequest');
                const listRequestWrapper = document.querySelector('.blockFriendRequest_friends');
            if (requests.length === 0) {
                if (!secRequestWrapper.classList.contains('is-noRequest')) {
                    secRequestWrapper.classList.add('is-noRequest');
                }
            } else {
                if (secRequestWrapper.classList.contains('is-noRequest')) {
                    secRequestWrapper.classList.remove('is-noRequest');
                }
                listRequestWrapper.innerHTML = '';
                requests.forEach(request => {
                    const requestElement = `
                        <section class="unitFriend">
                            <header class="unitFriend_header">
                                <h4 class="unitFriend_name">${request.from_user}</h4>
                                <p class="unitFriend_thumb"><img src="//ui-avatars.com/api/?name=${request.from_user}&background=3cbbc9&color=ffffff" alt="" width="100" height="100"></p>
                            </header>
                            <ul class="unitFriendButton unitListBtn unitListBtn-horizontal">
                                <li><button type="button" class="unitFriendButton_friendAccept unitButton btnAccept" data-username="${request.from_user}" data-id="${request.id}">${labels.labelAccept}</button></li>
                                <li><button type="button" class="unitFriendButton_friendDecline unitButtonDecline unitButtonDecline-ico" data-username="${request.from_user}" data-id="${request.id}"><img src="/images/ico-cross.svg" alt="${labels.labelDecline}" width="16px" height="16px"></button></li>
                            </ul>
                        </section>
                    `;
                    listRequestWrapper.innerHTML += requestElement;
                });
            }
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
            await this.updateFriendsList();
            await this.updateFriendRequestList();
            this.listenRequest();
        } catch (error) {
            console.error('Failed to update lists: ', error);
            throw error;
        }
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
    
        const btnRemoveFriend = document.querySelectorAll('.unitFriendButton_removeFriend');
        btnRemoveFriend.forEach((btn) => {
            btn.removeEventListener('click', this.removeFriendHandlerBound);
            console.log(`Removed remove friend listener from ${btn.dataset.username}`);
        });
    
        const friendSearchForm = document.getElementById('friendSearchForm');
        friendSearchForm.removeEventListener('submit', this.handleSearchFriendBound);
        console.log(`Removed friend search form listener`);
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

        const btnRemoveFriend = document.querySelectorAll('.unitFriendButton_removeFriend');
        btnRemoveFriend.forEach((btn) => {
            btn.addEventListener('click', (event) => {
                const username = event.target.dataset.username;
                this.removeFriendHandlerBound(username);
                console.log(`Remove Friend ${username}`);
            });
            console.log(`Added remove friend listener to ${btn.dataset.username}`);
        });

        const friendSearchForm = document.getElementById('friendSearchForm');
        friendSearchForm.addEventListener('submit', this.handleSearchFriendBound);
        console.log(`Added friend search form listener`);
    }

    async handleSearchFriend(event) {
        event.preventDefault();
        const inputFriendsName = document.getElementById('inputFriendsName').value;
        if (inputFriendsName === '') {
            alert(labels.msgNoUsername);
            return;
        }
        const message = {
            action: 'requestByUsername',
            username: inputFriendsName,
        };
        try {
            const accessToken = await initToken();
            await webSocketManager.openWebSocket('lounge', pongHandler);
            webSocketManager.sendWebSocketMessage('lounge', message);
        } catch (error) {
            console.error('Failed to open or send through WebSocket: ', error);
        } finally {
            document.getElementById('inputFriendsName').value = '';
        }
    }

    listenSearchFriends() {
        const btnSearchFriend = document.getElementById('btnSearchFriend');
        btnSearchFriend.addEventListener('click', this.searchAndSendFriendRequest.bind(this));
        this.addListenEvent(btnSearchFriend, this.searchAndSendFriendRequest, 'click');//todo: rm 確認
    }

    searchAndSendFriendRequest(ev) {
        ev.preventDefault();
        const inputFriendsName = document.getElementById('inputFriendsName');
        checkSimpleInputValid(inputFriendsName);
        if (!ev.target.closest('form').checkValidity()) {
            return;
        }
        const friendsName = inputFriendsName.value;
        if (friendsName === "000") {
            this.addNotice(`${friendsName}に友達申請を送りました`, false);
        } else if (friendsName === "111") {
            this.addNotice(`${friendsName}は存在しません`, true);
        } else {
            this.addNotice(`${friendsName}はすでに友達です`, true);
        }
        inputFriendsName.value = '';
    }
}
