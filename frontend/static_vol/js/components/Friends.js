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
import { showModalSendMatchRequest } from '../modules/modal.js';
import { checkSimpleInputValid } from "../modules/form.js";
import { updateFriendsList, updateFriendRequestList } from '../modules/friendList.js';
import {
    removeListenMatchRequest, updateListenMatchRequest,
    removeListenSendFriendRequest, updateListenSendFriendRequest,
    removeListenAcceptFriendRequest, updateListenAcceptFriendRequest,
    removeListenDeclineFriendRequest, updateListenDeclineFriendRequest,
    removeListenRemoveFriend, updateListenRemoveFriend
} from '../modules/friendListener.js';

export default class Friends extends PageBase {
    constructor(params) {
        super(params);
        Friends.instance = this;
        this.setTitle('Friends');
        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.showUserList.bind(this));
        this.addAfterRenderHandler(this.listenSearchFriends.bind(this));

        this.listListenMatchRequest = [];
        this.listListenSendFriendRequest = [];
        this.listListenAcceptFriendRequest = [];
        this.listListenDeclineFriendRequest = [];
        this.listListenRemoveFriend = [];
    }

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
                                    <li><button type="button" class="unitFriendButton_friendRequest unitButton btnApply" data-username="dummy1" data-id="dummyId1">${labels.labelApply}</button></li>
                                </ul>
                            </section>
                            <section class="unitFriend">
                                <header class="unitFriend_header">
                                    <h4 class="unitFriend_name">01234567890123456789012345678901</h4>
                                    <p class="unitFriend_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="" width="100" height="100"></p>
                                </header>
                                <ul class="unitFriendButton unitListBtn unitListBtn-horizontal">
                                    <li><button type="button" class="unitFriendButton_friendRequest unitButton btnApply" data-username="dummy2" data-id="dummyId2">${labels.labelApply}</button></li>
                                </ul>
                            </section>
                            <section class="unitFriend">
                                <header class="unitFriend_header">
                                    <h4 class="unitFriend_name">012</h4>
                                    <p class="unitFriend_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="" width="100" height="100"></p>
                                </header>
                                <ul class="unitFriendButton unitListBtn unitListBtn-horizontal">
                                    <li><button type="button" class="unitFriendButton_friendRequest unitButton btnApply" data-username="dummy3" data-id="dummyId3">${labels.labelApply}</button></li>
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

    removeEventListeners() {
        removeListenMatchRequest(this);
        removeListenSendFriendRequest(this);
        removeListenAcceptFriendRequest(this);
        removeListenDeclineFriendRequest(this);
        removeListenRemoveFriend(this);
    }

    listenRequest() {
        this.removeEventListeners();

        updateListenMatchRequest(this);
        updateListenSendFriendRequest(this);
        updateListenAcceptFriendRequest(this);
        updateListenDeclineFriendRequest(this);
        updateListenRemoveFriend(this);
    }

    listenSearchFriends() {
        const btnSearchFriend = document.getElementById('btnSearchFriend');
        const boundHandleSearchFriend = this.handleSearchFriend.bind(this);
        this.addListListenInInstance(btnSearchFriend, boundHandleSearchFriend, 'click');
    }

    async handleSearchFriend(ev) {
        ev.preventDefault();
        const inputFriendsName = document.getElementById('inputFriendsName');
        checkSimpleInputValid(inputFriendsName);
        if (!ev.target.closest('form').checkValidity()) {
            return;
        }
        const message = {
            action: 'requestByUsername',
            username: inputFriendsName.value,
        };
        try {
            const accessToken = await initToken();
            await webSocketManager.openWebSocket('lounge', pongHandler);
            webSocketManager.sendWebSocketMessage('lounge', message);
        } catch (error) {
            console.error('Failed to open or send through WebSocket: ', error);
        } finally {
            inputFriendsName.value = '';
        }
    }

    destroy() {
        this.removeEventListeners();
        super.destroy();
    }
}
