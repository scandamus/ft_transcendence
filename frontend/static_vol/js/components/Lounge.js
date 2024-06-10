'use strict';

import PageBase from './PageBase.js';
import { getUserList } from "../modules/users.js";
import { showModalMatchRequest } from '../modules/modal.js';

export default class extends PageBase {
    constructor(params) {
        super(params);
        this.setTitle('Lounge');
        this.labelMatch = '対戦する';
        this.labelCreateRoom = 'ルーム作成';
        this.labelDualGame = '2人対戦';
        this.labelQuadGame = '4人対戦';
    }

    async renderHtml() {
        return `
            <div class="blockUsers">
                <form class="formCreateRoom blockForm unitBox" action="" method="post">
                    <ul class="formCreateRoom_list blockForm_list">
                        <li><input type="radio" id="dualGame" name="gameType" value="${this.labelDualGame}" checked /><label for="dualGame">${this.labelDualGame}</label></li>
                        <li><input type="radio" id="quadGame" name="gameType" value="${this.labelQuadGame}" /><label for="quadGame">${this.labelQuadGame}</label></li>
                    </ul>
                    <p class="formCreateRoom_button blockForm_button"><button type="submit" id="btnCreateRoom" class="unitButton">${this.labelCreateRoom}</button></p>
                </form>
            </div>
            <div class="blockUsers">
                <div class="blockUsers_column">
                    <section class="blockMatch">
                        <h3 class="blockMatch_title unitTitle1">Waiting</h3>
                        <div class="blockMatch_list listMatch listLineDivide">
                            <div class="unitMatch unitMatch-dual">
                                <ul class="unitMatch_list unitMatch_list-dual">
                                    <li class="unitPlayer">
                                        <p class="unitPlayer_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="" width="42" height="42"></p>
                                        <p class="unitPlayer_name">username</p>
                                    </li>
                                    <li class="unitPlayer">
                                        <p class="unitPlayer_thumb"><img src="//ui-avatars.com/api/?name=?&background=ccc&color=ffffff" alt="" width="42" height="42"></p>
                                        <p class="unitPlayer_name">???</p>
                                    </li>
                                </ul>
                                <ul class="unitMatchButton unitListBtn unitListBtn-horizontal">
                                    <li><button type="button" class="unitFriendButton_matchRequest unitButton">${this.labelMatch}</button></li>
                                </ul>
                            </div>
                            <div class="unitMatch unitMatch-quad">
                                <ul class="unitMatch_list">
                                    <li class="unitPlayer">
                                        <p class="unitPlayer_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="" width="42" height="42"></p>
                                        <p class="unitPlayer_name">username</p>
                                    </li>
                                    <li class="unitPlayer">
                                        <p class="unitPlayer_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="" width="42" height="42"></p>
                                        <p class="unitPlayer_name">username</p>
                                    </li>
                                    <li class="unitPlayer">
                                        <p class="unitPlayer_thumb"><img src="//ui-avatars.com/api/?name=?&background=ccc&color=ffffff" alt="" width="42" height="42"></p>
                                        <p class="unitPlayer_name">???</p>
                                    </li>
                                    <li class="unitPlayer">
                                        <p class="unitPlayer_thumb"><img src="//ui-avatars.com/api/?name=?&background=ccc&color=ffffff" alt="" width="42" height="42"></p>
                                        <p class="unitPlayer_name">???</p>
                                    </li>
                                </ul>
                                <ul class="unitMatchButton unitListBtn unitListBtn-horizontal">
                                    <li><button type="button" class="unitFriendButton_matchRequest unitButton">${this.labelMatch}</button></li>
                                </ul>
                            </div>
                            <div class="unitMatch unitMatch-quad">
                                <ul class="unitMatch_list">
                                    <li class="unitPlayer">
                                        <p class="unitPlayer_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="" width="42" height="42"></p>
                                        <p class="unitPlayer_name">username</p>
                                    </li>
                                    <li class="unitPlayer">
                                        <p class="unitPlayer_thumb"><img src="//ui-avatars.com/api/?name=?&background=ccc&color=ffffff" alt="" width="42" height="42"></p>
                                        <p class="unitPlayer_name">???</p>
                                    </li>
                                    <li class="unitPlayer">
                                        <p class="unitPlayer_thumb"><img src="//ui-avatars.com/api/?name=?&background=ccc&color=ffffff" alt="" width="42" height="42"></p>
                                        <p class="unitPlayer_name">???</p>
                                    </li>
                                    <li class="unitPlayer">
                                        <p class="unitPlayer_thumb"><img src="//ui-avatars.com/api/?name=?&background=ccc&color=ffffff" alt="" width="42" height="42"></p>
                                        <p class="unitPlayer_name">???</p>
                                    </li>
                                </ul>
                                <ul class="unitMatchButton unitListBtn unitListBtn-horizontal">
                                    <li><button type="button" class="unitFriendButton_matchRequest unitButton">${this.labelMatch}</button></li>
                                </ul>
                            </div>
                            <div class="unitMatch unitMatch-dual">
                                <ul class="unitMatch_list unitMatch_list-dual">
                                    <li class="unitPlayer">
                                        <p class="unitPlayer_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="" width="42" height="42"></p>
                                        <p class="unitPlayer_name">username</p>
                                    </li>
                                    <li class="unitPlayer">
                                        <p class="unitPlayer_thumb"><img src="//ui-avatars.com/api/?name=?&background=ccc&color=ffffff" alt="" width="42" height="42"></p>
                                        <p class="unitPlayer_name">???</p>
                                    </li>
                                </ul>
                                <ul class="unitMatchButton unitListBtn unitListBtn-horizontal">
                                    <li><button type="button" class="unitFriendButton_matchRequest unitButton">${this.labelMatch}</button></li>
                                </ul>
                            </div>
                        </div>
                    </section>
                </div>
                <div class="blockUsers_column">
                    <section class="blockFriendRecommended">
                        <h3 class="blockFriendRecommended_title unitTitle1">in play</h3>
                        <div class="blockFriendRecommended_friends listFriends listLineDivide">
                            <div class="unitMatch unitMatch-quad">
                                <ul class="unitMatch_list">
                                    <li class="unitPlayer">
                                        <p class="unitPlayer_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="" width="42" height="42"></p>
                                        <p class="unitPlayer_name">username</p>
                                    </li>
                                    <li class="unitPlayer">
                                        <p class="unitPlayer_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="" width="42" height="42"></p>
                                        <p class="unitPlayer_name">username</p>
                                    </li>
                                    <li class="unitPlayer">
                                        <p class="unitPlayer_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="" width="42" height="42"></p>
                                        <p class="unitPlayer_name">username</p>
                                    </li>
                                    <li class="unitPlayer">
                                        <p class="unitPlayer_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="" width="42" height="42"></p>
                                        <p class="unitPlayer_name">username</p>
                                    </li>
                                </ul>
                            </div>
                            <div class="unitMatch unitMatch-dual">
                                <ul class="unitMatch_list unitMatch_list-dual">
                                    <li class="unitPlayer">
                                        <p class="unitPlayer_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="" width="40" height="40"></p>
                                        <p class="unitPlayer_name">username</p>
                                    </li>
                                    <li class="unitPlayer">
                                        <p class="unitPlayer_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="" width="40" height="40"></p>
                                        <p class="unitPlayer_name">username</p>
                                    </li>
                                </ul>
                            </div>
                            <div class="unitMatch unitMatch-dual">
                                <ul class="unitMatch_list unitMatch_list-dual">
                                    <li class="unitPlayer">
                                        <p class="unitPlayer_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="" width="40" height="40"></p>
                                        <p class="unitPlayer_name">username</p>
                                    </li>
                                    <li class="unitPlayer">
                                        <p class="unitPlayer_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="" width="40" height="40"></p>
                                        <p class="unitPlayer_name">username</p>
                                    </li>
                                </ul>
                            </div>
                            <div class="unitMatch unitMatch-dual">
                                <ul class="unitMatch_list unitMatch_list-dual">
                                    <li class="unitPlayer">
                                        <p class="unitPlayer_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="" width="40" height="40"></p>
                                        <p class="unitPlayer_name">username</p>
                                    </li>
                                    <li class="unitPlayer">
                                        <p class="unitPlayer_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="" width="40" height="40"></p>
                                        <p class="unitPlayer_name">username</p>
                                    </li>
                                </ul>
                            </div>
                            <div class="unitMatch unitMatch-quad">
                                <ul class="unitMatch_list">
                                    <li class="unitPlayer">
                                        <p class="unitPlayer_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="" width="40" height="40"></p>
                                        <p class="unitPlayer_name">username</p>
                                    </li>
                                    <li class="unitPlayer">
                                        <p class="unitPlayer_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="" width="40" height="40"></p>
                                        <p class="unitPlayer_name">username</p>
                                    </li>
                                    <li class="unitPlayer">
                                        <p class="unitPlayer_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="" width="40" height="40"></p>
                                        <p class="unitPlayer_name">username</p>
                                    </li>
                                    <li class="unitPlayer">
                                        <p class="unitPlayer_thumb"><img src="//ui-avatars.com/api/?name=username&background=3cbbc9&color=ffffff" alt="" width="40" height="40"></p>
                                        <p class="unitPlayer_name">username</p>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
            <ol class="breadcrumb">
            <li><a href="/">dashboard</a></li>
            <li>Lounge</li>
            </ol>
        `;
    }
}
