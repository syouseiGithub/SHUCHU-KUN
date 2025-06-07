/**
 * Notification permission manager for the Shuchu-kun app
 * Handles Web Notifications API permission checks and requests
 */
class NotificationPermissionManager {
    private notificationPermissionScreen: HTMLElement | null;
    private mainAppScreen: HTMLElement | null;
    private enableNotificationBtn: HTMLElement | null;

    constructor() {
        this.notificationPermissionScreen = document.getElementById('notification-permission-screen');
        this.mainAppScreen = document.getElementById('main-app-screen');
        this.enableNotificationBtn = document.getElementById('enable-notification-btn');
        
        this.init();
    }

    /**
     * Initialize the notification permission manager
     */
    private init(): void {
        this.checkNotificationPermission();
        this.bindEvents();
    }

    /**
     * Check current notification permission status and show appropriate screen
     */
    private checkNotificationPermission(): void {
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications');
            this.showNotificationPermissionScreen();
            return;
        }

        switch (Notification.permission) {
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
    private async requestNotificationPermission(): Promise<void> {
        if (!('Notification' in window)) {
            alert('このブラウザは通知機能をサポートしていません。');
            return;
        }

        try {
            const permission = await Notification.requestPermission();
            
            if (permission === 'granted') {
                this.showMainAppScreen();
                // Show a test notification
                new Notification('集中君', {
                    body: '通知機能が有効になりました！',
                    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎯</text></svg>'
                });
            } else {
                alert('通知機能を有効にしてください。ブラウザの設定から通知を許可できます。');
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            alert('通知機能の許可中にエラーが発生しました。');
        }
    }

    /**
     * Show the notification permission screen
     */
    private showNotificationPermissionScreen(): void {
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
    private showMainAppScreen(): void {
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
    private bindEvents(): void {
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
    public getPermissionStatus(): NotificationPermission {
        if (!('Notification' in window)) {
            return 'denied';
        }
        return Notification.permission;
    }

    /**
     * Check if notifications are supported
     * @returns True if notifications are supported
     */
    public isNotificationSupported(): boolean {
        return 'Notification' in window;
    }
}