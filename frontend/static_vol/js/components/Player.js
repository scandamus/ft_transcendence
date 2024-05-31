'use strict';

import PageBase from './PageBase.js';
import { getUserList } from '../modules/users.js';


export default class extends PageBase {
    constructor(params) {
        super(params);
        this.labelAddFriend = '友達に追加';
        this.setTitle('PLAYER LIST');
        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.showUserList.bind(this));
    }

    async renderHtml() {
        return `
            <section class="blockPlayerList">
                <div class="blockFriends_friends listFriends listLineDivide"></div>
            </section>
        `;
    }

    showUserList() {
        const listFriendsWrapper = document.querySelector('.listFriends');
        getUserList()
            .then(data => {
                listFriendsWrapper.innerHTML = '';
                const userElements = data.map(user => `
                    <section class="unitFriend">
                        <a href="/player/${user.username}" data-link>
                            <header class="unitFriend_header">
                                <h4 class="unitFriend_name">${user.username}</h4>
                                <p class="unitFriend_thumb"><img src="//ui-avatars.com/api/?name=${user.username}&background=3cbbc9&color=ffffff" alt="" width="100" height="100"></p>
                            </header>
                        </a>
                        <p class="unitFriendButton unitFriend_button-match">
                            <button type="submit" class="unitFriendButton_matchRequest unitButton">${this.labelAddFriend}</button>
                        </p>
                    </section>
                  `);
                listFriendsWrapper.innerHTML = userElements.join('');
            })
            .catch(error => {
                console.error('getUserInfo failed:', error);
            })
    }
}
