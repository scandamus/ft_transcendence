'use strict';

import PageBase from './PageBase.js';
import { getUserList } from '../modules/users.js';
import { showModalWaitMatch } from '../modules/match.js';

export default class extends PageBase {
    constructor(params) {
        super(params);
        this.userName = 'user1';
        this.labelMatch = '対戦する';
        this.setTitle(`USER: ${this.userName}`);
        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.showUserList.bind(this));
        this.addAfterRenderHandler(this.showModal.bind(this));
    }

    async renderHtml() {
        return `
            <div class="blockPlayerDetail">
                <div class="blockPlayerDetail_profile">
                    <p class="blockPlayerDetail_thumb thumb"><img src="//ui-avatars.com/api/?name=Gg Hh&background=872bac&color=ffffff" alt="" width="200" height="200"></p>
                    <p class="blockPlayerDetail_score unitBox">RANK: 4 <br>(70勝20敗)</p>
                </div>
                <div class="blockPlayerDetail_detail">
                    <section class="blockFriends">
                        <h3 class="blockFriends_title unitTitle1">Friends</h3>
                        <div class="blockFriends_friends listFriends listLineDivide">
                        </div>
                    </section>
                    <section class="blockMatchLog">
                        <h3 class="blockMatchLog_title unitTitle1">Match Log</h3>
                        <ul class="blockMatchLog_log listMatchLog listLineDivide">
                            <li class="listMatchLog_item"><strong>RANK: 4</strong> <span>(2024/4/2 tournament52)</span></li>
                            <li class="listMatchLog_item"><strong>RANK: 6</strong> <span>(2024/4/1 tournament45)</span></li>
                            <li class="listMatchLog_item"><strong>RANK: 4</strong> <span>(2024/3/24 tournament42)</span></li>
                            <li class="listMatchLog_item"><strong>RANK: 1</strong> <span>(2024/3/10 tournament40)</span></li>
                        </ul>
                    </section>
                </div>
            </div>
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
                        <p class="unitFriendButton unitFriend_button-match">
                            <button type="submit" id="btnLogoutForm" class="unitFriendButton_button unitButton">${this.labelMatch}</button>
                        </p>
                    </section>
                  `);
                listFriendsWrapper.innerHTML = userElements.join('');
            })
            .catch(error => {
                console.error('getUserInfo failed:', error);
            })
    }

    showModal() {
        showModalWaitMatch();
    }
}
