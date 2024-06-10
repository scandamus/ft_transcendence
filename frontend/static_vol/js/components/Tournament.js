'use strict';

import PageBase from './PageBase.js';

export default class extends PageBase {
    constructor(params) {
        super(params);
        this.setTitle('Tournament');
        this.labelButton = 'エントリー'; // TODO json
        this.txtDeadline = 'エントリー解除';
        this.labelCreateRoom = 'トーナメント作成';
        this.labelTournamentTitle = 'トーナメント名';
        this.labelStart = '開始時間';
    }

    async renderHtml() {
        return `
            <div>
                <form class="formCreateRoom blockForm unitBox">
                    <dl class="blockForm_el">
                        <dt>${this.labelTournamentTitle}</dt>
                        <dd><input type="text" id="" placeholder="" /></dd>
                    </dl>
                    <dl class="blockForm_el">
                        <dt>${this.labelStart}</dt>
                        <dd>
                            <input
                              type="datetime-local"
                              id="startTime"
                              name="startTime"
                              value="2024-07-01T21:00"
                              min="2024-07-01T21:00"
                              max="2024-08-01T21:00" />
                        </dd>
                    </dl>
                    <p class="formCreateRoom_button blockForm_button"><button type="button" id="btnCreateRoom" class="unitButton">${this.labelCreateRoom}</button></p>
                </form>
            </div>
            <div class="listTournaments">

            </div>
            <ol class="breadcrumb">
                <li><a href="/">dashboard</a></li>
                <li>Tournament</li>
            </ol>
        `;
    }
}
