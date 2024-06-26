'use strict';

import PageBase from './PageBase.js';
import { SiteInfo } from "../modules/SiteInfo.js";
import { labels } from '../modules/labels.js';
import { updateFriendsList, updateFriendRequestList } from '../modules/friendList.js';
import { removeListenMatchRequest, removeListenAcceptFriendRequest, removeListenDeclineFriendRequest, removeListenRemoveFriend }
    from '../modules/friendListener.js';

export default class Dashboard extends PageBase {
    constructor(params) {
        super(params);
        Dashboard.instance = this;
        this.siteInfo = new SiteInfo();
        this.setTitle(`${labels.dashboard.title}: ${this.siteInfo.getUsername()}`);
        this.clearBreadcrumb();

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
                    <section class="blockDashboardLog">
                        <h3 class="blockDashboardLog_title unitTitle1">${labels.match.labelMatchLog}</h3>
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
                        <h3 class="blockDashboardLog_title unitTitle1">${labels.tournament.labelTournamentLog}</h3>
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
