'use strict';

import PageBase from './PageBase.js';
import { getUserList } from "../modules/users.js";
import { showModalSendMatchRequest } from '../modules/modal.js';
import { checkSimpleInputValid } from "../modules/form.js";

export default class extends PageBase {
    constructor(params) {
        super(params);
        this.setTitle('Friends');
        this.labelMatch = '対戦する';
        this.labelRmFriend = '友達解除';
        this.labelAccept = '承諾';
        this.labelDecline = '削除';
        this.labelApply = '友達申請';
        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.showUserList.bind(this));
        this.addAfterRenderHandler(this.listenSearchFriends.bind(this));
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
                                    <li><button type="button" class="unitFriendButton_friendAccept unitButton btnAccept">${this.labelAccept}</button></li>
                                    <li><button type="button" class="unitFriendButton_friendDecline unitButtonDecline unitButtonDecline-ico"><img src="/images/ico-cross.svg" alt="${this.labelDecline}" width="16px" height="16px"></button></li>
                                </ul>
                            </section>
                            <section class="unitFriend">
                                <header class="unitFriend_header">
                                    <h4 class="unitFriend_name">01234567890123456789012345678901</h4>
                                    <p class="unitFriend_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="" width="100" height="100"></p>
                                </header>
                                <ul class="unitFriendButton unitListBtn unitListBtn-horizontal">
                                    <li><button type="button" class="unitFriendButton_friendAccept unitButton btnAccept">${this.labelAccept}</button></li>
                                    <li><button type="button" class="unitFriendButton_friendDecline unitButtonDecline unitButtonDecline-ico"><img src="/images/ico-cross.svg" alt="${this.labelDecline}" width="16px" height="16px"></button></li>
                                </ul>
                            </section>
                            <section class="unitFriend">
                                <header class="unitFriend_header">
                                    <h4 class="unitFriend_name">012</h4>
                                    <p class="unitFriend_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="" width="100" height="100"></p>
                                </header>
                                <ul class="unitFriendButton unitListBtn unitListBtn-horizontal">
                                    <li><button type="button" class="unitFriendButton_friendAccept unitButton btnAccept">${this.labelAccept}</button></li>
                                    <li><button type="button" class="unitFriendButton_friendDecline unitButtonDecline unitButtonDecline-ico"><img src="/images/ico-cross.svg" alt="${this.labelDecline}" width="16px" height="16px"></button></li>
                                </ul>
                            </section>
                        </div>
                    </section>
                    <section class="blockSearchFriend">
                        <h3 class="blockSearchFriend_title unitTitle1">Search Friends</h3>
                        <form action="" method="post" class="blockSearchFriend_form blockForm">
                            <p class="blockForm_input"><input type="text" id="inputFriendsName" name="nameFriend" placeholder="Enter friend's name" pattern="(?=.*[a-z0-9])[a-z0-9_]+" minlength="3" maxlength="32" required></p>
                            <p class="blockForm_button"><button type="submit" id="btnSearchFriend" class="unitButton">${this.labelApply}</button></p>
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
                                    <li><button type="button" class="unitFriendButton_friendApply unitButton btnApply">${this.labelApply}</button></li>
                                </ul>
                            </section>
                            <section class="unitFriend">
                                <header class="unitFriend_header">
                                    <h4 class="unitFriend_name">01234567890123456789012345678901</h4>
                                    <p class="unitFriend_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="" width="100" height="100"></p>
                                </header>
                                <ul class="unitFriendButton unitListBtn unitListBtn-horizontal">
                                    <li><button type="button" class="unitFriendButton_friendApply unitButton btnApply">${this.labelApply}</button></li>
                                </ul>
                            </section>
                            <section class="unitFriend">
                                <header class="unitFriend_header">
                                    <h4 class="unitFriend_name">012</h4>
                                    <p class="unitFriend_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="" width="100" height="100"></p>
                                </header>
                                <ul class="unitFriendButton unitListBtn unitListBtn-horizontal">
                                    <li><button type="button" class="unitFriendButton_friendApply unitButton btnApply">${this.labelApply}</button></li>
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
                            <li><button type="button" class="unitFriendButton_matchRequest unitButton" data-name="${user.username}" data-avatar="//ui-avatars.com/api/?name=${user.username}&background=3cbbc9&color=ffffff">${this.labelMatch}</button></li>
                            <li><button type="button" class="unitFriendButton_removeFriend unitButtonDecline">${this.labelRmFriend}</button></li>
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
            btn.addEventListener('click', showModalSendMatchRequest.bind(this));
            this.addListenEvent(btn, showModalSendMatchRequest, 'click');//todo: rm 確認
        });
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
