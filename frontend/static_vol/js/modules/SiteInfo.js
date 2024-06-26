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
        this.avatar = `/static/${urlAvatar}`;
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