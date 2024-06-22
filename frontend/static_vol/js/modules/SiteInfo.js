class SiteInfo {
    constructor() {
        if (!SiteInfo.instance) {
            this.username = '';
            SiteInfo.instance = this;
        }
        return SiteInfo.instance;
    }

    setUsername(username) {
        this.username = username;
    }

    getUsername() {
        return this.username;
    }
}

export { SiteInfo };