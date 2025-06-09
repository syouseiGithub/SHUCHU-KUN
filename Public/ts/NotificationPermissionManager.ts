/**
 * Dependencies interface for NotificationPermissionManager
 */
export interface NotificationDependencies {
    notificationAPI: {
        permission: NotificationPermission;
        requestPermission(): Promise<NotificationPermission>;
        create(title: string, options?: NotificationOptions): void;
        isSupported(): boolean;
    };
    console: {
        warn(message: string): void;
        error(message: string, error?: any): void;
    };
    alert(message: string): void;
}

/**
 * Notification permission manager for the Shuchu-kun app
 * Handles Web Notifications API permission checks and requests
 */
export class NotificationPermissionManager {
    private notificationPermissionScreen: HTMLElement | null;
    private mainAppScreen: HTMLElement | null;
    private enableNotificationBtn: HTMLElement | null;
    private dependencies: NotificationDependencies;

    constructor(
        notificationPermissionScreen?: HTMLElement | null,
        mainAppScreen?: HTMLElement | null,
        enableNotificationBtn?: HTMLElement | null,
        dependencies?: NotificationDependencies
    ) {
        this.notificationPermissionScreen = notificationPermissionScreen ?? document.getElementById('notification-permission-screen');
        this.mainAppScreen = mainAppScreen ?? document.getElementById('main-app-screen');
        this.enableNotificationBtn = enableNotificationBtn ?? document.getElementById('enable-notification-btn');
        
        // Default dependencies use browser APIs
        this.dependencies = dependencies ?? this.createDefaultDependencies();
        
        this.init();
    }

    /**
     * Create default dependencies that use browser APIs
     */
    private createDefaultDependencies(): NotificationDependencies {
        return {
            notificationAPI: {
                get permission(): NotificationPermission {
                    return ('Notification' in window && window.Notification) ? Notification.permission : 'denied';
                },
                async requestPermission(): Promise<NotificationPermission> {
                    if ('Notification' in window && window.Notification) {
                        return await Notification.requestPermission();
                    }
                    return 'denied';
                },
                create(title: string, options?: NotificationOptions): void {
                    if ('Notification' in window && window.Notification) {
                        new Notification(title, options);
                    }
                },
                isSupported(): boolean {
                    return 'Notification' in window && typeof window.Notification !== 'undefined';
                }
            },
            console: {
                warn: (message: string) => console.warn(message),
                error: (message: string, error?: any) => console.error(message, error)
            },
            alert: (message: string) => alert(message)
        };
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
    private async requestNotificationPermission(): Promise<void> {
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
            } else {
                this.dependencies.alert('通知機能を有効にしてください。ブラウザの設定から通知を許可できます。');
            }
        } catch (error) {
            this.dependencies.console.error('Error requesting notification permission:', error);
            this.dependencies.alert('通知機能の許可中にエラーが発生しました。');
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
        return this.dependencies.notificationAPI.permission;
    }

    /**
     * Check if notifications are supported
     * @returns True if notifications are supported
     */
    public isNotificationSupported(): boolean {
        return this.dependencies.notificationAPI.isSupported();
    }
}