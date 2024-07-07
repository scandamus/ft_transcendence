'use strict';

import PageBase from './PageBase.js';
import { webSocketManager } from '../modules/websocket.js';
import { initToken } from '../modules/token.js';
import { pongHandler } from '../modules/websocketHandler.js';
import { labels } from '../modules/labels.js';
import { checkSearchFriendInputValid } from "../modules/form.js";
import { updateFriendsList, updateFriendRequestList } from '../modules/friendList.js';
import { removeListenMatchRequest, removeListenAcceptFriendRequest, removeListenDeclineFriendRequest, removeListenRemoveFriend, addListenSendFriendRequest }
    from '../modules/friendListener.js';

export default class Friends extends PageBase {
    constructor(params) {
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
                            <p class="blockForm_input"><input type="text" id="inputFriendsName" name="nameFriend" placeholder="Enter friend's name" pattern="(?=.*[a-z0-9])[a-z0-9_]+" minlength="3" maxlength="32" required></p>
                            <p class="blockForm_button"><button type="submit" id="btnSearchFriend" class="unitButton">${labels.friends.labelSendRequest}</button></p>
                            <ul class="listError"></ul>
                        </form>
                    </section>
                    <section class="blockFriendRecommended">
                        <h3 class="blockFriendRecommended_title unitTitle1">${labels.friends.labelRecommended}</h3>
                        <div class="blockFriendRecommended_friends listFriends listLineDivide">
                            <section class="unitFriend">
                                <header class="unitFriend_header">
                                    <h4 class="unitFriend_name">${'username'}</h4>
                                    <p class="unitFriend_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="" width="100" height="100"></p>
                                </header>
                                <ul class="unitFriendButton unitListBtn unitListBtn-horizontal">
                                    <li><button type="button" class="unitFriendButton_matchRequest unitButton btnApply" data-username="playertest1" data-id="dummyId1">${labels.friends.labelApply}</button></li>
                                </ul>
                            </section>
                            <section class="unitFriend">
                                <header class="unitFriend_header">
                                    <h4 class="unitFriend_name">${'01234567890123456789012345678901'}</h4>
                                    <p class="unitFriend_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="" width="100" height="100"></p>
                                </header>
                                <ul class="unitFriendButton unitListBtn unitListBtn-horizontal">
                                    <li><button type="button" class="unitFriendButton_matchRequest unitButton btnApply" data-username="playertest1" data-id="dummyId2">${labels.friends.labelApply}</button></li>
                                </ul>
                            </section>
                            <section class="unitFriend">
                                <header class="unitFriend_header">
                                    <h4 class="unitFriend_name">${'012'}</h4>
                                    <p class="unitFriend_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="" width="100" height="100"></p>
                                </header>
                                <ul class="unitFriendButton unitListBtn unitListBtn-horizontal">
                                    <li><button type="button" class="unitFriendButton_matchRequest unitButton btnApply" data-username="playertest1" data-id="dummyId3">${labels.friends.labelApply}</button></li>
                                </ul>
                            </section>
                        </div>
                    </section>
                </div>
            </div>
        `;
    }

    updateLists() {
        try {
            updateFriendsList(this).then(() => {});
            updateFriendRequestList(this).then(() => {});
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
        checkSearchFriendInputValid(inputFriendsName);
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

        super.destroy();
    }
}
