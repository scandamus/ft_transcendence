'use strict';

import { getToken, refreshAccessToken } from './token.js';
import { handleLogout } from './logout.js';
import PageBase from '../components/PageBase.js';
import { labels } from './labels.js';
import { SiteInfo } from "./SiteInfo.js";

const fetchUserInfo = async (isRefresh) => {
    const accessToken = getToken('accessToken');
    if (accessToken === null) {
        return Promise.resolve(null);//logout状態なら何もしない
    }
    const response = await fetch('/api/players/userinfo/', {
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
    const onAnimationEnd = (ev) => {
        if (ev.target === navGlobal) {
            navGlobal.style.display = 'none';
            navGlobal.removeEventListener('animationend', onAnimationEnd);
        }
    };
    if (navGlobal.classList.contains(classIsShow)) {
        navGlobal.classList.remove(classIsShow);
        navGlobal.addEventListener('animationend', onAnimationEnd);
    } else {
        navGlobal.style.display = 'block';
        requestAnimationFrame(() => {
            navGlobal.classList.add(classIsShow);
        });
    }
}

const switchDisplayAccount = async () => {
    const siteInfo = new SiteInfo();
    const username = siteInfo.getUsername();
    const avatar = siteInfo.getAvatar();
    if (username) {
        document.getElementById('headerAccount').innerHTML = `
            <header id="btnNavHeader" class="headerNav headerNav-login">
                <h2>${username}</h2>
                <p class="thumb"><img src="${avatar}" alt="" width="30" height="30"></p>
            </header>
            <nav id="navGlobal" class="navGlobal">
                <ul class="navGlobal_list navList">
                    <li id="" class="navList_item">
                        <form action="" method="post" class="blockForm">
                            <button type="submit" id="btnLogoutForm" class="unitButton">${labels.home.labelButtonLogout}</button>
                        </form>
                    </li>
                </ul>
            </nav>
        `;
        //addEvent
        const btnLogout = document.getElementById('btnLogoutForm');
        btnLogout.addEventListener('click', handleLogout);
        const btnNavHeader = document.getElementById('btnNavHeader');
        btnNavHeader.addEventListener('click', showMenu);
        btnNavHeader.nextElementSibling.style.display = 'none';
    } else {
        //removeEvent
        const btnLogout = document.getElementById('btnLogoutForm');
        if (btnLogout) {
            btnLogout.removeEventListener('click', handleLogout);
        }
        const btnNavHeader = document.getElementById('btnNavHeader');
        if (btnNavHeader) {
            btnNavHeader.removeEventListener('click', showMenu);
        }
        //Account表示reset
        document.getElementById('headerAccount').innerHTML = '';
    }
}

export { getUserInfo, switchDisplayAccount };
