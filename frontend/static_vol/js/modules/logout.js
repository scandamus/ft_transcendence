'use strict';

import { getToken, refreshAccessToken } from './token.js';
import { switchDisplayAccount } from './auth.js';
import { router } from './router.js';
import { webSocketManager } from './websocket.js';
import { SiteInfo } from "./SiteInfo.js";
import PageBase from "../components/PageBase.js";
import { handleExitGame } from "./modal.js";
import GamePlay from "../components/GamePlay.js";
import GamePlayQuad from "../components/GamePlayQuad.js";
//import { closeWebSocket } from './websocket.js';

const fetchLogout = async (isRefresh) => {
    const accessToken = getToken('accessToken');
    if (accessToken === null) {
        throw new Error('accessToken is invalid.');
    }
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
                throw new Error('fail refresh token');
            }
            await fetchLogout(true);
        } else {
            throw new Error('refreshed accessToken is invalid.');
        }
    } else if (!response.ok) {
        throw new Error(`fetchLogout error. status: ${response.status}`);
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
    console.log(`processLogout`)
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
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

export { handleLogout, processLogout };
