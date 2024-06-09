'use strict';

import PageBase from './PageBase.js';
import { getUserList } from '../modules/users.js';
import { showModalMatchRequest } from '../modules/modal.js';


export default class extends PageBase {
    constructor(params) {
        super(params);
        this.playerNameTmp = 'playername';
        this.setTitle(`Dashboard: ${this.playerNameTmp}`);
        this.labelMatch = '対戦する';
        this.labelAccept = '承諾';
        this.labelReject = '拒絶';
        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.showUserList.bind(this));
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
                        <div class="blockFriendRequest_friends listFriends listLineDivide">
                            <section class="unitFriend">
                                <header class="unitFriend_header">
                                    <h4 class="unitFriend_name">username</h4>
                                    <p class="unitFriend_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="" width="100" height="100"></p>
                                </header>
                                <ul class="unitFriendButton unitListBtn unitListBtn-horizontal">
                                    <li><button type="button" class="unitFriendButton_friendAccept unitButton btnAccept">${this.labelAccept}</button></li>
                                    <li><button type="button" class="unitFriendButton_friendReject unitButtonReject btnReject">${this.labelReject}</button></li>
                                </ul>
                            </section>
                            <section class="unitFriend">
                                <header class="unitFriend_header">
                                    <h4 class="unitFriend_name">username</h4>
                                    <p class="unitFriend_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="" width="100" height="100"></p>
                                </header>
                                <ul class="unitFriendButton unitListBtn unitListBtn-horizontal">
                                    <li><button type="button" class="unitFriendButton_friendAccept unitButton btnAccept">${this.labelAccept}</button></li>
                                    <li><button type="button" class="unitFriendButton_friendReject unitButtonReject btnReject">${this.labelReject}</button></li>
                                </ul>
                            </section>
                            <section class="unitFriend">
                                <header class="unitFriend_header">
                                    <h4 class="unitFriend_name">username</h4>
                                    <p class="unitFriend_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="" width="100" height="100"></p>
                                </header>
                                <ul class="unitFriendButton unitListBtn unitListBtn-horizontal">
                                    <li><button type="button" class="unitFriendButton_friendAccept unitButton btnAccept">${this.labelAccept}</button></li>
                                    <li><button type="button" class="unitFriendButton_friendReject unitButtonReject btnReject">${this.labelReject}</button></li>
                                </ul>
                            </section>
                        </div>
                    </section>
                    <section class="blockFriends">
                        <h3 class="blockFriends_title unitTitle1">Friends</h3>
                        <!-- ↓ showUserList() で取得 -->
                        <div class="blockFriends_friends listFriends listLineDivide"></div>
                        <!-- ↓ オンライン状況ごとのstyleサンプル -->
                        <div class="blockFriends_friends listFriends listLineDivide">
                            <section class="unitFriend unitFriend-online">
                                <header class="unitFriend_header">
                                    <h4 class="unitFriend_name">username</h4>
                                    <p class="unitFriend_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="[ONLINE]" width="100" height="100"></p>
                                </header>
                                <ul class="unitFriendButton unitListBtn unitListBtn-horizontal">
                                    <li><button type="button" class="unitFriendButton_matchRequest unitButton">${this.labelMatch}</button></li>
                                </ul>
                            </section>
                            <section class="unitFriend unitFriend-offline">
                                <header class="unitFriend_header">
                                    <h4 class="unitFriend_name">username</h4>
                                    <p class="unitFriend_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="[OFFLINE]" width="100" height="100"></p>
                                </header>
                                <ul class="unitFriendButton unitListBtn unitListBtn-horizontal">
                                    <li><button type="button" class="unitFriendButton_matchRequest unitButton" disabled>${this.labelMatch}</button></li>
                                </ul>
                            </section>
                            <section class="unitFriend unitFriend-busy">
                                <header class="unitFriend_header">
                                    <h4 class="unitFriend_name">username</h4>
                                    <p class="unitFriend_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="[BUSY]" width="100" height="100"></p>
                                </header>
                                <ul class="unitFriendButton unitListBtn unitListBtn-horizontal">
                                    <li><button type="button" class="unitFriendButton_matchRequest unitButton" disabled>${this.labelMatch}</button></li>
                                </ul>
                            </section>
                        </div>
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
        const listFriendsWrapper = document.querySelector('.blockFriends_friends');
        getUserList()
            .then(data => {
                listFriendsWrapper.innerHTML = '';
                const userElements = data.map(user => `
                    <section class="unitFriend">
                        <header class="unitFriend_header">
                            <h4 class="unitFriend_name">${user.username}</h4>
                            <p class="unitFriend_thumb"><img src="//ui-avatars.com/api/?name=${user.username}&background=3cbbc9&color=ffffff" alt="" width="100" height="100"></p>
                        </header>
                        <ul class="unitFriendButton unitListBtn unitListBtn-horizontal">
                            <li><button type="button" class="unitFriendButton_matchRequest unitButton" data-name="${user.username}" data-avatar="//ui-avatars.com/api/?name=${user.username}&background=3cbbc9&color=ffffff">${this.labelMatch}</button></li>
                        </ul>
                    </section>
                  `);
                listFriendsWrapper.innerHTML = userElements.join('');
            })
            .then(()=> {
                this.listenRequestMatch();
            })
            .catch(error => {
                console.error('getUserInfo failed:', error);
            })
    }

    listenRequestMatch() {
        const btnMatchRequest = document.querySelectorAll('.unitFriendButton_matchRequest');
        btnMatchRequest.forEach((btn) => {
            btn.addEventListener('click', showModalMatchRequest.bind(this));
            this.addListenEvent(btn, showModalMatchRequest, 'click');//todo: rm 確認
        });
    }
}
