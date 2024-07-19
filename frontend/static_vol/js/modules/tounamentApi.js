import { getToken, refreshAccessToken } from './token.js';

export const fetchTournaments = async (listType) => {
    const accessToken = getToken('accessToken');
    if (accessToken === null) {
        return Promise.resolve(null);
    }
    try {
        const response = await fetch(`/api/tournaments/list/${listType}/`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch tournaments');
        }
        const data = await response.json();
        console.log('fetchTournaments API response: ', data);
        return data;
    } catch (error) {
        console.error('Error fetching tournaments:', error);
    }
};