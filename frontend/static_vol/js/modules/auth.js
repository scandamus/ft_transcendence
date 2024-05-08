"use strict";

const switchDisplayAccount = (isLogIn) => {
    if (isLogIn) {
        const namePlayer = "プレイヤー名";//todo: DBからとってくる
        document.querySelector("#headerAccount").innerHTML = `
      <header class="headerNav headerNav-login">
        <h2>${namePlayer}</h2>
        <p class="thumb"><img src="//ui-avatars.com/api/?name=Aa Bb&background=e3ad03&color=ffffff" alt="" width="30" height="30"></p>
      </header>
      <nav class="navGlobal">
        <ul class="navGlobal_list navList">
          <li class="navList_item"><a href="/page_list" data-link>PageList</a></li>
        </ul>
      </nav>
    `;
    } else {
        document.querySelector("#headerAccount").innerHTML = `
      <h2><a href="/" data-link>login</a></h2>
    `;
    }
}

const checkLoginStatus = async () => {
    try {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        if (!accessToken) {
            console.log("checkLoginStatus !accessToken")
            return false;
        }

        const response = await fetch('http://localhost:8001/api/players/userinfo/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Refresh-Token': `${refreshToken}`
            },
        });

        if (response.status === 401) {
            console.log("checkLoginStatus 401")
            return false;
        }
        const data = await response.json();
        return data.is_authenticated;
    } catch (error) {
        console.error('Error checking auth status:', error);
        return false;
    }
};

export { switchDisplayAccount, checkLoginStatus };