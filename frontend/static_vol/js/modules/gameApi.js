import { getToken, refreshAccessToken } from './token.js';

const fetchMatchLog = async () => {
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
        if (!response.ok) {
            throw new Error('Failed to fetch match log');
        }
        const data = await response.json();
        console.log('fetchMatchLog API response: ', data);
        return data;
    } catch (error) {
        console.error('Error fetching match log: ', error);
    }
}

export { fetchMatchLog };
