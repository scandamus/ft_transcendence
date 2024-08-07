'use strict';

import { getToken, refreshAccessToken, stopTokenRefreshInterval } from './token.js';
import { switchDisplayAccount } from './auth.js';
import { router } from './router.js';
import { webSocketManager } from './websocket.js';
import { SiteInfo } from "./SiteInfo.js";
import PageBase from "../components/PageBase.js";
import { handleExitGame } from "./modal.js";
import GamePlay from "../components/GamePlay.js";
import GamePlayQuad from "../components/GamePlayQuad.js";
import { addNotice } from "./notice.js";
import { labels } from "./labels.js";

const fetchLogout = async (isRefresh) => {
    try {
        const accessToken = getToken('accessToken');
        const response = await fetch('/api/players/logout/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        if (response.status === 401) {
            if (!isRefresh) {
                //初回のaccessToken expiredならrefreshして再度ログイン
                if (!await refreshAccessToken()) {
                    throw new Error(`fail refresh token( ${response.status} )`);
                }
                await fetchLogout(true);
            } else {
                throw new Error(`refreshed accessToken is invalid( ${response.status} )`);
            }
        } else if (!response.ok) {
            throw new Error(`fetchLogout error. status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error on fetchLogout: ', error);
        forcedLogout();
    }
}

const handleLogout = (ev) => {
    console.log('LOGOUT in');
    ev.preventDefault();
    fetchLogout(false)
        .catch(error => {
            console.error('Logout failed:', error);
        })
        .finally(() => {
            processLogout();
        })
}

const processLogout = () => {
    stopTokenRefreshInterval();
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('accessTokenExpiry');
    sessionStorage.removeItem('refreshTokenExpiry');
    sessionStorage.removeItem('all_usernames');
    sessionStorage.removeItem('player_name');
    sessionStorage.removeItem('tournament_id');
    sessionStorage.removeItem('tournament_status');
    webSocketManager.closeWebSocket('lounge');
    webSocketManager.closeWebSocket('pong');
    const siteInfo = new SiteInfo();
    siteInfo.reset();
    switchDisplayAccount().then(() => {});//not return
    if (GamePlay.instance || GamePlayQuad.instance) {
        handleExitGame(PageBase.instance);
    }
    router(false).then(() => {});
}

const forcedLogout = () => {
    const siteInfo = new SiteInfo();
    if (!siteInfo.isLogout) {
        addNotice(labels.common.logoutTokenExpired, true);
        processLogout();
    }
}

export { handleLogout, processLogout, forcedLogout };
