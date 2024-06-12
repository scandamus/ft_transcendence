'use strict';

import PageBase from './PageBase.js';

export default class extends PageBase {
    constructor(params) {
        super(params);
        this.setTitle('Tournament');
        this.labelCreateTournament = 'Create Tournament'; // TODO json
        this.labelTournamentTitle = 'Tournament Title';
        this.labelStart = 'Start Time';
        //afterRenderにmethod追加
        this.addAfterRenderHandler(this.listenCreateTournament.bind(this));
    }

    async renderHtml() {
        return `
            <div>
                <form id="formCreateTournament" class="formCreateTournament blockForm unitBox" action="" method="post">
                    <dl class="blockForm_el formCreateTournament_elInput formCreateTournament_elInput-title">
                        <dt>${this.labelTournamentTitle}</dt>
                        <dd><input type="text" id="inputTournamentTitle" placeholder="Enter Tournament Title" required /></dd>
                    </dl>
                    <dl class="blockForm_el formCreateTournament_elInput formCreateTournament_elInput-start">
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
                    <p class="formCreateTournament_button blockForm_button"><button type="submit" id="btnCreateTournament" class="unitButton">${this.labelCreateTournament}</button></p>
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

    listenCreateTournament() {
        const btnCreateTournament = document.getElementById('btnCreateTournament');
        btnCreateTournament.addEventListener('click', this.handleCreateTournament.bind(this));
        this.addListenEvent(btnCreateTournament, this.handleCreateTournament, 'click');
    }

    handleCreateTournament(ev) {
        ev.preventDefault();
        console.log("handleCreateTournament");
        //todo: CreateTournament
    }
}
