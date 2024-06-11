'use strict';

//page
import PageBase from '../components/PageBase.js';
import Home from '../components/Home.js';
import PageList from '../components/PageList.js';
import Dashboard from '../components/Dashboard.js';
import Friends from '../components/Friends.js';
import Lounge from '../components/Lounge.js';
import UserRegister from '../components/UserRegister.js';
import UserRegisterConfirm from '../components/UserRegisterConfirm.js';
import UserRegisterComplete from '../components/UserRegisterComplete.js';
import GamePlay from '../components/GamePlay.js';
import GameMatch from '../components/GameMatch.js';
import TournamentEntry from '../components/TournamentEntry.js';
import TournamentMatch from '../components/TournamentMatch.js';
import { getToken } from './token.js';
import { closeModalOnCancel } from './modal.js';

//todo: どれにも符合しない場合1つ目と見なされているので調整
const routes = {
    pageList: {path: '/page_list', view: PageList, isProtected: null},
    login: {path: '/', view: Home, isProtected: false},
    register: {path: '/register', view: UserRegister, isProtected: false},
    registerConfirm: {path: '/register/confirm', view: UserRegisterConfirm, isProtected: false},
    registerComplete: {path: '/register/complete', view: UserRegisterComplete, isProtected: false},
    dashboard: {path: '/dashboard', view: Dashboard, isProtected: true},
    friends:  { path: '/friends', view: Friends, isProtected: true },
    lounge: {path: '/lounge', view: Lounge, isProtected: true},
    gamePlay: {path: '/game/play', view: GamePlay, isProtected: true},
    gameMatch: {path: '/game/match', view: GameMatch, isProtected: true},
    tournamentEntry: {path: '/tournament/entry', view: TournamentEntry, isProtected: true},
    tournamentMatch: {path: '/tournament/match', view: TournamentMatch, isProtected: true},
};

//認証の必要なページ
const protectedRoutes = [/\/(?:user|game|tournament)\/?.*$/];

//pathを正規表現に変換
const pathToRegex = (path) => new RegExp('^' + path.replace(/\//g, '\\/').replace(/:\w+/g, '(.+)') + '/?$');

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
        linkPage.addEventListener('click', async (ev) => {
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

const replaceView = async (matchRoute) => {
    const view = new matchRoute.route.view(getParams(matchRoute));
    if (view) {
        //モーダルが開いていたら閉じる
        //todo: openModal後のフローに組み込む方がよさそう
        const elModal = document.querySelector('.blockModal');
        if (elModal) {
            closeModalOnCancel();
        }

        //前画面のeventListenerをrm
        const oldView = PageBase.instance;
        if (oldView) {
            oldView.destroy();
        }
        //view更新
        document.getElementById('app').innerHTML = await view.renderHtml();
        view.afterRender();
        //todo: ↓afterRenderに統合
        const linkPages = document.querySelectorAll('#app a[data-link]');
        addLinkPageEvClick(linkPages);
    }
}

const router = async (accessToken) => {
    if (accessToken instanceof PopStateEvent) {
        accessToken = getToken('accessToken');
    }

    const mapRoutes = Object.keys(routes).map(key => {
        const route = routes[key];
        return {
            route: route,
            result: location.pathname.match(pathToRegex(route.path))
        };
    });
    //実際の遷移先パスを取得
    let matchRoute = mapRoutes.find(elRoute => elRoute.result !== null);
    if (!matchRoute) {//todo:404はpage_listに移動(暫定)
        matchRoute = {
            route: routes.pageList,
            result: routes.pageList.path
        };
    }

    //認証ページ判定
    //非ログイン状態で要認証ページにアクセス => ログインにリダイレクト
    //ログイン状態で非認証ページにアクセス => userにリダイレクト
    //ログイン状況を問わずアクセスできるページは、現状page_listのみ
    if (!accessToken && matchRoute.route.isProtected && matchRoute.result !== routes.pageList.path) {
        window.history.pushState({}, '', routes.login.path);
        matchRoute = {
            route: routes.login,
            result: routes.login.path
        };
    } else if (accessToken && matchRoute.route.isProtected === false) {
        //todo: page_list削除時に === false条件削除
        window.history.pushState({}, '', routes.dashboard.path);
        matchRoute = {
            route: routes.dashboard,
            result: routes.dashboard.path
        };
    }
    await replaceView(matchRoute);
};

export { addLinkPageEvClick, router, routes };
