"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationPermissionManager = void 0;
/**
 * Notification permission manager for the Shuchu-kun app
 * Handles Web Notifications API permission checks and requests
 */
class NotificationPermissionManager {
    constructor(notificationPermissionScreen, mainAppScreen, enableNotificationBtn, dependencies) {
        this.notificationPermissionScreen = notificationPermissionScreen !== null && notificationPermissionScreen !== void 0 ? notificationPermissionScreen : document.getElementById('notification-permission-screen');
        this.mainAppScreen = mainAppScreen !== null && mainAppScreen !== void 0 ? mainAppScreen : document.getElementById('main-app-screen');
        this.enableNotificationBtn = enableNotificationBtn !== null && enableNotificationBtn !== void 0 ? enableNotificationBtn : document.getElementById('enable-notification-btn');
        // Default dependencies use browser APIs
        this.dependencies = dependencies !== null && dependencies !== void 0 ? dependencies : this.createDefaultDependencies();
        this.init();
    }
    /**
     * Create default dependencies that use browser APIs
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
     * Initialize the notification permission manager
     */
    init() {
        this.checkNotificationPermission();
        this.bindEvents();
    }
    /**
     * Check current notification permission status and show appropriate screen
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
     * Request notification permission from the user
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
                // Show a test notification
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
     * Show the notification permission screen
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
     * Show the main app screen
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
     * Bind event listeners
     */
    bindEvents() {
        if (this.enableNotificationBtn) {
            this.enableNotificationBtn.addEventListener('click', () => {
                this.requestNotificationPermission();
            });
        }
    }
    /**
     * Get current notification permission status
     * @returns The current permission status
     */
    getPermissionStatus() {
        return this.dependencies.notificationAPI.permission;
    }
    /**
     * Check if notifications are supported
     * @returns True if notifications are supported
     */
    isNotificationSupported() {
        return this.dependencies.notificationAPI.isSupported();
    }
}
exports.NotificationPermissionManager = NotificationPermissionManager;
//# sourceMappingURL=NotificationPermissionManager.js.map