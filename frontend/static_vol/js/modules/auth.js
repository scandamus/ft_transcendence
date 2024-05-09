"use strict";

// token refresh 成功、失敗をboolで返す
const getRefreshToken = async () => {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            return false;
        }

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
    } catch (error) {
        console.error('Token refresh failed:', error);
    }
}


const checkLoginStatus = async () => {
    try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {//todo:test (undefinedなど)
            return false;
        }

        const response = await fetch('http://localhost:8001/api/players/userinfo/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
        });

        if (response.status === 401) {
            if (!await getRefreshToken()) {
                throw new Error('fail refresh token');
            }
            const accessToken2 = localStorage.getItem('accessToken');
            if (!accessToken2) {
                return false;
            }

            const response2 = await fetch('http://localhost:8001/api/players/userinfo/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken2}`
                },
            });
            if (response2.status === 401) {
                return false;
            } else {
                return await response2.json();
            }
        }
        return await response.json();
    } catch (error) {
        console.error('Error checking auth status:', error);
        return false;
    }
};

const switchDisplayAccount = async () => {
    const userData = await checkLoginStatus();
    const namePlayer = userData.username;
    const labelButtonLogin = "ログイン"; // TODO json 共通化したい
    const labelButtonLogout = "ログアウト"; // TODO json
    if (userData.is_authenticated) {
        document.querySelector("#headerAccount").innerHTML = `
            <header class="headerNav headerNav-login">
                <h2>${namePlayer}</h2>
                <p class="thumb"><img src="//ui-avatars.com/api/?name=Aa Bb&background=e3ad03&color=ffffff" alt="" width="30" height="30"></p>
            </header>
            <nav class="navGlobal">
                <ul class="navGlobal_list navList">
                    <li class="navList_item"><a href="/page_list" data-link>PageList</a></li>
                    <li id="" class="navList_item">
                        <form action="" method="post" class="blockForm blockForm-home">
                            <button type="submit" id="btnLogoutForm2" class="unitButton">${labelButtonLogout}</button>
                        </form>
                    </li>
                </ul>
            </nav>
        `;
    } else {
        document.querySelector("#headerAccount").innerHTML = `
            <h2><a href="/" data-link>${labelButtonLogin}</a></h2>
        `;
    }
}

export { getRefreshToken, switchDisplayAccount };