"use strict";

//localstrageにtokenがkey自体ない=>ログアウト状態
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

    // SimpleJWTのリフレッシュトークン発行はbodyにrefreshを渡す仕様
    const response = await fetch('http://localhost:8001/token/refresh/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'refresh': `${refreshToken}` })
    });
    if (response.ok) {
        const refreshData = await response.json();
        localStorage.setItem('accessToken', refreshData.access);
        return true;
    }
    // refreshToken無効。
    return false;
}

export { getToken, refreshAccessToken };
