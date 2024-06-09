'use strict';

import PageBase from './PageBase.js';
import { getUserList } from "../modules/users.js";
import { join_game } from "../modules/match.js";
import { showModal } from "../modules/modal.js";

export default class extends PageBase {
    constructor(params) {
        super(params);
        this.setTitle('Friends');
        this.labelMatch = '対戦する';
        this.labelCancel = 'キャンセル';
        this.labelRmFriend = '友達解除';
        this.labelAccept = '承諾';
        this.labelReject = '拒絶';
        this.labelApply = '友達申請';
        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.showUserList.bind(this));
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
                        <div class="blockFriendRequest_friends listFriends listLineDivide">
                            <section class="unitFriend">
                                <header class="unitFriend_header">
                                    <h4 class="unitFriend_name">username</h4>
                                    <p class="unitFriend_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="" width="100" height="100"></p>
                                </header>
                                <ul class="unitFriendButton unitListBtn unitListBtn-horizontal">
                                    <li><button type="button" class="unitFriendButton_matchRequest unitButton btnAccept">${this.labelAccept}</button></li>
                                    <li><button type="button" class="unitFriendButton_matchRequest unitButtonReject btnReject">${this.labelReject}</button></li>
                                </ul>
                            </section>
                            <section class="unitFriend">
                                <header class="unitFriend_header">
                                    <h4 class="unitFriend_name">username</h4>
                                    <p class="unitFriend_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="" width="100" height="100"></p>
                                </header>
                                <ul class="unitFriendButton unitListBtn unitListBtn-horizontal">
                                    <li><button type="button" class="unitFriendButton_matchRequest unitButton btnAccept">${this.labelAccept}</button></li>
                                    <li><button type="button" class="unitFriendButton_matchRequest unitButtonReject btnReject">${this.labelReject}</button></li>
                                </ul>
                            </section>
                            <section class="unitFriend">
                                <header class="unitFriend_header">
                                    <h4 class="unitFriend_name">username</h4>
                                    <p class="unitFriend_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="" width="100" height="100"></p>
                                </header>
                                <ul class="unitFriendButton unitListBtn unitListBtn-horizontal">
                                    <li><button type="button" class="unitFriendButton_matchRequest unitButton btnAccept">${this.labelAccept}</button></li>
                                    <li><button type="button" class="unitFriendButton_matchRequest unitButtonReject btnReject">${this.labelReject}</button></li>
                                </ul>
                            </section>
                        </div>
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
                                    <li><button type="button" class="unitFriendButton_matchRequest unitButton btnAccept">${this.labelApply}</button></li>
                                </ul>
                            </section>
                            <section class="unitFriend">
                                <header class="unitFriend_header">
                                    <h4 class="unitFriend_name">username</h4>
                                    <p class="unitFriend_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="" width="100" height="100"></p>
                                </header>
                                <ul class="unitFriendButton unitListBtn unitListBtn-horizontal">
                                    <li><button type="button" class="unitFriendButton_matchRequest unitButton btnAccept">${this.labelApply}</button></li>
                                </ul>
                            </section>
                            <section class="unitFriend">
                                <header class="unitFriend_header">
                                    <h4 class="unitFriend_name">username</h4>
                                    <p class="unitFriend_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="" width="100" height="100"></p>
                                </header>
                                <ul class="unitFriendButton unitListBtn unitListBtn-horizontal">
                                    <li><button type="button" class="unitFriendButton_matchRequest unitButton btnAccept">${this.labelApply}</button></li>
                                </ul>
                            </section>
                            <section class="unitFriend">
                                <header class="unitFriend_header">
                                    <h4 class="unitFriend_name">username</h4>
                                    <p class="unitFriend_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="" width="100" height="100"></p>
                                </header>
                                <ul class="unitFriendButton unitListBtn unitListBtn-horizontal">
                                    <li><button type="button" class="unitFriendButton_matchRequest unitButton btnAccept">${this.labelApply}</button></li>
                                </ul>
                            </section>
                            <section class="unitFriend">
                                <header class="unitFriend_header">
                                    <h4 class="unitFriend_name">username</h4>
                                    <p class="unitFriend_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="" width="100" height="100"></p>
                                </header>
                                <ul class="unitFriendButton unitListBtn unitListBtn-horizontal">
                                    <li><button type="button" class="unitFriendButton_matchRequest unitButton btnAccept">${this.labelApply}</button></li>
                                </ul>
                            </section>
                            <section class="unitFriend">
                                <header class="unitFriend_header">
                                    <h4 class="unitFriend_name">username</h4>
                                    <p class="unitFriend_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="" width="100" height="100"></p>
                                </header>
                                <ul class="unitFriendButton unitListBtn unitListBtn-horizontal">
                                    <li><button type="button" class="unitFriendButton_matchRequest unitButton btnAccept">${this.labelApply}</button></li>
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
        const listFriendsWrapper = document.querySelector('.listFriends');
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
                            <li><button type="submit" class="unitFriendButton_matchRequest unitButton" data-name="${user.username}" data-avatar="//ui-avatars.com/api/?name=${user.username}&background=3cbbc9&color=ffffff">${this.labelMatch}</button></li>
                            <li><button type="button" class="unitFriendButton_matchRequest unitButtonReject btnReject">${this.labelRmFriend}</button></li>
                        </ul>
                    </section>
                    <section class="unitFriend">
                        <header class="unitFriend_header">
                            <h4 class="unitFriend_name">${user.username}</h4>
                            <p class="unitFriend_thumb"><img src="//ui-avatars.com/api/?name=${user.username}&background=3cbbc9&color=ffffff" alt="" width="100" height="100"></p>
                        </header>
                        <ul class="unitFriendButton unitListBtn unitListBtn-horizontal">
                            <li><button type="submit" class="unitFriendButton_matchRequest unitButton" data-name="${user.username}" data-avatar="//ui-avatars.com/api/?name=${user.username}&background=3cbbc9&color=ffffff">${this.labelMatch}</button></li>
                            <li><button type="button" class="unitFriendButton_matchRequest unitButtonReject btnReject">${this.labelRmFriend}</button></li>
                        </ul>
                    </section>
                    <section class="unitFriend">
                        <header class="unitFriend_header">
                            <h4 class="unitFriend_name">${user.username}</h4>
                            <p class="unitFriend_thumb"><img src="//ui-avatars.com/api/?name=${user.username}&background=3cbbc9&color=ffffff" alt="" width="100" height="100"></p>
                        </header>
                        <ul class="unitFriendButton unitListBtn unitListBtn-horizontal">
                            <li><button type="submit" class="unitFriendButton_matchRequest unitButton" data-name="${user.username}" data-avatar="//ui-avatars.com/api/?name=${user.username}&background=3cbbc9&color=ffffff">${this.labelMatch}</button></li>
                            <li><button type="button" class="unitFriendButton_matchRequest unitButtonReject btnReject">${this.labelRmFriend}</button></li>
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
            btn.addEventListener('click', this.showModalMatchRequest.bind(this));
            this.addListenEvent(btn, this.showModalMatchRequest, 'click');//todo: rm 確認
        });
    }

    showModalMatchRequest(ev) {
        const button = ev.target;
        const elHtml = `
            <section class="blockModal">
                <h2 class="blockModal_title">対戦を申し込みました</h2>
                <section class="blockOpponent">
                    <h4 class="blockOpponent_name">${button.dataset.name}</h4>
                    <p class="blockOpponent_thumb"><img src="${button.dataset.avatar}" alt="" width="200" height="200"></p>
                </section>
                <p class="blockBtnCancel">
                    <button type="submit" class="blockBtnCancel_button unitButton unitButton-small">${this.labelCancel}</button>
                </p>
                <div id="indicator" class="blockModal_indicator unitIndicator">
                    <div class="unitIndicator_bar"></div>
                </div>
            </section>
        `;

        //todo: 対戦相手に通知、承諾 or Rejectを受け付けるなど
        join_game()
            .then(r => {
                showModal(elHtml);
            });
    }
}
