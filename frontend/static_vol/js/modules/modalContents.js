const sendMatchRequest = (args) => `
    <section class="blockModal">
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
    <section class="blockModal">
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
    <section class="blockModal">
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

export { sendMatchRequest, receiveMatchRequest, waitForOpponent };
