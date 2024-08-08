'use strict';
import { labels } from './labels.js';

const sendMatchRequest = (args) => `
    <section class="blockModal" data-modal-game_name="${args.game_name}" data-modal-request_id="${args.request_id}" data-modal-username="${args.username}" data-modal-match_type="${args.matchType}">
        <h2 class="blockModal_title">${args.titleModal}</h2>
        <section class="blockOpponent">
            <h4 class="blockOpponent_name">${args.username}</h4>
            <p class="blockOpponent_thumb"><img src="${args.avatar}" alt="" width="200" height="200"></p>
        </section>
        <p class="blockBtnCancel">
            <button type="button" class="blockBtnCancel_button unitButton unitButton-small">${args.labelCancel}</button>
        </p>
        <div id="indicator" class="blockModal_indicator unitIndicator">
            <div class="unitIndicator_bar"></div>
        </div>
    </section>
`;

const receiveMatchRequest = (args) => `
    <section class="blockModal" data-modal-game_name="${args.game_name}" data-modal-request_id="${args.request_id}" data-modal-username="${args.username}">
        <h2 class="blockModal_title">${args.titleModal}</h2>
        <section class="blockOpponent">
            <h4 class="blockOpponent_name">${args.username}</h4>
            <p class="blockOpponent_thumb"><img src="${args.avatar}" alt="" width="200" height="200"></p>
        </section>
        <ul class="unitListBtn unitListBtn-horizontal">
            <li class="unitListBtn_btn blockBtnAccept"><button type="button" class="blockBtnAccept_button unitButton unitButton-small">${args.labelAccept}</button></li>
            <li class="unitListBtn_btn blockBtnReject"><button type="button" class="blockBtnReject_button unitButton unitButton-small">${args.labelReject}</button></li>
        </ul>
        <div id="indicator" class="blockModal_indicator unitIndicator">
            <div class="unitIndicator_bar"></div>
        </div>
    </section>
`;

const waitForOpponent = (args) => `
    <section class="blockModal" data-modal-game_name="${args.game_name}" data-modal-number_of_players="${args.number_of_players}" data-modal-match_type="${args.matchType}">
        <h2 class="blockModal_title">${args.titleModal}</h2>
        <ul class="blockModal_capacity unitCapacity">
            <li class="unitCapacity_numerator">
                <small>${args.labelAvailable}</small>
                <span>1</span>
            </li>
            <li class="unitCapacity_denominator">
                <small>${args.labelCapacity}</small>
                <span>${args.labelCapacityNum}</span>
            </li>
        </ul>
        <p class="blockBtnCancel">
            <button type="button" class="blockBtnCancel_button unitButton unitButton-small">${args.labelCancel}</button>
        </p>
        <div id="indicator" class="blockModal_indicator unitIndicator">
            <div class="unitIndicator_bar"></div>
        </div>
    </section>
`;

const entryTournament = (args) => `
    <section class="blockModal" data-modal-match_type="entryTournament">
        <header class="blockModal_header">
            <h2 class="blockModal_title">${args.titleModal}: <strong>${args.labelTournamentTitle}</strong></h2>
            <p class="blockModal_date">(${args.labelTournamentStart})</p>
        </header>

        <form id="formEntryTournament" class="formEntryTournament blockForm" action="" method="post">
            <dl class="blockForm_el">
                <dt>${args.labelNickname}</dt>
                <dd>
                    <input type="text" id="inputNickname" placeholder="Enter Nickname" pattern="[\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FFF\\w@_#$%&!.+*~]+" minlength="3" maxlength="20" aria-describedby="errorInputNickName" required aria-required="true" />
                    <ul id="errorInputNickName" class="listError"></ul>
                    <ul class="listAnnotation">${args.desc}</ul>
                </dd>
            </dl>
            <input type="hidden" name="idTitle" value="${args.labelTournamentId}">
            <ul class="unitListBtn unitListBtn-horizontal-center">
                <li><button type="submit" id="btnEntryTournament" class="unitButton" disabled>${args.labelEntry}</button></li>
                <li><button type="button" class="blockBtnCancel_button unitButtonDecline unitButton-small">${args.labelCancel}</button></li>
            </ul>
            <p class="ParaAnnotation">${labels.common.btnEnable}</p>
        </form>
    </section>
`;

const exitGame = (args) => `
    <section class="blockModal blockModal-micro">
        <h2 class="blockModal_title">${args.titleModal}</h2>
        <ul class="unitListBtn unitListBtn-horizontal-center">
            <li class="unitListBtn_btn blockBtnReturnToGame"><button type="button" class="blockBtnReturnToGame_button unitButton">${args.labelReturnToGame}</button></li>
            <li class="unitListBtn_btn blockBtnExitGame"><a href="#" class="blockBtnExitGame_button unitButton">${args.labelExitGame}</a></li>
        </ul>
    </section>
`;

export { sendMatchRequest, receiveMatchRequest, waitForOpponent, entryTournament, exitGame };
