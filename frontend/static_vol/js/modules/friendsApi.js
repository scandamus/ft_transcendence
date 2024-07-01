import { getToken, refreshAccessToken } from './token.js';

export const fetchFriends = async (isRefresh) => {
    const accessToken = getToken('accessToken');
    if (accessToken === null) {
        return Promise.resolve(null);
    }
    try {
        const response = await fetch('/api/friends/friends/', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        if (!response.ok) { //response.status=>403
            if (!isRefresh) {
                if (!await refreshAccessToken()) {
                    throw new Error('fail refresh token');
                }
                return await fetchFriends(true);
            } else {
                throw new Error('refreshed accessToken is invalid.');
            }
            throw new Error(`Failed to fetch friends: ${response.status}`);
        }
        const data = await response.json();
        console.log('fetchFriends API response: ', data);
        return data;
    } catch (error) {
        console.error('Error fetching friends:', error);
    }
};

export const fetchFriendRequests = async (isRefresh) => {
    const accessToken = getToken('accessToken');
    if (accessToken === null) {
        return Promise.resolve(null);
    }
    try {
        const response = await fetch('/api/friends/requests/', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        if (!response.ok) { //response.status=>403
            if (!isRefresh) {
                if (!await refreshAccessToken()) {
                    throw new Error('fail refresh token');
                }
                return await fetchFriendRequests(true);
            } else {
                throw new Error('refreshed accessToken is invalid.');
            }
            throw new Error(`Failed to fetch friends requests: ${response.status}`);
        }
        const data = await response.json();
        console.log('fetchFriendRequests API response: ', data);
        return data;
    } catch (error) {
        console.error('Error fetching frined requests: ', error);
    }
}