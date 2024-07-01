'use strict';

import PageBase from './PageBase.js';
import { labels } from '../modules/labels.js';

export default class GameMatch extends PageBase {
    constructor(params) {
        super(params);
        GameMatch.instance = this;
        this.setTitle('GameMatch');
    }

    // async getListPlayers() {
    //     return fetch('https://localhost/api/players/')
    //         .then(response => response.json())
    //         .then(data => {
    //             return data;
    //         })
    //         .catch(error => {
    //             console.error('Error fetching users:', error);
    //             throw error;
    //         });
    // }

    // async renderHtml() {
    //     const listUsers = await this.getListPlayers();
    //     if (!listUsers || listUsers.length === 0) {
    //         return '<div>No players found.</div>';
    //     }
    //     return `
    //         <div class="listPlayers">
    //             ${listUsers.map(player => `
    //             <section class="unitListItem">
    //                 <header class="unitListItem_header">
    //                     <div class="unitPlayerName">
    //                         <h3>${player.playername}</h3>
    //                         <p class="thumb"><img src="//ui-avatars.com/api/?name=Aa Bb&background=e3ad03&color=ffffff" alt="" width="60" height="60"></p>
    //                     </div>
    //                     <button class="unitButton">${labels.labelMatch}</button>
    //                 </header>
    //                 <div class="unitListItem_content unitPlayerScore">
    //                     <p>RANK: 4 (20勝3敗)</p>
    //                     <p>過去の対戦成績: 2勝1敗</p>
    //                 </div>
    //             </section>
    //             `).join('')}
    //         </div>
    //     `; // TODO json; 翻訳しやすくしたい
    // }

    destroy() {
        super.destroy();
    }
}
