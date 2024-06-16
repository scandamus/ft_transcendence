class PageInstances {
    constructor() {
        this.instances = {};
    }

    getInstance(pageName) {
        return this.instances[pageName];
    }

    setInstance(pageName, instance) {
        console.log(`instance for ${pageName} is set`);
        this.instances[pageName] = instance;
    }

    removeInstance(pageName) {
        console.log(`instance for ${pageName} is removed`);
        delete this.instances[pageName];
    }

    cleanupAll() {
        for (const pageName in this.instances) {
            this.removeInstance(pageName);
        }
    }
}

export const pageInstances = new PageInstances();