'use strict';

//sessionStorageにtokenがkey自体ない=>ログアウト状態
//tokenがundefined=>何かがおかしい
import { SiteInfo } from "./SiteInfo.js";
import { processLogout } from "./logout.js";
import { addNotice } from "./notice.js";
import { labels } from "./labels.js";

const getToken = (nameToken) => {
    const token = sessionStorage.getItem(nameToken);
    if (token === null) {
        return null;//未ログイン
    }
    if (!token) {//todo:test (undefinedなど)
        throw new Error(`${nameToken} is invalid`);
    }
    return token;
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
            //refreshToken expired.強制ログアウト
            addNotice(labels.common.logoutTokenExpired, true);
            processLogout();
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
        console.log('Decode token failed: ', e);
        return true;
    }
}

const getValidToken = async (nameToken) => {
    let myToken = getToken(nameToken);
    if (myToken == null) {
        console.log('No token found.');
        return { token: null, error: 'No token found' };
    }
    if (!isTokenExpired(myToken)) {
        return { token: myToken, error: null };
    }
    console.log('token expired');
    const refreshedToken = await refreshAccessToken();
    if (!refreshedToken) {
        console.error('Failed to refresh token.');
        return { token: null, error: 'Failed to refresh token' };
    }
    return { token: refreshedToken, error: (!refreshedToken ? null : 'No access token though refresh is success')};
}

const initToken = async () => {
    console.log('initToken in');
    try {
        const tokenResult = await getValidToken('accessToken');
        console.log('tokenResult: ', tokenResult);
        if (tokenResult.token) {
            console.log('accessToken: ', tokenResult.token);
            return tokenResult;
        } else {
            console.error('Token error: ', tokenResult.error);
            return false;
        }
    } catch (error) {
        console.error('Error user page initToken: ', error);
    }
}

export { getToken, refreshAccessToken, isTokenExpired, getValidToken, initToken };
