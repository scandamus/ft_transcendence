'use strict';

import PageBase from './PageBase.js';
import { updateFriendsList, updateFriendRequestList } from '../modules/friendList.js';
import { removeListenMatchRequest, removeListenAcceptFriendRequest, removeListenDeclineFriendRequest, removeListenRemoveFriend }
    from '../modules/friendListener.js';

export default class Dashboard extends PageBase {
    constructor(params) {
        super(params);
        Dashboard.instance = this;
        this.playerNameTmp = 'playername'; // TODO fetch username
        this.setTitle(`${labels.dashboard.title}: ${this.playerNameTmp}`);
        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.updateLists.bind(this));

        //Instance固有のlistenerList
        this.listListenMatchRequest = [];
        this.listListenRemoveFriend = [];
        this.listListenAcceptFriendRequest = [];
        this.listListenDeclineFriendRequest = [];
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

    updateLists() {
        try {
            updateFriendsList(this).then(() => {});
            updateFriendRequestList(this).then(() => {});
        } catch (error) {
            console.error('Failed to update lists: ', error);
            throw error;
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
