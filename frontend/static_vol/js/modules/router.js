"use strict";

//page
import Home from "/js/components/Home.js";
import PageList from "/js/components/PageList.js";
import User from "/js/components/User.js";
import UserRegister from "/js/components/UserRegister.js";
import UserRegisterConfirm from "/js/components/UserRegisterConfirm.js";
import UserRegisterComplete from "/js/components/UserRegisterComplete.js";
import GamePlay from "/js/components/GamePlay.js";
import GameMatch from "/js/components/GameMatch.js";
import TournamentEntry from "/js/components/TournamentEntry.js";
import TournamentMatch from "/js/components/TournamentMatch.js";

//todo: どれにも符合しない場合1つ目と見なされているので調整
const routes = [
    { path: "/page_list", view: PageList },
    { path: "/", view: Home },
    { path: "/register", view: UserRegister },
    { path: "/register/confirm", view: UserRegisterConfirm },
    { path: "/register/complete", view: UserRegisterComplete },
    { path: "/user", view: User },
    { path: "/game/play", view: GamePlay },
    { path: "/game/match", view: GameMatch },
    { path: "/tournament/entry", view: TournamentEntry },
    { path: "/tournament/match", view: TournamentMatch }
    // { path: "/user/:id", components: user },
];

//認証の必要なページ
const protectedRoutes = [/\/(?:user|game|tournament)\/?.*$/];

//pathを正規表現に変換
const pathToRegex = (path) => new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");
//:idのような形式の場合
const getParams = (match) => {
    if (!match || !match.route || !match.route.path) {
    return {};
    }
    const values = match.result.slice(1);
    const keys = Array.from(match.route.path.match(/:(\w+)/g) || []).map(result => result.slice(1));

    return Object.fromEntries(keys.map((key, i) => {
        return [key, values[i]];
    }));
};

const addLinkPageEvClick = (linkPages) => {
    linkPages.forEach((linkPage) => {
        linkPage.addEventListener("click", async (ev) => {
            ev.preventDefault();
            if (window.location.href === ev.target.href) {
                return ;
            }
            history.pushState(null, null, ev.target.href);
            try {
                await router();
            } catch (error) {
                console.error(error);
            }
        });
    });
}

//認証の必要なページかチェック
const checkProtectedRoute = (path) => {
    return (protectedRoutes.some(route => route.test(path)));
}

const isConstructor = (value) => {
  try {
    new value();
  } catch {
    return false;
  }
  return true;
}

const router = async (ev) => {
    const potentialMatches = routes.map(route => {
        return {
            route: route,
            result: location.pathname.match(pathToRegex(route.path))
        };
    });
    let match = potentialMatches.find(potentialMatch => potentialMatch.result !== null);
    if (!match) {//404
        match = {
            route: routes[0],
            result: [location.pathname]
        };
    }

    //const view = isConstructor(match.route.view) ? new match.route.view(getParams(match)) : null;
    const view = new match.route.view(getParams(match));
    if (view) {
        document.querySelector("#app").innerHTML = await view.getHtml();
        const linkPages = document.querySelectorAll('#app a[data-link]');
        addLinkPageEvClick(linkPages);
    }
};

export { addLinkPageEvClick, checkProtectedRoute, router };