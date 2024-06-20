'use strict';

import { addListenerToList, removeListenerAndClearList } from './listenerCommon.js';

const removeListenMatchRequest = (pageInstance) => {
    removeListenerAndClearList(pageInstance.listListenMatchRequest);
    pageInstance.listListenMatchRequest = [];
}

const removeListenAcceptFriendRequest = (pageInstance) => {
    removeListenerAndClearList(pageInstance.listListenAcceptFriendRequest);
    pageInstance.listListenAcceptFriendRequest = [];
}

const removeListenDeclineFriendRequest = (pageInstance) => {
    removeListenerAndClearList(pageInstance.listListenDeclineFriendRequest);
    pageInstance.listListenDeclineFriendRequest = [];
}

const removeListenRemoveFriend = (pageInstance) => {
    removeListenerAndClearList(pageInstance.listListenRemoveFriend);
    pageInstance.listListenRemoveFriend = [];
}

const updateListenMatchRequest = (pageInstance) => {
    const btnMatchRequest = document.querySelectorAll('.unitFriendButton_matchRequest');
    btnMatchRequest.forEach((btn) => {
        const username = btn.dataset.username;
        addListenerToList(
            pageInstance.listListenMatchRequest,
            btn,
            pageInstance.showModalSendMatchRequestHandlerBound,
            'click'
        );
        console.log(`[Add listener] match request to ${username}`);
    });
}

const updateListenAcceptFriendRequest = (pageInstance) => {
    const btnAcceptFriendRequest = document.querySelectorAll('.unitFriendButton_friendAccept');
    btnAcceptFriendRequest.forEach((btn) => {
        const username = btn.dataset.username;
        const requestId = btn.dataset.id;
        addListenerToList(
            pageInstance.listListenAcceptFriendRequest,
            btn,
            pageInstance.acceptFriendRequestHandlerBound(requestId),
            'click'
        );
        console.log(`[Add listener] accept friend request to ${username}`);
    });
}

const updateListenDeclineFriendRequest = (pageInstance) => {
    const btnDeclineFriendRequest = document.querySelectorAll('.unitFriendButton_friendDecline');
    btnDeclineFriendRequest.forEach((btn) => {
        const username = btn.dataset.username;
        const requestId = btn.dataset.id;
        addListenerToList(
            pageInstance.listListenDeclineFriendRequest,
            btn,
            pageInstance.declineFriendRequestHandlerBound(requestId),
            'click'
        );
        console.log(`[Add listener] decline friend request to ${btn.dataset.username}`);
    });
}

const updateListenRemoveFriend = (pageInstance) => {
    const btnRemoveFriend = document.querySelectorAll('.unitFriendButton_removeFriend');
    btnRemoveFriend.forEach((btn) => {
        const username = btn.dataset.username;
        addListenerToList(
            pageInstance.listListenRemoveFriend,
            btn,
            pageInstance.removeFriendHandlerBound(username),
            'click'
        );
        console.log(`[Add listener] remove friend to ${btn.dataset.username}`);
    });
}

export {
    removeListenMatchRequest, updateListenMatchRequest,
    removeListenAcceptFriendRequest, updateListenAcceptFriendRequest,
    removeListenDeclineFriendRequest, updateListenDeclineFriendRequest,
    removeListenRemoveFriend, updateListenRemoveFriend
}
