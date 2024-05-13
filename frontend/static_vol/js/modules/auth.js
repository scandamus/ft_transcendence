'use strict';

import { getToken, refreshAccessToken } from './token.js';
import { handleLogout } from './logout.js';

const fetchUserInfo = async (isRefresh) => {
    const accessToken = getToken('accessToken');
    if (accessToken === null) {
        return Promise.resolve(null);//logout状態なら何もしない
    }
    const response = await fetch('http://localhost:8001/api/players/userinfo/', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        },
    });
    if (response.ok) {
        return await response.json();
    } else if (response.status === 401) {
        if (!isRefresh) {
            //初回のaccessToken expiredならrefreshして再度ログイン
            if (!await refreshAccessToken()) {
                throw new Error('fail refresh token');
            }
            return await fetchUserInfo(true);
        } else {
            throw new Error('refreshed accessToken is invalid.');
        }
    } else {
        throw new Error(`fetchUserInfo error. status: ${response.status}`);
    }
}

const getUserInfo = async () => {
    return fetchUserInfo(false)
        .then((userData) => {
            if (!userData) {
                return Promise.resolve(null);
            }
            return userData;
        })
        .catch(error => {
            console.error('getUserInfo failed:', error);
        })
}

const showMenu = () => {
    const classIsShow = 'is-show';
    const navGlobal = document.getElementById('navGlobal');
    if (navGlobal.classList.contains(classIsShow)) {
        navGlobal.classList.remove(classIsShow);
        navGlobal.addEventListener('animationend', () => {
            navGlobal.style.display = 'none';
        }, { once: true });
    } else {
        navGlobal.style.display = 'block';
        requestAnimationFrame(() => {
            navGlobal.classList.add(classIsShow);
        });
    }
}

const switchDisplayAccount = async (userData) => {
    if (userData) {
        const labelButtonLogout = 'ログアウト'; // TODO json 共通化したい
        const namePlayer = userData.username;
        document.getElementById('headerAccount').innerHTML = `
            <header id="btnNavHeader" class="headerNav headerNav-login">
                <h2>${namePlayer}</h2>
                <p class="thumb"><img src="//ui-avatars.com/api/?name=Aa Bb&background=e3ad03&color=ffffff" alt="" width="30" height="30"></p>
            </header>
            <nav id="navGlobal" class="navGlobal">
                <ul class="navGlobal_list navList">
                    <li id="" class="navList_item">
                        <form action="" method="post" class="blockForm">
                            <button type="submit" id="btnLogoutForm" class="unitButton">${labelButtonLogout}</button>
                        </form>
                    </li>
                </ul>
            </nav>
        `;
        const btnLogout = document.getElementById('btnLogoutForm');
        btnLogout.addEventListener('click', handleLogout);
        const btnNavHeader = document.getElementById('btnNavHeader');
        btnNavHeader.addEventListener('click', showMenu);
        btnNavHeader.nextElementSibling.style.display = 'none';
    } else {
        document.getElementById('headerAccount').innerHTML = '';
    }
}

export { getUserInfo, switchDisplayAccount };
