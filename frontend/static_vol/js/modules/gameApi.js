import { getToken, refreshAccessToken } from './token.js';

const fetchMatchLog = async (isRefresh) => {
    const accessToken = getToken('accessToken');
    if (accessToken === null) {
        return Promise.resolve(null);
    }
    try {
        const response = await fetch('/api/players/matchlog/', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        if (!response.ok) { //response.status=>403
            if (!isRefresh) {
                if (!await refreshAccessToken()) {
                    throw new Error('fail refresh token');
                }
                return await fetchMatchLog(true);
            } else {
                throw new Error('refreshed accessToken is invalid.');
            }
            throw new Error(`Failed to fetch match log: ${response.status}`);
        }
        const data = await response.json();
        console.log('fetchMatchLog API response: ', data);
        return data;
    } catch (error) {
        console.error('Error fetching match log: ', error);
    }
}

const fetchRecommend = async (isRefresh) => {
    const accessToken = getToken('accessToken');
    if (accessToken === null) {
        return Promise.resolve(null);
    }
    try {
        const response = await fetch('/api/players/recommend/', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        if (!response.ok) { //response.status=>403
            if (!isRefresh) {
                if (!await refreshAccessToken()) {
                    throw new Error('fail refresh token');
                }
                return await fetchRecommend(true);
            } else {
                throw new Error('refreshed accessToken is invalid.');
            }
            throw new Error(`Failed to fetch recommended player: ${response.status}`);
        }
        const data = await response.json();
        console.log('fetchRecommend API response: ', data);
        return data;
    } catch (error) {
        console.error('Error fetching recommended player: ', error);
    }
}

export { fetchMatchLog, fetchRecommend };
