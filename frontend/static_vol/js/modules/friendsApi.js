import { getToken, refreshAccessToken } from './token.js';
import { forcedLogout } from "./logout.js";

const fetchFriends = async (isRefresh) => {
    try {
        const accessToken = getToken('accessToken');
        const response = await fetch('/api/friends/friends/', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        if (!response.ok) { //response.status=>403
            if (!isRefresh) {
                if (!await refreshAccessToken()) {
                    throw new Error(`fail refresh token( ${response.status} )`);
                }
                return await fetchFriends(true);
            } else {
                throw new Error(`refreshed accessToken is invalid( ${response.status} )`);
            }
        }
        const data = await response.json();
        console.log('fetchFriends API response: ', data);
        return data;
    } catch (error) {
        console.error('Error on fetchFriends:', error);
        forcedLogout();
    }
};

const fetchFriendRequests = async (isRefresh) => {
    try {
        const accessToken = getToken('accessToken');
        const response = await fetch('/api/friends/requests/', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        if (!response.ok) { //response.status=>403
            if (!isRefresh) {
                if (!await refreshAccessToken()) {
                    throw new Error(`fail refresh token( ${response.status} )`);
                }
                return await fetchFriendRequests(true);
            } else {
                throw new Error(`refreshed accessToken is invalid( ${response.status} )`);
            }
        }
        const data = await response.json();
        console.log('fetchFriendRequests API response: ', data);
        return data;
    } catch (error) {
        console.error('Error on fetchFriendRequests: ', error);
        forcedLogout();
    }
}

const fetchRecommend = async (isRefresh) => {
    try {
        const accessToken = getToken('accessToken');
        const response = await fetch('/api/players/recommend/', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        if (!response.ok) { //response.status=>403
            if (!isRefresh) {
                if (!await refreshAccessToken()) {
                    throw new Error(`fail refresh token( ${response.status} )`);
                }
                return await fetchRecommend(true);
            } else {
                throw new Error(`refreshed accessToken is invalid( ${response.status} )`);
            }
        }
        const data = await response.json();
        console.log('fetchRecommend API response: ', data);
        return data;
    } catch (error) {
        console.error('Error on fetchRecommend: ', error);
        forcedLogout();
    }
}

export { fetchFriends, fetchFriendRequests, fetchRecommend };
