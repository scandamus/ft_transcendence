'use strict';

import { getToken, refreshAccessToken } from './token.js';
import { handleLogout } from './logout.js';

const getUserInfo = async () => {
    const accessToken = getToken('accessToken');
    //localStorageにaccessTokenがkey自体ない=>ログアウト状態
    if (accessToken === null) {
        return Promise.resolve(null);
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
        if (!await refreshAccessToken()) {
            throw new Error('fail refresh token');
        }
        const accessToken2 = getToken('accessToken');
        if (accessToken2 === null) {
            throw new Error('fail refresh token');
        }
        const response2 = await fetch('http://localhost:8001/api/players/userinfo/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken2}`
            },
        });
        if (response2.ok) {
            return await response2.json();
        } else {
            throw new Error('fail get userinfo');
        }
    }
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
    const labelButtonLogout = 'ログアウト'; // TODO json 共通化したい
    if (userData !== null) {
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
