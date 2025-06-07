/**
 * Main application entry point for Shuchu-kun
 */
class App {
    private notificationManager: NotificationPermissionManager;

    constructor() {
        this.notificationManager = new NotificationPermissionManager();
    }

    /**
     * Initialize the application
     */
    public init(): void {
        console.log('集中君アプリが初期化されました');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});