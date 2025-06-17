/**
 * 集中君のメインアプリケーションエントリーポイント
 */
import { NotificationPermissionManager } from './NotificationPermissionManager';
class App {
    constructor() {
        this.notificationManager = new NotificationPermissionManager();
    }
    /**
     * アプリケーションを初期化
     */
    init() {
        console.log('集中君アプリが初期化されました');
    }
}
// DOMが読み込まれたときにアプリを初期化
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});
//# sourceMappingURL=App.js.map