'use strict';

//localstorageにtokenがkey自体ない=>ログアウト状態
//tokenがundefined=>何かがおかしい
const getToken = (nameToken) => {
    const token = localStorage.getItem(nameToken);
    if (token === null) {
        return null;//未ログイン
    }
    if (!token) {//todo:test (undefinedなど)
        throw new Error(`${nameToken} is invalid`);
    }
    return token;
}

const refreshAccessToken = async () => {
    const refreshToken = getToken('refreshToken');
    console.log(`refreshToken: ${refreshToken}`);
    // ネットワークエラー、サーバーエラー、ストレージエラーの例外に対応
    try {
        // SimpleJWTのリフレッシュトークン発行はbodyにrefreshを渡す仕様
        const response = await fetch('https://localhost/token/refresh/', {
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
            localStorage.setItem('accessToken', refreshData.access);
            localStorage.setItem('refreshToken', refreshData.refresh);
            console.log(`Successfully token refreshed: ${refreshData.access}`);
            return refreshData.access;
        }
        console.error('Failed to refresh token, server responded with: ', response.status);
        return null;
    } catch (error) {
        console.error('Error occured while refreshing token: ', error);
        return null;
    }
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
    const refreshedToken = await refreshAccessToken();
    if (!refreshedToken) {
        console.error('Failed to refresh token.');
        return { token: null, error: 'Failed to refresh token' };
    }
    return { token: refreshedToken, error: (!refreshedToken ? null : 'No access token though refresh is success')};
}

const initToken = async () => {
    console.log('init in');
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
