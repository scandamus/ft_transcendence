"use strict";

const checkLoginStatus = async () => {
    try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            //console.log("checkLoginStatus !accessToken")
            return false;
        }

        const response = await fetch('http://localhost:8001/api/players/userinfo/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
        });

        if (response.status === 401) {
            //console.log("checkLoginStatus 401")
            return false;
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

export { switchDisplayAccount };