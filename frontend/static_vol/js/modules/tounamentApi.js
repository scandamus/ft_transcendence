import { getToken, refreshAccessToken } from './token.js';
import { forcedLogout } from "./logout.js";

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
                    throw new Error(`fail refresh token( ${response.status} )`);
                }
                return await fetchTournaments(listType, true);
            } else {
                throw new Error(`refreshed accessToken is invalid( ${response.status} )`);
            }
        }
        const data = await response.json();
        console.log('fetchTournaments API response: ', data);
        return data;
    } catch (error) {
        console.error('Error on fetchTournaments:', error);
        forcedLogout();
    }
}

const fetchTournamentDetail = async (id, isRefresh) => {
    try {
        if (!id) {
            throw new Error('TournamentId is invalid');
        }
        const accessToken = getToken('accessToken');
        const response = await fetch(`/api/tournaments/tournaments/${id}/result/`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        if (!response.ok) {
            if (!isRefresh) {
                if (!await refreshAccessToken()) {
                    throw new Error(`fail refresh token( ${response.status} )`);
                }
                return await fetchTournamentDetail(id, true);
            } else {
                throw new Error(`refreshed accessToken is invalid( ${response.status} )`);
            }
        }
        const data = await response.json();
        console.log('fetchTournamentDetail API response: ', data);
        return data;
    } catch (error) {
        console.error('Error on fetchTournamentDetail:', error);
        forcedLogout();
    }
}

export { fetchTournaments, fetchTournamentDetail };
