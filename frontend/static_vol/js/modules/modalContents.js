const sendMatchRequest = (args) => `
    <section class="blockModal">
        <h2 class="blockModal_title">${args.titleModal}</h2>
        <section class="blockOpponent">
            <h4 class="blockOpponent_name">${args.username}</h4>
            <p class="blockOpponent_thumb"><img src="${args.avatar}" alt="" width="200" height="200"></p>
        </section>
        <p class="blockBtnCancel">
            <button type="submit" class="blockBtnCancel_button unitButton unitButton-small">${args.labelCancel}</button>
        </p>
        <div id="indicator" class="blockModal_indicator unitIndicator">
            <div class="unitIndicator_bar"></div>
        </div>
    </section>
`;

const receiveMatchRequest = (args) => `
    <section class="blockModal">
        <h2 class="blockModal_title">${args.titleModal}</h2>
        <section class="blockOpponent">
            <h4 class="blockOpponent_name">${args.username}</h4>
            <p class="blockOpponent_thumb"><img src="${args.avatar}" alt="" width="200" height="200"></p>
        </section>
        <ul class="unitListBtn unitListBtn-ar">
            <li class="unitListBtn_btn blockBtnAccept">
                <button type="submit" class="blockBtnAccept_button unitButton unitButton-small">${args.labelAccept}</button>
            </li>
            <li class="unitListBtn_btn blockBtnReject">
                <button type="submit" class="blockBtnReject_button unitButton unitButton-small">${args.labelReject}</button>
            </li>
        </ul>
        <div id="indicator" class="blockModal_indicator unitIndicator">
            <div class="unitIndicator_bar"></div>
        </div>
    </section>
`;

export { sendMatchRequest, receiveMatchRequest };
