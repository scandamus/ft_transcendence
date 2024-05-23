'use strict';

import { getToken, refreshAccessToken } from './token.js';

const fetchUserList = async (isRefresh) => {
    const accessToken = getToken('accessToken');
    if (accessToken === null) {
        return Promise.resolve(null);
    }
    const response = await fetch('http://localhost:8001/api/players/userlist/', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        },
    });
    if (response.ok) {
        return await response.json();
    } else if (response.status === 401) {
        if (!isRefresh) {
            if (!await refreshAccessToken()) {
                throw new Error('fail refresh token');
            }
            return await fetchUserList(true);
        } else {
            throw new Error('refreshed accessToken is invalid.');
        }
    } else {
        throw new Error(`fetchUserList error. status: ${response.status}`);
    }
}

const getUserList = async () => {
    return fetchUserList(false)
        .then((userList) => {
            if (!userList) {
                return Promise.resolve(null);
            }
            return userList;
        })
        .catch(error => {
            console.error('getUserList failed:', error);
        })
}

export { getUserList };
