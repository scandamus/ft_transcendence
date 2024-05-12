"use strict";

import { getToken, refreshAccessToken } from "/js/modules/token.js";
import { handleLogout } from "/js/modules/logout.js";

const getIsLogin = async () => {
    if ((getToken('accessToken')) === null) {//localstrageにaccessTokenがkey自体ない=>ログアウト状態
        return null;
    }
    const userData = await getUserInfo();
    if (userData === null) {
        return null;
    }
    if (userData.is_authenticated) {
        return userData;
    } else {
        return null;
    }
}

const getUserInfo = async () => {
    try {
        const accessToken = getToken('accessToken');
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
    } catch (error) {
        console.error('getUserInfo:', error);
        return null;
    }
}

const switchDisplayAccount = async () => {
    const labelButtonLogout = "ログアウト"; // TODO json 共通化したい
    const userData = await getIsLogin();
    if (userData !== null) {
        const namePlayer = userData.username;
        document.querySelector("#headerAccount").innerHTML = `
            <header class="headerNav headerNav-login">
                <h2>${namePlayer}</h2>
                <p class="thumb"><img src="//ui-avatars.com/api/?name=Aa Bb&background=e3ad03&color=ffffff" alt="" width="30" height="30"></p>
            </header>
            <nav class="navGlobal">
                <ul class="navGlobal_list navList">
                    <li class="navList_item"><a href="/page_list" data-link>PageList</a></li>
                    <li id="" class="navList_item">
                        <form action="" method="post" class="blockForm">
                            <button type="submit" id="btnLogoutForm" class="unitButton">${labelButtonLogout}</button>
                        </form>
                    </li>
                </ul>
            </nav>
        `;
        const btnLogout = document.querySelector("#btnLogoutForm");
        btnLogout.addEventListener("click", handleLogout);
    } else {
        document.querySelector("#headerAccount").innerHTML = "";
    }
}

export { switchDisplayAccount };
