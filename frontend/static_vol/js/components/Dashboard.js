'use strict';

import PageBase from './PageBase.js';
import { SiteInfo } from "../modules/SiteInfo.js";
import { labels } from '../modules/labels.js';
import { updateFriendsList, updateFriendRequestList } from '../modules/friendList.js';
import { removeListenMatchRequest, removeListenAcceptFriendRequest, removeListenDeclineFriendRequest, removeListenRemoveFriend }
    from '../modules/friendListener.js';
import { addListenerToList, removeListenerAndClearList } from "../modules/listenerCommon.js";
import { getToken } from "../modules/token.js";
import { switchDisplayAccount } from "../modules/auth.js";

export default class Dashboard extends PageBase {
    constructor(params) {
        super(params);
        Dashboard.instance = this;
        this.siteInfo = new SiteInfo();
        this.setTitle(`${labels.dashboard.title}: ${this.siteInfo.getUsername()}`);
        this.clearBreadcrumb();
        this.avatar = this.siteInfo.getAvatar();

        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.updateLists.bind(this));
        this.addAfterRenderHandler(this.listenUpdateAvatar.bind(this));
        this.addAfterRenderHandler(this.listenPickFileAvatar.bind(this));

        //Instance固有のlistenerList
        this.listListenMatchRequest = [];
        this.listListenRemoveFriend = [];
        this.listListenAcceptFriendRequest = [];
        this.listListenDeclineFriendRequest = [];
        this.listListenUploadAvatar = [];
    }

    async renderHtml() {
        const win = 70, loss = 20;
        const textWinLoss = (labels.match.fmtWinLoss).replace('$win', win).replace('$loss', loss);
        return `
            <div class="blockPlayerDetail">
                <div class="blockPlayerDetail_profile">
                
    <form class="blockAvatar blockForm" action="" method="post">                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
        <div class="blockAvatar_avatar thumb">
            <img id="imgAvatar" src="${this.avatar}" alt="" width="200" height="200">
        </div>
        <p class="blockAvatar_button is-show"><button type="button" id="btnUpdateAvatar" class="unitButton unitButton-small">Change Avatar</button></p>
        <input type="file" id="inputAvatarFile" accept="image/*" class="formPartsHide">
        <ul class="blockAvatar_listButton listButton">
            <li><button type="button" id="btnAvatarCancel" class="unitButton">cancel</button></li>
            <li><button type="submit" id="btnAvatarUpload" class="unitButton">Upload</button></li>
        </ul>
    </form>
    
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

    listenUpdateAvatar() {
        const btnUpdateAvatar = document.getElementById('btnUpdateAvatar');
        const boundUpdateAvatar = this.updateAvatar.bind(this);
        this.addListListenInInstance(btnUpdateAvatar, boundUpdateAvatar, 'click');
    }

    updateAvatar() {
        const inputFile = document.getElementById('inputAvatarFile');
        inputFile.click();
    }

    listenPickFileAvatar() {
        const inputFile = document.getElementById('inputAvatarFile');
        const boundPickFileAvatar = this.pickFileAvatar.bind(this);
        this.addListListenInInstance(inputFile, boundPickFileAvatar, 'change');
    }
    
    pickFileAvatar(ev) {
        const imgAvatar = document.getElementById('imgAvatar');
        const btnWrapUpdateAvatar = document.querySelector('.blockAvatar_button');
        const listButton = document.querySelector('.blockAvatar_listButton');
        const file = ev.target.files[0];
        if (file) {
            const fileReader = new FileReader();
            fileReader.onload = (ev) => {
                imgAvatar.src = ev.target.result;
                btnWrapUpdateAvatar.classList.remove('is-show');
                listButton.classList.add('is-show');
                this.listenUploadAvatar();
            };
            fileReader.readAsDataURL(file);
        }
    }

    listenUploadAvatar() {
        const btnAvatarCancel = document.getElementById('btnAvatarCancel');
        const btnAvatarUpload = document.getElementById('btnAvatarUpload');
        const boundCancelAvatar = this.cancelAvatar.bind(this);
        const boundUploadAvatar = this.uploadAvatar.bind(this);

        addListenerToList(
            this.listListenUploadAvatar, btnAvatarCancel, boundCancelAvatar, 'click');
        addListenerToList(
            this.listListenUploadAvatar, btnAvatarUpload, boundUploadAvatar, 'click');
    }

    async uploadAvatar(ev) {
        ev.preventDefault();
        const inputFile = document.getElementById('inputAvatarFile');
        const formData = new FormData();
        const file = inputFile.files[0];
        if (!file) {
            return;
        }
        formData.append('avatar', file);

        const accessToken = getToken('accessToken');
        if (accessToken === null) {
            return Promise.resolve(null);
        }
        fetch('/api/players/avatar/', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: formData //stringify?
        })
            .then( async (response) => {
                if (!response.ok) {
                    const responseBody = await response.text();
                    throw new Error(responseBody);
                 }
                return response.json();
            })
            .then( async (data) => {
                this.siteInfo.setAvatar(data.newAvatar);
                this.cancelAvatar();
                await switchDisplayAccount();
            })
            .catch((error) => {
                this.cancelAvatar();
                console.error('Error:', error);
            });
    }

    cancelAvatar() {
        const inputFile = document.getElementById('inputAvatarFile');
        const imgAvatar = document.getElementById('imgAvatar');
        const btnWrapUpdateAvatar = document.querySelector('.blockAvatar_button');
        const listButton = document.querySelector('.blockAvatar_listButton');
        this.removeListenUploadAvatar();
        btnWrapUpdateAvatar.classList.add('is-show');
        listButton.classList.remove('is-show');
        imgAvatar.src = this.siteInfo.getAvatar();
        inputFile.value = '';
    }

    removeListenUploadAvatar() {
        removeListenerAndClearList(this.listListenUploadAvatar);
        this.listListenUploadAvatar = [];
    }

    destroy() {
        //rmFriendsList
        removeListenMatchRequest(this);
        removeListenRemoveFriend(this);
        //rmFriendRequestList
        removeListenAcceptFriendRequest(this);
        removeListenDeclineFriendRequest(this);
        //rmUploadAvatarList
        this.removeListenUploadAvatar();

        super.destroy();
    }
}
