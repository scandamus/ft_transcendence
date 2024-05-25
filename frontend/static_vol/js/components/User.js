'use strict';

import PageBase from './PageBase.js';
import { getUserList } from '../modules/users.js';
import { showModal } from '../modules/modal.js';
import { webSocketManager } from '../modules/websocket.js';
import { pongHandler } from '../modules/WebsocketHandler.js';
import { getValidToken } from '../modules/token.js';


export default class extends PageBase {
    constructor(params, accessToken) {
        super(params);
        this.accessToken = { token: null, error: null };
        this.labelMatch = '対戦する';
        this.labelCancel = 'キャンセル';
        this.setTitle(`USER: ${this.userName}`);
        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.showUserList.bind(this));
    }

    async init() {
        try {
            const tokenResult = await getValidToken('accessToken');
            if (tokenResult.token) {
                this.accessToken = tokenResult;
                console.log('accessToken: ', this.accessToken.token);
            } else {
                console.error('Token error: ', tokenResult.error);
            }
        } catch (error) {
            console.error('Error user page init: ', error);
        }
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
        this.init();
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
                            <button type="submit" class="unitFriendButton_matchRequest unitButton" data-name="${user.username}" data-avatar="//ui-avatars.com/api/?name=${user.username}&background=3cbbc9&color=ffffff">${this.labelMatch}</button>
                        </p>
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
        showModal(elHtml);
        //todo: 対戦相手に通知、承諾 or Rejectを受け付けるなど
        this.join_game();
        const btnCancel = document.querySelector('.blockBtnCancel_button');
        btnCancel.addEventListener('click', () => {
            console.log('Game canceled');
        });
    }

    join_game() {
        if (!webSocketManager.isWebSocketOpened('lounge')) {
            webSocketManager.openWebSocket('lounge', pongHandler);
        }
        webSocketManager.sendWebSocketMessage('lounge', {
            action: 'join_game',
            token: this.accessToken.token
        });
        console.log('Request join_game sent');
    }
}
