'use strict';

import { addListenerToList, removeListenerAndClearList } from './listenerCommon.js';

const removeListenMatchRequest = (pageInstance) => {
    removeListenerAndClearList(pageInstance.listListenMatchRequest);
    pageInstance.listListenMatchRequest = [];
    // const btnMatchRequest = document.querySelectorAll('.unitFriendButton_matchRequest');
    // btnMatchRequest.forEach((btn) => {
    //     btn.removeEventListener('click', cb);
    //     console.log(`Removed match request listener from ${btn.dataset.username}`);
    // });
}

const removeListenAcceptFriendRequest = (pageInstance) => {
    removeListenerAndClearList(pageInstance.listListenAcceptFriendRequest);
    pageInstance.listListenAcceptFriendRequest = [];
    // const btnAcceptFriendRequest = document.querySelectorAll('.unitFriendButton_friendAccept');
    // btnAcceptFriendRequest.forEach((btn) => {
    //     btn.removeEventListener('click', cb);
    //     console.log(`Removed accept friend request listener from ${btn.dataset.username}`);
    // });
}

const removeListenDeclineFriendRequest = (pageInstance) => {
    removeListenerAndClearList(pageInstance.listListenDeclineFriendRequest);
    pageInstance.listListenDeclineFriendRequest = [];
    // const btnDeclineFriendRequest = document.querySelectorAll('.unitFriendButton_friendDecline');
    // btnDeclineFriendRequest.forEach((btn) => {
    //     btn.removeEventListener('click', cb);
    //     console.log(`Removed decline friend request listener from ${btn.dataset.username}`);
    // });
}

const removeListenRemoveFriend = (pageInstance) => {
    removeListenerAndClearList(pageInstance.listListenRemoveFriend);
    pageInstance.listListenRemoveFriend = [];
    // const btnRemoveFriend = document.querySelectorAll('.unitFriendButton_removeFriend');
    // btnRemoveFriend.forEach((btn) => {
    //     btn.removeEventListener('click', cb);
    //     console.log(`Removed remove friend listener from ${btn.dataset.username}`);
    // });
}

const updateListenMatchRequest = (pageInstance) => {
    const btnMatchRequest = document.querySelectorAll('.unitFriendButton_matchRequest');
    btnMatchRequest.forEach((btn) => {
        addListenerToList(
            pageInstance.listListenMatchRequest,
            btn,
            pageInstance.showModalSendMatchRequestHandlerBound,
            'click');
        console.log(`Added match request listener to ${btn.dataset.username}`);
    });
}

const updateListenAcceptFriendRequest = (pageInstance) => {
    const btnAcceptFriendRequest = document.querySelectorAll('.unitFriendButton_friendAccept');
    btnAcceptFriendRequest.forEach((btn) => {
        btn.addEventListener('click', (event) => {
            const username = event.target.dataset.username;
            const requestId = event.target.dataset.id;
            pageInstance.acceptFriendRequestHandlerBound(requestId);
            console.log(`Accept friend request from ${username} with id ${requestId}`)
        });
        console.log(`Add accept friend request listner to ${btn.dataset.username}`);
    });
}

const updateListenDeclineFriendRequest = (pageInstance) => {
    const btnDeclineFriendRequest = document.querySelectorAll('.unitFriendButton_friendDecline');
    btnDeclineFriendRequest.forEach((btn) => {
        btn.addEventListener('click', (event) => {
            const username =event.target.dataset.username;
            const requestId = event.target.dataset.id;
            pageInstance.declineFriendRequestHandlerBound(requestId);
            console.log(`Decline friend request from ${username} with id ${requestId}`);
        })
        console.log(`Add decline friend request listner to ${btn.dataset.username}`);
    });
}

const updateListenRemoveFriend = (pageInstance) => {
    const btnRemoveFriend = document.querySelectorAll('.unitFriendButton_removeFriend');
    btnRemoveFriend.forEach((btn) => {
        btn.addEventListener('click', (event) => {
            const username = event.target.dataset.username;
            pageInstance.removeFriendHandlerBound(username);
            console.log(`Remove Friend ${username}`);
        });
        console.log(`Added remove friend listener to ${btn.dataset.username}`);
    });
}

export {
    removeListenMatchRequest, updateListenMatchRequest,
    removeListenAcceptFriendRequest, updateListenAcceptFriendRequest,
    removeListenDeclineFriendRequest, updateListenDeclineFriendRequest,
    removeListenRemoveFriend, updateListenRemoveFriend
}
