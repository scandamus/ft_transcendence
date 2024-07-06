class SiteInfo {
    constructor() {
        if (!SiteInfo.instance) {
            this.username = '';
            this.avatar = '';
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
    }
}

export { SiteInfo };