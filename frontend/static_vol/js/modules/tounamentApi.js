import { getToken, refreshAccessToken } from './token.js';

const fetchTournaments = async (listType, isRefresh) => {
    try {
        const accessToken = getToken('accessToken');
        const response = await fetch(`/api/tournaments/list/${listType}/`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        if (!response.ok) {
            if (!isRefresh) {
                if (!await refreshAccessToken()) {
                    throw new Error('fail refresh token');
                }
                return await fetchTournaments(listType, true);
            } else {
                throw new Error('refreshed accessToken is invalid.');
            }
            throw new Error('Failed to fetch tournaments');
        }
        const data = await response.json();
        console.log('fetchTournaments API response: ', data);
        return data;
    } catch (error) {
        console.error('Error fetching tournaments:', error);
    }
}

const fetchTournamentDetail = async (id, isRefresh) => {
    try {
        const accessToken = getToken('accessToken');
        const response = await fetch(`/api/tournaments/tournaments/${id}/result/`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        if (!response.ok) {
            if (!isRefresh) {
                if (!await refreshAccessToken()) {
                    throw new Error('fail refresh token');
                }
                return await fetchTournamentDetail(id, true);
            } else {
                throw new Error('refreshed accessToken is invalid.');
            }
            throw new Error('Failed to fetch tournament detail');
        }
        const data = await response.json();
        console.log('fetchTournamentDetail API response: ', data);
        return data;
    } catch (error) {
        console.error('Error fetching tournament detail:', error);
    }
}

export { fetchTournaments, fetchTournamentDetail };
