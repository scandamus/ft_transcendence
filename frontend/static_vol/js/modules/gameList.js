'use strict';

import { fetchMatchLog } from "./gameApi.js";
import { labels } from "./labels.js";
import { SiteInfo } from "./SiteInfo.js";
import { addListenSendFriendRequest } from "./friendListener.js";

const getMatchLog = async () => {
    console.log('getMatchLog');
    try {
        const logList = await fetchMatchLog(false);
        const listRequestWrapper = document.querySelector('.blockDashboardLog_listMatch');
        if (!logList || logList.length === 0) {
            listRequestWrapper.innerHTML = `<p>${labels.match.msgNoMatch}</p>`
        } else {
            const siteInfo = new SiteInfo();
            const myUsername = siteInfo.getUsername();
            const myAvatar = siteInfo.getAvatar();
            // listRequestWrapper.innerHTML = '';
            logList.forEach(logItem => {
                const myResultHTML = `
                    <section class="blockMatch_player unitMatchPlayer">
                        <header class="unitMatchPlayer_header">
                            <img src="${myAvatar}" alt="" width="50" height="50">
                            <h4 class="unitMatchPlayer_title">${myUsername}</h4>
                        </header>
                        <p class="unitMatchPlayer_score">${logItem.my_score}</p>
                        ${logItem.is_win ? '<p class="unitMatchPlayer_result">win</p>' : ''}
                    </section>
                `;

                // 対戦相手のスコア部分を作成
                let opponentsResultHTML = '';
                logItem.players.forEach(player => {
                    const avatar = player.avatar ? player.avatar : '/images/avatar_default.png';
                    opponentsResultHTML += `
                        <section class="blockMatch_player unitMatchPlayer">
                            <header class="unitMatchPlayer_header">
                                <img src="${avatar}" alt="" width="50" height="50">
                                <h4 class="unitMatchPlayer_title">${player.username}</h4>
                            </header>
                            <p class="unitMatchPlayer_score">${player.score}</p>
                            ${player.is_win ? '<p class="unitMatchPlayer_result">win</p>' : ''}
                        </section>
                    `;
                });

                // 全体のHTMLを結合
                const requestElement = `
                    <div class="blockMatch">
                        ${myResultHTML}
                        <p class="blockMatch_vs">VS</p>
                        <div class="blockMatch_opponents">
                            ${opponentsResultHTML}
                        </div>
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
