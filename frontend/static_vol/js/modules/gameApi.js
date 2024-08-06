import { getToken, refreshAccessToken } from './token.js';
import { forcedLogout } from "./logout.js";

const fetchMatchLog = async (isRefresh) => {
    try {
        const accessToken = getToken('accessToken');
        const response = await fetch('/api/players/matchlog/', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        if (!response.ok) { //response.status=>403
            if (!isRefresh) {
                if (!await refreshAccessToken()) {
                    throw new Error(`fail refresh token( ${response.status} )`);
                }
                return await fetchMatchLog(true);
            } else {
                throw new Error(`refreshed accessToken is invalid( ${response.status} )`);
            }
        }
        const data = await response.json();
        console.log('fetchMatchLog API response: ', data);
        return data;
    } catch (error) {
        console.error('Error on fetchMatchLog: ', error);
        forcedLogout();
    }
}

export { fetchMatchLog };
