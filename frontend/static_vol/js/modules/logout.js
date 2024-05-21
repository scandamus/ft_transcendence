'use strict';

import { getToken, refreshAccessToken } from './token.js';
import { switchDisplayAccount } from './auth.js';
import { router } from './router.js';
import { closeWebSocket } from './websocket.js';

const fetchLogout = async (isRefresh) => {
    const accessToken = getToken('accessToken');
    if (accessToken === null) {
        throw new Error('accessToken is invalid.');
    }
    const response = await fetch('http://localhost:8001/api/players/logout/', {
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
    ev.preventDefault();
    fetchLogout(false)
        .catch(error => {
            console.error('Logout failed:', error);
        })
        .finally(() => {
            //todo: catchからここに入る場合は強制ログアウト。画面にエラー表示を出すか？
            //token rm
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            closeWebSocket();
            switchDisplayAccount(null);//not return
            router(false);//not return
        })
}

export { handleLogout };
