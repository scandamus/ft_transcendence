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

    // ネットワークエラー、サーバーエラー、ストレージエラーの例外に対応
    try {
        // SimpleJWTのリフレッシュトークン発行はbodyにrefreshを渡す仕様
        const response = await fetch('https://localhost/token/refresh/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 'refresh': `${refreshToken}` })
        });
        if (response.ok) {
            const refreshData = await response.json();
            localStorage.setItem('accessToken', refreshData.access);
            console.log(`Successfully token refreshed: ${refreshData.access}`);
            return true;
        }
        console.error('Failed to refresh token, server responded with: ', response.status);
        return false;
    } catch (error) {
        console.error('Error occured while refreshing token: ', error);
        return false;
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
    const myToken = getToken(nameToken);
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
    myToken = getToken(nameToken);
    return { token: myToken, error: (!myToken ? null : 'No access token though refresh is success')};
}

export { getToken, refreshAccessToken, isTokenExpired, getValidToken };
