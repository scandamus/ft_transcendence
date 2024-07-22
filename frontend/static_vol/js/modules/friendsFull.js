'use strict';

import { labels } from "./labels.js";
import PageBase from "../components/PageBase.js";

const switchDisplayFriendsFull = (pageInstance) => {
    const isPageFriend = PageBase.isInstance(pageInstance, 'Friends');

    if (isPageFriend) {
        //要素の表示制御のためselector付与
        const blockUsers = document.querySelector('.blockUsers');
        blockUsers.classList.add('is-full');

        //友達検索invalid
        const elInputFriendName = document.getElementById('inputFriendsName');
        const btnSearchFriend = document.getElementById('btnSearchFriend');
        elInputFriendName.setAttribute('disabled', '');
        btnSearchFriend.setAttribute('disabled', '');

        //Recommended非表示
        const blockFriendRecommended = document.querySelector('.blockFriendRecommended');
        blockFriendRecommended.classList.add('is-hide');
    }

    //友達追加できない旨メッセージ表示
    const blockFriendsFull = document.querySelector('.blockFriendsFull');
    blockFriendsFull.insertAdjacentHTML('afterbegin', `<p>${labels.friends.msgFriendsFull}</p>`);
    blockFriendsFull.classList.add('is-show');
}

const disableAccept = () => {
    //受け取った友達申請の承諾をdisable
    const btnFriendAccept = document.querySelectorAll('.unitFriendButton_friendAccept');
    btnFriendAccept.forEach((btn) => {
        btn.setAttribute('disabled', '');
    });
}

export { switchDisplayFriendsFull, disableAccept };
