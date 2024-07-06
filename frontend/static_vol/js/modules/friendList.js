'use strict';

import { fetchFriendRequests, fetchFriends, fetchRecommend } from "./friendsApi.js";
import { addListenSendFriendRequest, resetListenFriendList, resetListenFriendRequestList } from "./friendListener.js";
import { labels } from "./labels.js";
import PageBase from "../components/PageBase.js";

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const updateFriendsList = async (pageInstance) => {
    console.log('updateFriendList in');
    const isPageFriend = PageBase.isInstance(pageInstance, 'Friends');
    try {
        let friends = await fetchFriends(false);
        if (friends && !isPageFriend && friends.length > 1) {
            shuffleArray(friends);
        }
        const listFriendsWrapper = document.querySelector('.blockFriends_friends');
        if (!friends || friends.length === 0) {
            listFriendsWrapper.innerHTML = `<p>${labels.friends.msgNoFriends}</p>`
        } else {
            listFriendsWrapper.innerHTML = '';
            for (let i = 0; i < friends.length; i++) {
                if (!isPageFriend && i >= 3) break; // isPageFriendがfalseの場合、3件で打ち切る
                const friend = friends[i];
                const avatar = friend.avatar ? friend.avatar : '/images/avatar_default.png';
                //todo: friendsの状況に応じて online/ offline / busy で切り替える
                const onlineStatus = friend.online ? 'online' : ''; //'online';
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
                listFriendsWrapper.innerHTML += friendElement;
            }
            resetListenFriendList(pageInstance);
        }
    } catch (error) {
        console.error('Failed to update friends list: ', error);
    }
}

const updateFriendRequestList = async (pageInstance) => {
    console.log('updateFriendRequestList in');
    try {
        const requests = await fetchFriendRequests(false);
        const secRequestWrapper = document.querySelector('.blockFriendRequest');
        const listRequestWrapper = document.querySelector('.blockFriendRequest_friends');
        if (!requests || requests.length === 0) {
            if (!secRequestWrapper.classList.contains('is-noRequest')) {
                secRequestWrapper.classList.add('is-noRequest');
            }
        } else {
            if (secRequestWrapper.classList.contains('is-noRequest')) {
                secRequestWrapper.classList.remove('is-noRequest');
            }
            listRequestWrapper.innerHTML = '';
            requests.forEach(request => {
                const avatar = request.from_user_avatar ? request.from_user_avatar : '/images/avatar_default.png';
                const requestElement = `
                    <section class="unitFriend">
                        <header class="unitFriend_header">
                            <h4 class="unitFriend_name">${request.from_user}</h4>
                            <p class="unitFriend_thumb"><img src="${avatar}" alt="" width="100" height="100"></p>
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

const updateRecommend = async (pageInstance) => {
    console.log('updateRecommend');
    try {
        const RecommendedList = await fetchRecommend(false);
        const RecommendedWrapper = document.querySelector('.blockFriendRecommended_friends');
        if (!RecommendedList || RecommendedList.length === 0) {
            RecommendedWrapper.innerHTML = `<p>${labels.friends.msgNoRecommended}</p>`
        } else {
            RecommendedWrapper.innerHTML = '';
            RecommendedList.forEach(player => {
                const avatar = player.avatar ? player.avatar : '/images/avatar_default.png';
                const requestElement = `
                    <section class="unitFriend">
                        <header class="unitFriend_header">
                            <h4 class="unitFriend_name">${player.username}</h4>
                            <p class="unitFriend_thumb"><img src="${avatar}" alt="" width="100" height="100"></p>
                        </header>
                        <p class="unitFriendButton">
                            <button type="button" class="unitFriendButton_friendRequest unitButton" data-username="${player.username}">${labels.friends.labelRequest}</button>
                        </p>
                    </section>
                `;
                RecommendedWrapper.innerHTML += requestElement;
            });
            addListenSendFriendRequest(pageInstance);
        }
    } catch (error) {
        console.error('Failed to update recommended: ', error);
    }
}

export { updateFriendsList, updateFriendRequestList, updateRecommend }
