class SiteInfo {
    constructor() {
        if (!SiteInfo.instance) {
            this.username = 'DefaultUsername';
            SiteInfo.instance = this;
        }
        return SiteInfo.instance;
        //this.username = 'DefaultUsername';
        //this.username = '';
    }

    setUsername(username) {
        this.username = username;
    }

    getUsername() {
        return this.username;
    }
}

export { SiteInfo };