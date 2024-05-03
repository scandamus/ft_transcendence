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
  const isLogIn = true;
  switchDisplayAccount(isLogIn);
  return (isLogIn);
};

export { checkLoginStatus };