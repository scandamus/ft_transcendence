class SiteInfo {
    constructor() {
        if (!SiteInfo.instance) {
            this.username = '';
            this.avatar = '';
            this.isTokenRefreshing = false;
            this.promiseTokenRefresh = null;
            this.refreshIntervalId = null;
            SiteInfo.instance = this;
        }
        return SiteInfo.instance;
    }

    setUsername(username) {
        this.username = username;
    }

    setAvatar(urlAvatar) {
        if (urlAvatar) {
            this.avatar = `${urlAvatar}`;
        } else {
            this.avatar = `/images/avatar_default.png`;
        }
    }

    getUsername() {
        return this.username;
    }

    getAvatar() {
        return this.avatar;
    }

    reset() {
        this.username = '';
        this.avatar = '';
        this.refreshIntervalId = null;
    }

    setRefreshIntervalId(id) {
        this.refreshIntervalId = id;
    }

    getRefreshIntervalId() {
        return this.refreshIntervalId;
    }
}

export { SiteInfo };