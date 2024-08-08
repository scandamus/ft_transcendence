'use strict';

import PageBase from './PageBase.js';
import { SiteInfo } from "../modules/SiteInfo.js";
import { labels } from '../modules/labels.js';
import { FRIENDS_MAX } from "../modules/env.js";
import { updateFriendsList, updateFriendRequestList } from '../modules/friendList.js';
import { getMatchLog } from '../modules/gameList.js';

import { toggleFriendsDisplay, displayFriendsFull, displayFriendsAvailable } from '../modules/friendsFull.js';
import { getTournamentLog } from '../modules/tournamentList.js';

import {
    removeListenMatchRequest,
    removeListenAcceptFriendRequest,
    removeListenDeclineFriendRequest,
    removeListenRemoveFriend
}
    from '../modules/friendListener.js';
import { addListenerToList, removeListenerAndClearList } from "../modules/listenerCommon.js";
import { getToken, refreshAccessToken } from "../modules/token.js";
import { switchDisplayAccount, fetchLevel } from "../modules/auth.js";
import { addNotice } from "../modules/notice.js";
import { forcedLogout } from "../modules/logout.js";

export default class Dashboard extends PageBase {
    static instance = null;

    constructor(params) {
        if (Dashboard.instance) {
            return Dashboard.instance;
        }
        super(params);
        Dashboard.instance = this;
        this.siteInfo = new SiteInfo();
        this.setTitle(`${labels.dashboard.title}: ${this.siteInfo.getUsername()}`);
        this.clearBreadcrumb();
        this.avatar = this.siteInfo.getAvatar();
        this.numFriends = 0;
        this.isFriendsFull = false;

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
        return `
            <div class="blockPlayerDetail">
                <div class="blockPlayerDetail_profile">
                    <form class="blockAvatar blockForm" action="" method="post">                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
                        <div class="blockAvatar_avatar thumb">
                            <img id="imgAvatar" src="${this.avatar}" alt="" width="200" height="200">
                        </div>
                        <p class="blockAvatar_button is-show"><button type="button" id="btnUpdateAvatar" class="unitButton unitButton-small" aria-label="${labels.dashboard.labelChangeAvatar}"><span aria-hidden="true">${labels.dashboard.labelChangeAvatar}</span></button></p>
                        <input type="file" id="inputAvatarFile" accept=".jpg, .jpeg, .png" class="formPartsHide">
                        <ul class="blockAvatar_listButton listButton">
                            <li><button type="button" id="btnAvatarCancel" class="unitButton">${labels.dashboard.labelCancel}</button></li>
                            <li><button type="submit" id="btnAvatarUpload" class="unitButton">${labels.dashboard.labelUpload}</button></li>
                        </ul>
                    </form>
                    <div class="blockPlayerDetail_stats unitBox"></div>
                    <ul class="unitListBtn unitListBtn-w100">
                        <li><a href="/lounge" class="unitButton" data-link>${labels.lounge.title}</a></li>
                        <li><a href="/tournament" class="unitButton" data-link>${labels.tournament.title}</a></li>
                    </ul>
                </div>
                <div class="blockPlayerDetail_detail">
                    <section class="blockFriendRequest">
                        <h3 class="blockFriendRequest_title unitTitle2">${labels.friends.labelReceivedRequest}</h3>
                        <div class="blockFriendRequest_friends listFriends listLineDivide" aria-live="polite"></div>
                        <div class="blockFriendsFull">
                            <p class="unitLinkText unitLinkText-right"><a href="/friends" class="unitLink" data-link>Friends</a></p>
                        </div>
                    </section>
                    <section class="blockFriends">
                        <h3 class="blockFriends_title unitTitle1">${labels.friends.labelListFriends}</h3>
                        <div class="blockFriends_friends listFriends listLineDivide" aria-live="polite"></div>
                        <p class="blockFriends_link unitLinkText unitLinkText-right"><a href="/friends" class="unitLink" data-link>${labels.dashboard.labelViewAllFriends}</a></p>
                    </section>
                    <section class="blockDashboardLog">
                        <h3 class="blockDashboardLog_title unitTitle1">${labels.tournament.labelTournamentLog}</h3>
                        <div class="blockDashboardLog_listTournament listLineDivide" aria-live="polite"></div>
                    </section>
                    <section class="blockDashboardLog">
                        <h3 class="blockDashboardLog_title unitTitle1">${labels.match.labelMatchLog}</h3>
                        <div class="blockDashboardLog_listMatch listLineDivide" aria-live="polite"></div>
                    </section>
                </div>
            </div>
        `;
    }

    updateLists() {
        try {
            updateFriendsList(this)
                .then(() => {
                    toggleFriendsDisplay(this);
                });
            getMatchLog().then(() => {});
            getTournamentLog(this).then(() => {});
            fetchLevel()
                .then((data) => {
                    if (!data) {
                        throw new Error(`Failed to get player stats`);
                    }
                    this.displayMatchStats(data);
                }).catch ((error) => {
                    console.error('Failed to get level: ', error);
                });
        } catch (error) {
            console.error('Failed to update lists: ', error);
            throw error;
        }
    }

    displayMatchStats(data) {
        const statsWrap = document.querySelector('.blockPlayerDetail_stats');
        if (data && statsWrap) {
            const textWin = (labels.match.fmtWin).replace('$win', data.win_count);
            const textNumMatches = (labels.match.fmtMatches).replace('$num', data.play_count);
            statsWrap.innerHTML = `
                <p class="unitLevel">LEVEL: ${data.level}</p>
                <p class="unitWinCount"><span>${textWin}</span><span>${textNumMatches}</span></p>
            `;
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
        const inputFile = ev.target;
        const file = inputFile.files[0];
        let isImg = 1;
        if (file) {
            const validTypes = ['image/jpeg', 'image/png'];
            if (validTypes.includes(file.type)) {
                const fileReader = new FileReader();
                fileReader.onload = (ev) => {
                    imgAvatar.src = ev.target.result;
                    imgAvatar.onerror = () => {
                        isImg = 0;
                        addNotice(labels.dashboard.msgInvalidFile, true);
                        imgAvatar.src = this.siteInfo.getAvatar();
                        inputFile.value = '';
                    }
                    imgAvatar.onload = () => {
                        // valid image, image preview
                        if (isImg && imgAvatar.src.startsWith('data:')) {
                            btnWrapUpdateAvatar.classList.remove('is-show');
                            listButton.classList.add('is-show');
                            this.listenUploadAvatar();
                        }
                    }
                };
                fileReader.readAsDataURL(file);
            } else {
                addNotice(labels.dashboard.msgInvalidFileFormat, true);
                inputFile.value = '';
            }
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

    fetchUploadAvatar(formData, isRefresh) {
        const accessToken = getToken('accessToken');
        fetch('/api/players/avatar/', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            body: formData
        })
            .then( async (response) => {
                if (response.ok) {
                    return response.json();
                } else if (response.status === 401) {
                    if (!isRefresh) {
                        if (!await refreshAccessToken()) {
                            const error = new Error(`fail refresh token( ${response.status} )`);
                            error.status = response.status;
                            throw error;
                        }
                        await this.fetchUploadAvatar(formData, true);
                        return;
                    } else {
                        const error = new Error(`refreshed accessToken is invalid( ${response.status} )`);
                        error.status = response.status;
                        throw error;
                    }
                } else {
                    const error = new Error(`fetchUploadAvatar error. status( ${response.status} )`);
                    error.status = response.status;
                    throw error;
                }
            })
            .then( async (data) => {
                if (!data) {
                    return;
                }
                this.siteInfo.setAvatar(data.newAvatar);
                this.cancelAvatar();
                await switchDisplayAccount();
                addNotice(labels.dashboard.msgAvatarSwitched, false);
            })
            .catch((error) => {
                console.error('Error fetchUploadAvatar: ', error);
                addNotice(labels.dashboard.msgFailAvatarUpload, true);
                this.cancelAvatar();
                if (error.status === 401) {
                    forcedLogout();
                }
            });
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
        await this.fetchUploadAvatar(formData, false);
    }

    cancelAvatar() {
        const inputFile = document.getElementById('inputAvatarFile');
        const imgAvatar = document.getElementById('imgAvatar');
        const btnWrapUpdateAvatar = document.querySelector('.blockAvatar_button');
        const listButton = document.querySelector('.blockAvatar_listButton');
        this.removeListenUploadAvatar();
        if (btnWrapUpdateAvatar) {
            btnWrapUpdateAvatar.classList.add('is-show');
        }
        if (listButton) {
            listButton.classList.remove('is-show');
        }
        if (imgAvatar) {
            imgAvatar.src = this.siteInfo.getAvatar();
        }
        if (inputFile) {
            inputFile.value = '';
        }
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

        Dashboard.instance = null;
        super.destroy();
    }
}
