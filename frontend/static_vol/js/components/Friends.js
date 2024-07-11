'use strict';

import PageBase from './PageBase.js';
import { webSocketManager } from '../modules/websocket.js';
import { initToken } from '../modules/token.js';
import { pongHandler } from '../modules/websocketHandler.js';
import { labels } from '../modules/labels.js';
import { checkSimpleInputValid } from "../modules/form.js";
import { updateFriendsList, updateFriendRequestList, updateRecommend } from '../modules/friendList.js';
import { removeListenMatchRequest, removeListenAcceptFriendRequest, removeListenDeclineFriendRequest, removeListenRemoveFriend, addListenSendFriendRequest }
    from '../modules/friendListener.js';

export default class Friends extends PageBase {
    static instance = null;

    constructor(params) {
        if (Friends.instance) {
            return Friends.instance;
        }
        super(params);
        Friends.instance = this;
        this.title = labels.friends.title;
        this.setTitle(this.title);
        this.generateBreadcrumb(this.title, this.breadcrumbLinks);

        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.updateLists.bind(this));
        this.addAfterRenderHandler(this.listenSearchFriends.bind(this));

        //Instance固有のlistenerList
        this.listListenMatchRequest = [];
        this.listListenRemoveFriend = [];
        this.listListenAcceptFriendRequest = [];
        this.listListenDeclineFriendRequest = [];
    }

    async renderHtml() {
        return `
            <div class="blockUsers">
                <div class="blockUsers_column">
                    <section class="blockFriends">
                        <h3 class="blockFriends_title unitTitle1">${labels.friends.labelListFriends}</h3>
                        <div class="blockFriends_friends listFriends listLineDivide"></div>
                    </section>
                </div>
                <div class="blockUsers_column">
                    <section class="blockFriendRequest">
                        <h3 class="blockFriendRequest_title unitTitle2">${labels.friends.labelReceivedRequest}</h3>
                        <div class="blockFriendRequest_friends listFriends listLineDivide"></div>
                    </section>
                    <section class="blockSearchFriend">
                        <h3 class="blockSearchFriend_title unitTitle1">${labels.friends.labelSearch}</h3>
                        <form action="" method="post" class="blockSearchFriend_form blockForm" id="friendSearchForm">
                            <p class="blockForm_input"><input type="text" id="inputFriendsName" name="nameFriend" placeholder="Enter friend's name" pattern="(?=.*[a-z0-9])[a-z0-9_]+" minlength="3" maxlength="32" aria-describedby="errorInputFriendsName" required aria-required="true" /></p>
                            <p class="blockForm_button"><button type="submit" id="btnSearchFriend" class="unitButton">${labels.friends.labelSendRequest}</button></p>
                            <ul id="errorInputFriendsName" class="listError"></ul>
                        </form>
                    </section>
                    <section class="blockFriendRecommended">
                        <h3 class="blockFriendRecommended_title unitTitle1">${labels.friends.labelRecommended}</h3>
                        <div class="blockFriendRecommended_friends listFriends listLineDivide"></div>
                    </section>
                </div>
            </div>
        `;
    }

    updateLists() {
        try {
            updateFriendsList(this).then(() => {});
            updateFriendRequestList(this).then(() => {});
            updateRecommend(this).then(() => {});
            //recommendedのaddListener
            addListenSendFriendRequest(this);
        } catch (error) {
            console.error('Failed to update lists: ', error);
            throw error;
        }
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
            type: 'friendRequest',
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
        //rmFriendsList
        removeListenMatchRequest(this);
        removeListenRemoveFriend(this);
        //rmFriendRequestList
        removeListenAcceptFriendRequest(this);
        removeListenDeclineFriendRequest(this);

        Friends.instance = null;
        super.destroy();
    }
}
