"use strict";

import { getToken, refreshAccessToken } from './token.js';
import { switchDisplayAccount } from './auth.js';
import { router } from "./router.js";

const fetchLogout = async (isRefresh) => {
    const accessToken = getToken('accessToken');
    if (accessToken === null) {
        throw new Error('accessToken is invalid.');
        //todo: 強制ログアウト
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
                //todo: refresh token expired. 強制ログアウト
            }
            await fetchLogout(true);
        } else {
            //todo: tokenRefresh後も401なら例外throw。強制ログアウト
            throw new Error('accessToken is invalid.');
        }
    } else if (response.ok) {
        //token rm
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    } else {
        throw new Error(`fetchLogout error. status: ${response.status}`);
    }
}

const handleLogout = (ev) => {
    ev.preventDefault();
    fetchLogout(false)
        .then(()=> {
            switchDisplayAccount(null);
            router(false);
        })
        .catch(error => {
            console.error('Logout failed:', error);
        });
}

export { handleLogout };
