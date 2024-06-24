import { getToken, refreshAccessToken } from './token.js';

export const fetchFriends = async () => {
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
        if (!response.ok) {
            throw new Error('Failed to fetch friends');
        }
        const data = await response.json();
        console.log('fetchFriends API response: ', data);
        return data;
    } catch (error) {
        console.error('Error fetching friends:', error);
    }
};

export const fetchFriendRequests = async () => {
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
        if (!response.ok) {
            throw new Error('Failed to fetch frined requests');
        }
        const data = await response.json();
        console.log('fetchFriendRequests API response: ', data);
        return data;
    } catch (error) {
        console.error('Error fetching frined requests: ', error);
    }
}