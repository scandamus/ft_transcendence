'use strict';

//sessionStorageにtokenがkey自体ない=>ログアウト状態
//tokenがundefined=>何かがおかしい
//tokenがnull=>ログイン状態にいてはいけない。強制ログアウト
import { SiteInfo } from "./SiteInfo.js";
import { processLogout, forcedLogout } from "./logout.js";
import { addNotice } from "./notice.js";
import { labels } from "./labels.js";

const getToken = (nameToken) => {
    try {
        const token = sessionStorage.getItem(nameToken);
        if (token === null) {
            console.log(`No ${nameToken} is in sessionStorage.`);
            forcedLogout();
            throw new Error(`No ${nameToken} is in sessionStorage.`);
        }
        if (!token) {
            throw new Error(`${nameToken} is invalid`);
        }
        return token;
    } catch (error) {
        console.error('getToken failed: ', error);
    }
}

const refreshAccessToken = async () => {
    const siteInfo = new SiteInfo();
    if (siteInfo.isTokenRefreshing) {
        return siteInfo.promiseTokenRefresh;
    }
    const refreshToken = getToken('refreshToken');
    console.log(`refreshToken: ${refreshToken}`);
    // ネットワークエラー、サーバーエラー、ストレージエラーの例外に対応
    siteInfo.isTokenRefreshing = true;
    siteInfo.promiseTokenRefresh = (async () => {
        try {
            // SimpleJWTのリフレッシュトークン発行はbodyにrefreshを渡す仕様
            const response = await fetch('/token/refresh/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    'refresh': refreshToken
                })
            });
            if (response.ok) {
                const refreshData = await response.json();
                console.log(`refreshData: `, refreshData);
                sessionStorage.setItem('accessToken', refreshData.access);
                sessionStorage.setItem('refreshToken', refreshData.refresh);
                console.log(`Successfully token refreshed: ${refreshData.access}`);
                return refreshData.access;
            }
            forcedLogout();
            console.error('Failed to refresh token, server responded with: ', response.status);
            return null;
        } catch (error) {
            console.error('Error occured while refreshing token: ', error);
            return null;
        } finally {
            siteInfo.isTokenRefreshing = false;
            siteInfo.promiseTokenRefresh = null;
        }
    })();

    return siteInfo.promiseTokenRefresh;
}

const isTokenExpired = (token) => {
    try {
        const payloadBase64 = token.split('.')[1];
        const decodePayload = JSON.parse(atob(payloadBase64));
        const exp = decodePayload.exp;
        const currentUnixTime = Math.floor(Date.now() / 1000);
        return exp < currentUnixTime;
    } catch (e) {
        console.error('Decode token failed: ', e);
        return true;
    }
}

const getValidToken = async (nameToken) => {
    try {
        let myToken = getToken(nameToken);
        if (myToken && !isTokenExpired(myToken)) {
            return { token: myToken, error: null };
        }
        console.log('token expired');
        const refreshedToken = await refreshAccessToken();
        if (!refreshedToken) {
            console.error('Failed to refresh token.');
            //return { token: null, error: 'Failed to refresh token' };
            throw new Error(`Failed to refresh token`);
        }
        return { token: refreshedToken, error: (!refreshedToken ? null : 'No access token though refresh is success')};
    } catch (error) {
        console.error('getValidToken failed: ', error);
    }
}

const initToken = async () => {
    console.log('initToken in');
    try {
        const tokenResult = await getValidToken('accessToken');
        if (!tokenResult) {
            throw new Error(`fail to tokenResult`);
        }
        if (tokenResult.token) {
            console.log('accessToken: ', tokenResult.token);
            return tokenResult;
        } else {
            console.error('Token error: ', tokenResult.error);
            // return false;
            throw new Error(`fail to tokenResult`);
        }
    } catch (error) {
        console.error('Error user page initToken: ', error);
        throw error;
    }
}

export { getToken, refreshAccessToken, isTokenExpired, getValidToken, initToken };
