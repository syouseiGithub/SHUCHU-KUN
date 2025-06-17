/**
 * NotificationPermissionManagerの依存関係のインターフェース
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
 * 集中君アプリの通知許可管理クラス
 * Web Notifications APIの許可確認とリクエストを処理します
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
        
        // デフォルトの依存関係はブラウザAPIを使用
        this.dependencies = dependencies ?? this.createDefaultDependencies();
        
        this.init();
    }

    /**
     * ブラウザAPIを使用するデフォルトの依存関係を作成
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
     * 通知許可管理を初期化
     */
    private init(): void {
        this.checkNotificationPermission();
        this.bindEvents();
    }

    /**
     * 現在の通知許可状態を確認し、適切な画面を表示
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
     * ユーザーに通知許可をリクエスト
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
                // テスト通知を表示
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
     * 通知許可画面を表示
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
     * メインアプリ画面を表示
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
     * イベントリスナーをバインド
     */
    private bindEvents(): void {
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
    public getPermissionStatus(): NotificationPermission {
        return this.dependencies.notificationAPI.permission;
    }

    /**
     * 通知がサポートされているかを確認
     * @returns 通知がサポートされている場合はtrue
     */
    public isNotificationSupported(): boolean {
        return this.dependencies.notificationAPI.isSupported();
    }
}