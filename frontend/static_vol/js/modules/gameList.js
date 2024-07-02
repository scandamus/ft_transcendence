'use strict';

import { fetchMatchLog } from "./gameApi.js";
import { labels } from "./labels.js";

const getMatchLog = async () => {
    console.log('getMatchLog');
    try {
        const logList = await fetchMatchLog();
        const listRequestWrapper = document.querySelector('.blockDashboardLog_listMatch');
        if (logList.length === 0) {
            console.log('no match log')
        } else {
            listRequestWrapper.innerHTML = '';
            logList.forEach(logItem => {
                const requestElement = `
                    <div class="blockMatch">
                        <section class="blockMatch_player unitMatchPlayer">
                            <header class="unitMatchPlayer_header">
                                <img src="//ui-avatars.com/api/?name=Aa Bb&background=e3ad03&color=ffffff" alt="" width="50" height="50">
                                <h4 class="unitMatchPlayer_title">01234567890123456789012345678901</h4>
                            </header>
                            <p class="unitMatchPlayer_score">5</p>
                        </section>
                        <p class="blockMatch_vs">VS</p>
                        <section class="blockMatch_player unitMatchPlayer">
                            <header class="unitMatchPlayer_header">
                                <img src="//ui-avatars.com/api/?name=aa&background=3cbbc9&color=ffffff" alt="" width="50" height="50">
                                <h4 class="unitMatchPlayer_title">username</h4>
                            </header>
                            <p class="unitMatchPlayer_score">10</p>
                            <p class="unitMatchPlayer_result">win</p>
                        </section>
                    </div>
                `;
                listRequestWrapper.innerHTML += requestElement;
            });
        }
    } catch (error) {
        console.error('Failed to update match log: ', error);
    }
}

export { getMatchLog }
