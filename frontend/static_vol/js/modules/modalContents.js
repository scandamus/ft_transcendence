const receiveRequest = (args) => `
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

export { receiveRequest };
