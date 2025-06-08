"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Main application entry point for Shuchu-kun
 */
const NotificationPermissionManager_1 = require("./NotificationPermissionManager");
class App {
    constructor() {
        this.notificationManager = new NotificationPermissionManager_1.NotificationPermissionManager();
    }
    /**
     * Initialize the application
     */
    init() {
        console.log('集中君アプリが初期化されました');
    }
}
// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});
//# sourceMappingURL=App.js.map