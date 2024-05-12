"use strict";

//localstrageにtokenがkey自体ない=>ログアウト状態
//tokenがundefined=>何かがおかしい
const getToken = (nameToken) => {
    const token = localStorage.getItem(nameToken);
    if (token === null) {
        return null;//未ログイン
    }
    if (!token) {//todo:test (undefinedなど)
        throw new Error(`${nameToken} is invalid`);
    }
    return token;
}

const refreshToken = async () => {
    const refreshToken = getToken('refreshToken');

    // SimpleJWTのリフレッシュトークン発行はbodyにrefreshを渡す仕様
    const response = await fetch('http://localhost:8001/token/refresh/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'refresh': `${refreshToken}` })
    });
    if (response.ok) {
        const refreshData = await response.json();
        localStorage.setItem('accessToken', refreshData.access);
        return true;
    }
    // refreshToken無効。
    return false;
}

const fetchLogout = async (isRefresh) => {
    const accessToken = getToken('accessToken');
    if (accessToken === null) {
        throw new Error('accessToken is invalid.');
        //todo: 強制ログアウト
    }
    const response = await fetch('http://localhost:8001/api/players/logout/', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    if (response.status === 401) {
        if (!isRefresh) {
            //初回のaccessToken expiredならrefreshして再度ログイン
            if (!await refreshToken()) {
                throw new Error('fail refresh token');
                //todo: refresh token expired. 強制ログアウト
            }
            await fetchLogout(true);
        }
        //todo: tokenRefresh後も401なら例外throw。強制ログアウト
        throw new Error('accessToken is invalid.');

    } else if (response.ok) {
        //token rm
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        switchDisplayAccount();//not return
    } else {
        throw new Error(`fetchLogout error. status: ${response.status}`);
    }
}

const handleLogout = (ev) => {
    ev.preventDefault();
    fetchLogout(false)
        .catch(error => {
            console.error('Logout failed:', error);
        });
}

const getIsLogin = async () => {
    if ((getToken('accessToken')) === null) {//localstrageにaccessTokenがkey自体ない=>ログアウト状態
        return null;
    }
    const userData = await checkLoginStatus();
    if (userData === null) {
        return null;
    }
    if (userData.is_authenticated) {
        return userData;
    } else {
        return null;
    }
}

const checkLoginStatus = async () => {
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
            if (!await refreshToken()) {
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
        console.error('checkLoginStatus:', error);
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

export { getToken, refreshToken, switchDisplayAccount };