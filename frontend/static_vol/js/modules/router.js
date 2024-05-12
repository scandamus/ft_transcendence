"use strict";

//page
import PageBase from '../components/PageBase.js';
import Home from '../components/Home.js';
import PageList from '../components/PageList.js';
import User from '../components/User.js';
import UserRegister from '../components/UserRegister.js';
import UserRegisterConfirm from '../components/UserRegisterConfirm.js';
import UserRegisterComplete from '../components/UserRegisterComplete.js';
import GamePlay from '../components/GamePlay.js';
import GameMatch from '../components/GameMatch.js';
import TournamentEntry from '../components/TournamentEntry.js';
import TournamentMatch from '../components/TournamentMatch.js';
import { getToken } from './token.js';

//todo: どれにも符合しない場合1つ目と見なされているので調整
const routes = [
    {path: "/page_list", view: PageList, isProtected: null},
    {path: "/", view: Home, isProtected: false},
    {path: "/register", view: UserRegister, isProtected: false},
    {path: "/register/confirm", view: UserRegisterConfirm, isProtected: false},
    {path: "/register/complete", view: UserRegisterComplete, isProtected: false},
    {path: "/user", view: User, isProtected: true},
    {path: "/game/play", view: GamePlay, isProtected: true},
    {path: "/game/match", view: GameMatch, isProtected: true},
    {path: "/tournament/entry", view: TournamentEntry, isProtected: true},
    {path: "/tournament/match", view: TournamentMatch, isProtected: true},
    // { path: "/user/:id", components: user },
];

//認証の必要なページ
const protectedRoutes = [/\/(?:user|game|tournament)\/?.*$/];

//pathを正規表現に変換
const pathToRegex = (path) => new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "/?$");

//todo: :idのような形式の場合
const getParams = (matchRoute) => {
    if (!matchRoute || !matchRoute.route || !matchRoute.route.path || !matchRoute.result) {
        return {};
    }
    const values = matchRoute.result.slice(1);
    const keys = Array.from(matchRoute.route.path.match(/:(\w+)/g) || []).map(result => result.slice(1));

    return Object.fromEntries(keys.map((key, i) => {
        return [key, values[i]];
    }));
};

const addLinkPageEvClick = (linkPages) => {
    linkPages.forEach((linkPage) => {
        linkPage.addEventListener("click", async (ev) => {
            ev.preventDefault();
            if (window.location.href === ev.target.href) {
                return;
            }
            history.pushState(null, null, ev.target.href);
            try {
                await router(getToken('accessToken'));
            } catch (error) {
                console.error(error);
            }
        });
    });
}

//認証の必要なページかチェック(protectedRoutesに定義したディレクトリ名始まりか判定)
const checkProtectedRoute = (path) => {
    return (protectedRoutes.some(route => route.test(path)));
}

const router = async (isLogin) => {
    const mapRoutes = routes.map(route => {
        return {
            route: route,
            result: location.pathname.match(pathToRegex(route.path))
        };
    });
    let matchRoute = mapRoutes.find(elRoute => elRoute.result !== null);
    if (!matchRoute) {//todo:404はpage_listに移動(暫定)
        matchRoute = {
            route: routes[0],
            result: routes[0].path
        };
    }

    //認証ページ判定
    //非ログイン状態で要認証ページにアクセス => ログインにリダイレクト
    //ログイン状態で非認証ページにアクセス => userにリダイレクト
    //ログイン状況を問わずアクセスできるページは、現状page_listのみ
    if (!isLogin && matchRoute.route.isProtected && matchRoute.result !== routes[0].path) {
        window.history.pushState({}, "", routes[1].path);
        matchRoute = {
            route: routes[1],
            result: routes[1].path
        };
    } else if (isLogin && matchRoute.route.isProtected === false) {
        //todo: page_list削除時に === false条件削除
        window.history.pushState({}, "", routes[5].path);
        matchRoute = {
            route: routes[5],
            result: routes[5].path
        };
    }

    const view = new matchRoute.route.view(getParams(matchRoute));
    if (view) {
        //前画面のeventListenerをrm
        const oldView = PageBase.instance;
        if (oldView) {
            oldView.destroy();
        }
        //view更新
        document.querySelector("#app").innerHTML = await view.renderHtml();
        view.afterRender();
        //todo: ↓afterRenderに統合
        const linkPages = document.querySelectorAll('#app a[data-link]');
        addLinkPageEvClick(linkPages);
    }
};

export { addLinkPageEvClick, router };
