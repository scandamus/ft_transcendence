'use strict';

//page
import PageBase from '../components/PageBase.js';
import Home from '../components/Home.js';
import Dashboard from '../components/Dashboard.js';
import Friends from '../components/Friends.js';
import Lounge from '../components/Lounge.js';
import UserRegister from '../components/UserRegister.js';
import UserRegisterConfirm from '../components/UserRegisterConfirm.js';
import UserRegisterComplete from '../components/UserRegisterComplete.js';
import GamePlay from '../components/GamePlay.js';
import GamePlayQuad from '../components/GamePlayQuad.js';
import Tournament from '../components/Tournament.js';
import TournamentDetail from '../components/TournamentDetail.js';
import { getToken } from './token.js';
import { closeModalOnCancel, closeModal, showModalExitGame } from './modal.js';

const routes = {
    login: {path: '/', view: Home, isProtected: false},
    register: {path: '/register', view: UserRegister, isProtected: false},
    registerConfirm: {path: '/register/confirm', view: UserRegisterConfirm, isProtected: false},
    registerComplete: {path: '/register/complete', view: UserRegisterComplete, isProtected: false},
    dashboard: {path: '/dashboard', view: Dashboard, isProtected: true},
    friends:  { path: '/friends', view: Friends, isProtected: true },
    lounge: {path: '/lounge', view: Lounge, isProtected: true},
    gamePlay: {path: '/game/pong/play:id', view: GamePlay, isProtected: true},
    gamePlayMulti: {path: '/game/pong4/play:id', view: GamePlayQuad, isProtected: true},
    tournament: {path: '/tournament', view: Tournament, isProtected: true},
    TournamentDetail: {path: '/tournament/detail:id', view: TournamentDetail, isProtected: true},
};

//pathを正規表現に変換
const pathToRegex = (path) => new RegExp('^' + path.replace(/\//g, '\\/').replace(/:\w+/g, '(.+)') + '/?$');

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

const linkSpa = async (ev) => {
    ev.preventDefault();
    const link = (ev.target.tagName === 'a') ? ev.target.href : ev.target.closest('a').href;
    if (window.location.href === ev.target.href || !link) {
        return;
    }
    history.pushState(null, null, link);
    try {
        await router(getToken('accessToken'));
    } catch (error) {
        console.error(error);
    }
}

const addLinkPageEvClick = (linkPages) => {
    linkPages.forEach((linkPage) => {
        linkPage.addEventListener('click', linkSpa);
    });
}

const replaceView = async (matchRoute) => {
    const view = new matchRoute.route.view(getParams(matchRoute));
    if (view) {
        //モーダルが開いていたら閉じる
        const elModal = document.querySelector('.blockModal');
        if (elModal) {
            if (matchRoute.route.path === routes.gamePlay.path) {
                closeModal();
            } else {
                closeModalOnCancel();
            }
        }
        //view更新
        document.getElementById('app').innerHTML = await view.renderHtml();
        view.afterRender();
    }
}

const router = async (accessToken) => {
    const currentPath = window.location.pathname;
    console.log(`currentPath: ${currentPath}`);
    if (accessToken instanceof PopStateEvent) {
        accessToken = getToken('accessToken');
    }
    //game進行中のexit
    if ((GamePlay.instance && GamePlay.instance.containerId) || (GamePlayQuad.instance && GamePlayQuad.instance.containerId)) {
        showModalExitGame();
        return ;
    }

    console.log('router in');
    const mapRoutes = Object.keys(routes).map(key => {
        const route = routes[key];
        return {
            route: route,
            result: location.pathname.match(pathToRegex(route.path))
        };
    });
    //実際の遷移先パスを取得
    let matchRoute = mapRoutes.find(elRoute => elRoute.result !== null);

    //認証ページ判定
    //非ログイン状態で要認証ページにアクセス => ログインにリダイレクト
    //非ログイン状態でmatchRouteなし(404) => ログインにリダイレクト
    //ログイン状態で非認証ページにアクセス => dashboardにリダイレクト
    //ログイン状態でmatchRouteなし(404) => dashboardにリダイレクト
    if (!accessToken && ((matchRoute && matchRoute.route.isProtected) || !matchRoute)) {
        window.history.pushState({}, '', routes.login.path);
        matchRoute = {
            route: routes.login,
            result: routes.login.path
        };
    } else if (accessToken && ((matchRoute && !matchRoute.route.isProtected) || !matchRoute)) {
        window.history.pushState({}, '', routes.dashboard.path);
        matchRoute = {
            route: routes.dashboard,
            result: routes.dashboard.path
        };
    }

    const oldView = PageBase.instance;
    // 2画面目以降
    if (oldView) {
        console.log("/*/*/ oldView.constructor.name::" + oldView.constructor.name);
        oldView.destroy();
    }
    await replaceView(matchRoute);
};

export { addLinkPageEvClick, router, routes, linkSpa };
