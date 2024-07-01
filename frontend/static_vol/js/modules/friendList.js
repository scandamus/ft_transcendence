'use strict';

import { fetchFriendRequests, fetchFriends } from "./friendsApi.js";
import { resetListenFriendList, resetListenFriendRequestList } from "./friendListener.js";
import { labels } from "./labels.js";
import PageBase from "../components/PageBase.js";

const updateFriendsList = async (pageInstance) => {
    console.log('updateFriendList in');
    const isPageFriend = PageBase.isInstance(pageInstance, 'Friends');
    try {
        const friends = await fetchFriends();
        const listFriendsWrappr = document.querySelector('.blockFriends_friends');
        if (friends.length === 0) {
            listFriendsWrappr.innerHTML = `<p>${labels.friends.msgNoFriends}</p>`
        } else {
            listFriendsWrappr.innerHTML = '';
            friends.forEach(friend => {
                const avatar = friend.avatar ? friend.avatar : '/images/avatar_default.png';
                //todo: friendsの状況に応じて online/ offline / busy で切り替える
                const onlineStatus = 'online';
                const disableMatchButton = onlineStatus === 'online' ? '' : 'disabled';
                let friendElement = `
                    <section class="unitFriend unitFriend-${onlineStatus}">
                        <header class="unitFriend_header">
                            <h4 class="unitFriend_name">${friend.username}</h4>
                            <p class="unitFriend_thumb"><img src="${avatar}" alt="" width="100" height="100"></p>
                        </header>
                        <ul class="unitFriendButton unitListBtn unitListBtn-horizontal">
                            <li><button type="button" class="unitFriendButton_matchRequest unitButton" data-username="${friend.username}" data-avatar="${avatar}" ${disableMatchButton}>${labels.friends.labelMatch}</button></li>`;
                if (isPageFriend) {
                    friendElement += `
                            <li><button type="button" class="unitFriendButton_removeFriend unitButton" data-username="${friend.username}">${labels.friends.labelRmFriend}</button></li>
                    `;
                }
                friendElement += `</ul>
                    </section>
                `;
                listFriendsWrappr.innerHTML += friendElement;
            });
            resetListenFriendList(pageInstance);
        }
    } catch (error) {
        console.error('Failed to update friends list: ', error);
    }
}

const updateFriendRequestList = async (pageInstance) => {
    console.log('updateFriendRequestList in');
    try {
        const requests = await fetchFriendRequests();
            const secRequestWrapper = document.querySelector('.blockFriendRequest');
            const listRequestWrapper = document.querySelector('.blockFriendRequest_friends');
        if (requests.length === 0) {
            if (!secRequestWrapper.classList.contains('is-noRequest')) {
                secRequestWrapper.classList.add('is-noRequest');
            }
        } else {
            if (secRequestWrapper.classList.contains('is-noRequest')) {
                secRequestWrapper.classList.remove('is-noRequest');
            }
            listRequestWrapper.innerHTML = '';
            requests.forEach(request => {
                const requestElement = `
                    <section class="unitFriend">
                        <header class="unitFriend_header">
                            <h4 class="unitFriend_name">${request.from_user}</h4>
                            <p class="unitFriend_thumb"><img src="${request.from_user_avatar}" alt="" width="100" height="100"></p>
                        </header>
                        <ul class="unitFriendButton unitListBtn unitListBtn-horizontal">
                            <li><button type="button" class="unitFriendButton_friendAccept unitButton btnAccept" data-username="${request.from_user}" data-id="${request.id}">${labels.friends.labelAccept}</button></li>
                            <li><button type="button" class="unitFriendButton_friendDecline unitButtonDecline unitButtonDecline-ico" data-username="${request.from_user}" data-id="${request.id}"><img src="/images/ico-cross.svg" alt="${labels.friends.labelDecline}" width="16px" height="16px"></button></li>
                        </ul>
                    </section>
                `;
                listRequestWrapper.innerHTML += requestElement;
            });
            resetListenFriendRequestList(pageInstance);
        }
    } catch (error) {
        console.error('Failed to update friend requests: ', error);
    }
}

export { updateFriendsList, updateFriendRequestList }
