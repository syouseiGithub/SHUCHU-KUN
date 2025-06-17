/**
 * 集中君アプリの通知許可管理クラス
 * Web Notifications APIの許可確認とリクエストを処理します
 */
export class NotificationPermissionManager {
    constructor(notificationPermissionScreen, mainAppScreen, enableNotificationBtn, dependencies) {
        this.notificationPermissionScreen = notificationPermissionScreen !== null && notificationPermissionScreen !== void 0 ? notificationPermissionScreen : document.getElementById('notification-permission-screen');
        this.mainAppScreen = mainAppScreen !== null && mainAppScreen !== void 0 ? mainAppScreen : document.getElementById('main-app-screen');
        this.enableNotificationBtn = enableNotificationBtn !== null && enableNotificationBtn !== void 0 ? enableNotificationBtn : document.getElementById('enable-notification-btn');
        // デフォルトの依存関係はブラウザAPIを使用
        this.dependencies = dependencies !== null && dependencies !== void 0 ? dependencies : this.createDefaultDependencies();
        this.init();
    }
    /**
     * ブラウザAPIを使用するデフォルトの依存関係を作成
     */
    createDefaultDependencies() {
        return {
            notificationAPI: {
                get permission() {
                    return ('Notification' in window && window.Notification) ? Notification.permission : 'denied';
                },
                async requestPermission() {
                    if ('Notification' in window && window.Notification) {
                        return await Notification.requestPermission();
                    }
                    return 'denied';
                },
                create(title, options) {
                    if ('Notification' in window && window.Notification) {
                        new Notification(title, options);
                    }
                },
                isSupported() {
                    return 'Notification' in window && typeof window.Notification !== 'undefined';
                }
            },
            console: {
                warn: (message) => console.warn(message),
                error: (message, error) => console.error(message, error)
            },
            alert: (message) => alert(message)
        };
    }
    /**
     * 通知許可管理を初期化
     */
    init() {
        this.checkNotificationPermission();
        this.bindEvents();
    }
    /**
     * 現在の通知許可状態を確認し、適切な画面を表示
     */
    checkNotificationPermission() {
        if (!this.dependencies.notificationAPI.isSupported()) {
            this.dependencies.console.warn('This browser does not support notifications');
            this.showNotificationPermissionScreen();
            return;
        }
        switch (this.dependencies.notificationAPI.permission) {
            case 'granted':
                this.showMainAppScreen();
                break;
            case 'denied':
            case 'default':
                this.showNotificationPermissionScreen();
                break;
        }
    }
    /**
     * ユーザーに通知許可をリクエスト
     */
    async requestNotificationPermission() {
        if (!this.dependencies.notificationAPI.isSupported()) {
            this.dependencies.alert('このブラウザは通知機能をサポートしていません。');
            return;
        }
        try {
            const permission = await this.dependencies.notificationAPI.requestPermission();
            if (permission === 'granted') {
                this.showMainAppScreen();
                // テスト通知を表示
                this.dependencies.notificationAPI.create('集中君', {
                    body: '通知機能が有効になりました！',
                    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎯</text></svg>'
                });
            }
            else {
                this.dependencies.alert('通知機能を有効にしてください。ブラウザの設定から通知を許可できます。');
            }
        }
        catch (error) {
            this.dependencies.console.error('Error requesting notification permission:', error);
            this.dependencies.alert('通知機能の許可中にエラーが発生しました。');
        }
    }
    /**
     * 通知許可画面を表示
     */
    showNotificationPermissionScreen() {
        if (this.notificationPermissionScreen) {
            this.notificationPermissionScreen.classList.remove('hidden');
        }
        if (this.mainAppScreen) {
            this.mainAppScreen.classList.add('hidden');
        }
    }
    /**
     * メインアプリ画面を表示
     */
    showMainAppScreen() {
        if (this.notificationPermissionScreen) {
            this.notificationPermissionScreen.classList.add('hidden');
        }
        if (this.mainAppScreen) {
            this.mainAppScreen.classList.remove('hidden');
        }
    }
    /**
     * イベントリスナーをバインド
     */
    bindEvents() {
        if (this.enableNotificationBtn) {
            this.enableNotificationBtn.addEventListener('click', () => {
                this.requestNotificationPermission();
            });
        }
    }
    /**
     * 現在の通知許可状態を取得
     * @returns 現在の許可状態
     */
    getPermissionStatus() {
        return this.dependencies.notificationAPI.permission;
    }
    /**
     * 通知がサポートされているかを確認
     * @returns 通知がサポートされている場合はtrue
     */
    isNotificationSupported() {
        return this.dependencies.notificationAPI.isSupported();
    }
}
//# sourceMappingURL=NotificationPermissionManager.js.map