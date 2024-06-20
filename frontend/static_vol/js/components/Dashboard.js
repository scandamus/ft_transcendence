'use strict';

import PageBase from './PageBase.js';
import { updateFriendsList, updateFriendRequestList } from '../modules/friendList.js';
import {
    removeListenMatchRequest, updateListenMatchRequest,
    removeListenAcceptFriendRequest, updateListenAcceptFriendRequest,
    removeListenDeclineFriendRequest, updateListenDeclineFriendRequest,
    removeListenRemoveFriend, updateListenRemoveFriend
} from '../modules/friendListener.js';

export default class Dashboard extends PageBase {
    constructor(params) {
        super(params);
        Dashboard.instance = this;
        this.playerNameTmp = 'playername';
        this.setTitle(`Dashboard: ${this.playerNameTmp}`);
        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.showUserList.bind(this));

        this.listListenMatchRequest = [];
        this.listListenAcceptFriendRequest = [];
        this.listListenDeclineFriendRequest = [];
        this.listListenRemoveFriend = [];
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

    removeEventListeners() {
        removeListenMatchRequest(this);
        removeListenAcceptFriendRequest(this);
        removeListenDeclineFriendRequest(this);
        removeListenRemoveFriend(this);
    }

    listenRequest() {
        this.removeEventListeners();

        updateListenMatchRequest(this);
        updateListenAcceptFriendRequest(this);
        updateListenDeclineFriendRequest(this);
        updateListenRemoveFriend(this);
    }

    destroy() {
        this.removeEventListeners();
        super.destroy();
    }
}
