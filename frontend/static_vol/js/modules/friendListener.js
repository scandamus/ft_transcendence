'use strict';

import { addListenerToList, removeListenerAndClearList } from './listenerCommon.js';
import { showModalSendMatchRequest } from "./modal.js";
import { acceptFriendRequest, declineFriendRequest, removeFriend, sendFriendRequest } from "./friendsRequest.js";

const sendFriendRequestHandler = (ev) => {
    const username = ev.target.dataset.username;
    sendFriendRequest(username);
}

const acceptFriendRequestHandler = (ev) => {
    const requestId = ev.target.dataset.id;
    acceptFriendRequest(requestId);
}

const declineFriendRequestHandler = (ev) => {
    const requestId = ev.target.dataset.id;
    declineFriendRequest(requestId);
}

const removeFriendHandler = (ev) => {
    const username = ev.target.dataset.username;
    removeFriend(username);
}

const removeListenMatchRequest = (pageInstance) => {
    removeListenerAndClearList(pageInstance.listListenMatchRequest);
    pageInstance.listListenMatchRequest = [];
}

const removeListenSendFriendRequest = (pageInstance) => {
    removeListenerAndClearList(pageInstance.listListenSendFriendRequest);
    pageInstance.listListenSendFriendRequest = [];
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

const addListenMatchRequest = (pageInstance) => {
    const btnMatchRequest = document.querySelectorAll('.unitFriendButton_matchRequest');
    const boundShowModalSendMatchRequestHandler = showModalSendMatchRequest.bind(pageInstance);
    btnMatchRequest.forEach((btn) => {
        addListenerToList(
            pageInstance.listListenMatchRequest,
            btn,
            boundShowModalSendMatchRequestHandler,
            'click'
        );
        console.log(`[Add listener] match request to ${btn.dataset.username}`);
    });
}

const addListenSendFriendRequest = (pageInstance) => {
    const btnRequestFriend = document.querySelectorAll('.unitFriendButton_friendRequest');
    btnRequestFriend.forEach((btn) => {
        const boundSendFriendRequestHandler = sendFriendRequestHandler.bind(pageInstance);
        addListenerToList(
            pageInstance.listListenSendFriendRequest,
            btn,
            boundSendFriendRequestHandler,
            'click'
        );
        console.log(`[Add listener] send friend request to ${btn.dataset.username}`);
    });
}

const addListenAcceptFriendRequest = (pageInstance) => {
    const btnAcceptFriendRequest = document.querySelectorAll('.unitFriendButton_friendAccept');
    const boundAcceptFriendRequestHandler = acceptFriendRequestHandler.bind(pageInstance);
    btnAcceptFriendRequest.forEach((btn) => {
        addListenerToList(
            pageInstance.listListenAcceptFriendRequest,
            btn,
            boundAcceptFriendRequestHandler,
            'click'
        );
        console.log(`[Add listener] accept friend request to ${btn.dataset.username}`);
    });
}

const addListenDeclineFriendRequest = (pageInstance) => {
    const btnDeclineFriendRequest = document.querySelectorAll('.unitFriendButton_friendDecline');
    const boundDeclineFriendRequestHandler = declineFriendRequestHandler.bind(pageInstance);
    btnDeclineFriendRequest.forEach((btn) => {
        addListenerToList(
            pageInstance.listListenDeclineFriendRequest,
            btn,
            boundDeclineFriendRequestHandler,
            'click'
        );
        console.log(`[Add listener] decline friend request to ${btn.dataset.username}`);
    });
}

const addListenRemoveFriend = (pageInstance) => {
    const btnRemoveFriend = document.querySelectorAll('.unitFriendButton_removeFriend');
    const boundRemoveFriendHandler = removeFriendHandler.bind(pageInstance);
    btnRemoveFriend.forEach((btn) => {
        addListenerToList(
            pageInstance.listListenRemoveFriend,
            btn,
            boundRemoveFriendHandler,
            'click'
        );
        console.log(`[Add listener] remove friend to ${btn.dataset.username}`);
    });
}


const removeListenFriendList = (pageInstance) => {
    removeListenMatchRequest(pageInstance);
    removeListenRemoveFriend(pageInstance);
}

const addListenFriendList = (pageInstance) => {
    addListenMatchRequest(pageInstance);
    addListenRemoveFriend(pageInstance);
}

const resetListenFriendList = (pageInstance) => {
    removeListenFriendList(pageInstance);
    addListenFriendList(pageInstance);
}

//updateFriendRequestList rm
const removeListenFriendRequestList = (pageInstance) => {
    removeListenAcceptFriendRequest(pageInstance);
    removeListenDeclineFriendRequest(pageInstance);
}

//updateFriendRequestList add
const addListenFriendRequestList = (pageInstance) => {
    addListenAcceptFriendRequest(pageInstance);
    addListenDeclineFriendRequest(pageInstance);
}

//updateFriendRequestList reset(rm + add)
const resetListenFriendRequestList = (pageInstance) => {
    removeListenFriendRequestList(pageInstance);
    addListenFriendRequestList(pageInstance);
}

export {
    removeListenMatchRequest, addListenMatchRequest,
    removeListenSendFriendRequest, addListenSendFriendRequest,
    removeListenAcceptFriendRequest, addListenAcceptFriendRequest,
    removeListenDeclineFriendRequest, addListenDeclineFriendRequest,
    removeListenRemoveFriend, addListenRemoveFriend,
    resetListenFriendList, resetListenFriendRequestList
}
