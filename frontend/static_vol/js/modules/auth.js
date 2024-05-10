"use strict";

const getAccessToken = () => {
    try {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken === null) {
            return null;//未ログイン
        }
        if (!accessToken) {//todo:test (undefinedなど)
            throw new Error('accessToken is invalid');
        }
        return accessToken;
    } catch (error) {
        // ここではエラーをキャッチせず呼び出し側でキャッチする
        return error;
    }
}

const getRefreshToken = () => {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            throw new Error('refreshToken is invalid');
        }
        return refreshToken;
    } catch (error) {
        return error;
    }
}

const refreshRefreshToken = async () => {
    try {
        const refreshToken = getRefreshToken();

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
        console.error('refreshRefreshToken:', error);
    }
}

const handleLogout = (ev) => {
    ev.preventDefault();
    const accessToken = getAccessToken();

    fetch('http://localhost:8001/api/players/logout/', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
        .then(response => {
            if (response.status === 401) {
                if (!refreshRefreshToken()) {
                    throw new Error('fail refresh token');
                    //todo: refresh token expired. 強制ログアウト
                }
                const accessToken2 = getAccessToken();
                if (!accessToken2) {
                    throw new Error('accessToken is invalid.');
                    //todo: 強制ログアウト
                }

                const response2 = fetch('http://localhost:8001/api/players/logout/', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                if (response2.status === 401) {
                    throw new Error('accessToken is invalid.');
                    //todo: 強制ログアウト
                }
            }
            //token rm
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            switchDisplayAccount().then(r => {console.log(r)});
        })
        .catch(error => {
            console.error('Logout failed:', error);
        });
}

const getIsLogin = async () => {
    if ((getAccessToken()) === null) {//localstrageにaccessTokenがkey自体ない=>ログアウト状態
        return null;
    }
    const userData = await checkLoginStatus();
    if (userData == null) {
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
        const accessToken = getAccessToken();
        const response = await fetch('http://localhost:8001/api/players/userinfo/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
        });

        if (response.ok) {
            return await response.json();
        } else if (response.status === 401) {
            if (!await refreshRefreshToken()) {
                throw new Error('fail refresh token');
            }
            const accessToken2 = getAccessToken();

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
    try {
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
    } catch (error) {
        console.error('switchDisplayAccount:', error);
    }
}

export { getAccessToken, refreshRefreshToken, switchDisplayAccount };