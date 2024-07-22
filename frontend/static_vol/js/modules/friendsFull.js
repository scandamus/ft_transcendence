'use strict';

import { labels } from "./labels.js";
import PageBase from "../components/PageBase.js";
import { updateFriendRequestList, updateRecommend } from "./friendList.js";
import { FRIENDS_MAX } from "./env.js";


const toggleFriendsDisplay = (pageInstance) => {
    console.log(`toggleFriendsDisplay1 ${pageInstance.isFriendsFull}`)
    if (pageInstance.numFriends < FRIENDS_MAX) {//枠に空きがある
        console.log(`toggleFriendsDisplay2`)
        if (pageInstance.isFriendsFull) {//元がisFriendsFullなら減って枠が空いた
            console.log(`toggleFriendsDisplay3`)
            pageInstance.isFriendsFull = false;
        }
        displayFriendsAvailable(pageInstance);
    } else if(!pageInstance.isFriendsFull && pageInstance.numFriends >= FRIENDS_MAX) {//増えて上限に達した
        console.log(`toggleFriendsDisplay4`)
        pageInstance.isFriendsFull = true;
        displayFriendsFull(pageInstance);
    }
        console.log(`toggleFriendsDisplay ${pageInstance.isFriendsFull}`)
}
const displayFriendsFull = (pageInstance) => {
    console.log(`///displayFriendsFull in`)
    const isPageFriend = PageBase.isInstance(pageInstance, 'Friends');

    if (isPageFriend) {
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
    blockFriendsFull.insertAdjacentHTML('afterbegin', `<p class="blockFriendsFull_message">${labels.friends.msgFriendsFull}</p>`);
    blockFriendsFull.classList.add('is-show');

    //updateFriendRequest
    updateFriendRequestList(pageInstance).then(() => {
        disableAccept();
    });
}

const displayFriendsAvailable = (pageInstance) => {
    console.log(`///displayFriendsAvailable in`)
    const isPageFriend = PageBase.isInstance(pageInstance, 'Friends');

    if (isPageFriend) {
        //友達検索valid
        const elInputFriendName = document.getElementById('inputFriendsName');
        const btnSearchFriend = document.getElementById('btnSearchFriend');
        elInputFriendName.removeAttribute('disabled');
        btnSearchFriend.removeAttribute('disabled');

        //Recommended表示
        // const blockFriendRecommended = document.querySelector('.blockFriendRecommended');
        // blockFriendRecommended.classList.remove('is-hide');
        //todo: 元々ある場合しか表示していない
        updateRecommend(pageInstance).then(() => {});
    }

    //友達追加できないメッセージ非表示
    const blockFriendsFull = document.querySelector('.blockFriendsFull');
    blockFriendsFull.classList.remove('is-show');

    const contentFriendsFull = blockFriendsFull.querySelector('.blockFriendsFull_message');
    if(contentFriendsFull) {
        contentFriendsFull.remove();
    }
    //updateFriendRequest
    updateFriendRequestList(pageInstance).then(() => {});
}

const disableAccept = () => {
    //受け取った友達申請の承諾をdisable
    const btnFriendAccept = document.querySelectorAll('.unitFriendButton_friendAccept');
    btnFriendAccept.forEach((btn) => {
        btn.setAttribute('disabled', '');
    });
}

export { toggleFriendsDisplay, displayFriendsFull, displayFriendsAvailable, disableAccept };
