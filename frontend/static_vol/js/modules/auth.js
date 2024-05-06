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
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    //todo: token格納されていなければfalse
    //todo: Token期限
    try {
        const response = await fetch('http://localhost:8001/api/players/userinfo/', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                'Refresh-Token': refreshToken
            }
        });
        if (response.ok) {
            const data = await response.json();
            return !!(data.is_authenticated);
        } else {
            return false;
        }
    } catch (error) {
        console.error('Login check failed:', error);
        return false;
    }
};

export { checkLoginStatus };