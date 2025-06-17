/**
 * NotificationPermissionManagerクラスのユニットテスト
 */

import { NotificationPermissionManager, NotificationDependencies } from '../ts/NotificationPermissionManager';

describe('NotificationPermissionManager', () => {
    let manager: NotificationPermissionManager;
    let mockNotificationScreen: HTMLElement;
    let mockMainScreen: HTMLElement;
    let mockButton: HTMLElement;
    let mockDependencies: NotificationDependencies;

    beforeEach(() => {
        // DOM要素をモック
        mockNotificationScreen = {
            classList: {
                add: jest.fn(),
                remove: jest.fn()
            }
        } as any;

        mockMainScreen = {
            classList: {
                add: jest.fn(),
                remove: jest.fn()
            }
        } as any;

        mockButton = {
            addEventListener: jest.fn()
        } as any;

        // 依存関係をモック
        mockDependencies = {
            notificationAPI: {
                permission: 'default' as NotificationPermission,
                requestPermission: jest.fn() as jest.MockedFunction<() => Promise<NotificationPermission>>,
                create: jest.fn() as jest.MockedFunction<(title: string, options?: NotificationOptions) => void>,
                isSupported: jest.fn() as jest.MockedFunction<() => boolean>
            },
            console: {
                warn: jest.fn() as jest.MockedFunction<(message: string) => void>,
                error: jest.fn() as jest.MockedFunction<(message: string, error?: any) => void>
            },
            alert: jest.fn() as jest.MockedFunction<(message: string) => void>
        };

        // デフォルトの戻り値を設定
        (mockDependencies.notificationAPI.isSupported as jest.MockedFunction<() => boolean>).mockReturnValue(true);

        // 全てのモックをクリア
        jest.clearAllMocks();
    });

    describe('Constructor and Initialization', () => {
        it('should initialize with provided DOM elements and dependencies', () => {
            manager = new NotificationPermissionManager(
                mockNotificationScreen,
                mockMainScreen,
                mockButton,
                mockDependencies
            );

            // イベントバインディングが呼ばれたことを確認
            expect(mockButton.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
        });

        it('should initialize with default DOM elements when not provided', () => {
            // document.getElementByIdをモック
            const getElementByIdSpy = jest.spyOn(document, 'getElementById')
                .mockReturnValueOnce(mockNotificationScreen)
                .mockReturnValueOnce(mockMainScreen)
                .mockReturnValueOnce(mockButton);

            manager = new NotificationPermissionManager(undefined, undefined, undefined, mockDependencies);

            expect(getElementByIdSpy).toHaveBeenCalledWith('notification-permission-screen');
            expect(getElementByIdSpy).toHaveBeenCalledWith('main-app-screen');
            expect(getElementByIdSpy).toHaveBeenCalledWith('enable-notification-btn');
            expect(mockButton.addEventListener).toHaveBeenCalled();

            getElementByIdSpy.mockRestore();
        });

        it('should create default dependencies when not provided', () => {
            // window.Notificationをモック
            const mockNotification = jest.fn() as any;
            mockNotification.permission = 'default';
            mockNotification.requestPermission = jest.fn();
            Object.defineProperty(window, 'Notification', {
                writable: true,
                configurable: true,
                value: mockNotification
            });

            // グローバル関数をモック
            const alertSpy = jest.spyOn(window, 'alert').mockImplementation();
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

            manager = new NotificationPermissionManager(
                mockNotificationScreen,
                mockMainScreen,
                mockButton
            );

            // デフォルトの依存関係が機能することをテスト
            expect(manager.getPermissionStatus()).toBe('default');
            expect(manager.isNotificationSupported()).toBe(true);

            alertSpy.mockRestore();
            consoleWarnSpy.mockRestore();
        });
    });

    describe('Permission checking logic', () => {
        beforeEach(() => {
            manager = new NotificationPermissionManager(
                mockNotificationScreen,
                mockMainScreen,
                mockButton,
                mockDependencies
            );
        });

        it('should show main app screen when permission is granted', () => {
            mockDependencies.notificationAPI.permission = 'granted';
            jest.clearAllMocks();

            // initを起動するための新しいマネージャーを作成
            new NotificationPermissionManager(
                mockNotificationScreen,
                mockMainScreen,
                mockButton,
                mockDependencies
            );

            expect(mockNotificationScreen.classList.add).toHaveBeenCalledWith('hidden');
            expect(mockMainScreen.classList.remove).toHaveBeenCalledWith('hidden');
        });

        it('should show permission screen when permission is denied', () => {
            mockDependencies.notificationAPI.permission = 'denied';
            jest.clearAllMocks();

            new NotificationPermissionManager(
                mockNotificationScreen,
                mockMainScreen,
                mockButton,
                mockDependencies
            );

            expect(mockNotificationScreen.classList.remove).toHaveBeenCalledWith('hidden');
            expect(mockMainScreen.classList.add).toHaveBeenCalledWith('hidden');
        });

        it('should show permission screen when permission is default', () => {
            mockDependencies.notificationAPI.permission = 'default';
            jest.clearAllMocks();

            new NotificationPermissionManager(
                mockNotificationScreen,
                mockMainScreen,
                mockButton,
                mockDependencies
            );

            expect(mockNotificationScreen.classList.remove).toHaveBeenCalledWith('hidden');
            expect(mockMainScreen.classList.add).toHaveBeenCalledWith('hidden');
        });

        it('should show permission screen and warn when notifications are not supported', () => {
            (mockDependencies.notificationAPI.isSupported as jest.MockedFunction<() => boolean>).mockReturnValue(false);
            jest.clearAllMocks();

            new NotificationPermissionManager(
                mockNotificationScreen,
                mockMainScreen,
                mockButton,
                mockDependencies
            );

            expect(mockDependencies.console.warn).toHaveBeenCalledWith('This browser does not support notifications');
            expect(mockNotificationScreen.classList.remove).toHaveBeenCalledWith('hidden');
            expect(mockMainScreen.classList.add).toHaveBeenCalledWith('hidden');
        });
    });

    describe('Permission request logic', () => {
        beforeEach(() => {
            manager = new NotificationPermissionManager(
                mockNotificationScreen,
                mockMainScreen,
                mockButton,
                mockDependencies
            );
        });

        it('should show alert when notifications are not supported', async () => {
            (mockDependencies.notificationAPI.isSupported as jest.MockedFunction<() => boolean>).mockReturnValue(false);

            // Get the click handler that was added during initialization
            const addEventListenerMock = mockButton.addEventListener as jest.Mock;
            const clickHandler = addEventListenerMock.mock.calls.find(call => call[0] === 'click')[1];
            await clickHandler();

            expect(mockDependencies.alert).toHaveBeenCalledWith('このブラウザは通知機能をサポートしていません。');
        });

        it('should show main app and create notification when permission is granted', async () => {
            (mockDependencies.notificationAPI.requestPermission as jest.MockedFunction<() => Promise<NotificationPermission>>).mockResolvedValue('granted');
            
            // Get the click handler that was added during initialization
            const addEventListenerMock = mockButton.addEventListener as jest.Mock;
            const clickHandler = addEventListenerMock.mock.calls.find(call => call[0] === 'click')[1];
            
            jest.clearAllMocks();
            
            await clickHandler();

            expect(mockDependencies.notificationAPI.requestPermission).toHaveBeenCalled();
            expect(mockNotificationScreen.classList.add).toHaveBeenCalledWith('hidden');
            expect(mockMainScreen.classList.remove).toHaveBeenCalledWith('hidden');
            expect(mockDependencies.notificationAPI.create).toHaveBeenCalledWith('集中君', {
                body: '通知機能が有効になりました！',
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎯</text></svg>'
            });
        });

        it('should show alert when permission is denied', async () => {
            (mockDependencies.notificationAPI.requestPermission as jest.MockedFunction<() => Promise<NotificationPermission>>).mockResolvedValue('denied');

            // Get the click handler that was added during initialization
            const addEventListenerMock = mockButton.addEventListener as jest.Mock;
            const clickHandler = addEventListenerMock.mock.calls.find(call => call[0] === 'click')[1];
            await clickHandler();

            expect(mockDependencies.alert).toHaveBeenCalledWith('通知機能を有効にしてください。ブラウザの設定から通知を許可できます。');
        });

        it('should handle errors gracefully', async () => {
            const error = new Error('Permission request failed');
            (mockDependencies.notificationAPI.requestPermission as jest.MockedFunction<() => Promise<NotificationPermission>>).mockRejectedValue(error);

            // Get the click handler that was added during initialization
            const addEventListenerMock = mockButton.addEventListener as jest.Mock;
            const clickHandler = addEventListenerMock.mock.calls.find(call => call[0] === 'click')[1];
            await clickHandler();

            expect(mockDependencies.console.error).toHaveBeenCalledWith('Error requesting notification permission:', error);
            expect(mockDependencies.alert).toHaveBeenCalledWith('通知機能の許可中にエラーが発生しました。');
        });
    });

    describe('DOM manipulation', () => {
        beforeEach(() => {
            manager = new NotificationPermissionManager(
                mockNotificationScreen,
                mockMainScreen,
                mockButton,
                mockDependencies
            );
        });

        it('should handle null DOM elements gracefully', () => {
            expect(() => {
                new NotificationPermissionManager(null, null, null, mockDependencies);
            }).not.toThrow();
        });

        it('should not throw when DOM elements are null during screen transitions', () => {
            // このテスト用のモック依存関係を作成
            const nullTestDependencies = {
                notificationAPI: {
                    permission: 'default' as NotificationPermission,
                    requestPermission: jest.fn() as jest.MockedFunction<() => Promise<NotificationPermission>>,
                    create: jest.fn() as jest.MockedFunction<(title: string, options?: NotificationOptions) => void>,
                    isSupported: jest.fn() as jest.MockedFunction<() => boolean>
                },
                console: {
                    warn: jest.fn() as jest.MockedFunction<(message: string) => void>,
                    error: jest.fn() as jest.MockedFunction<(message: string, error?: any) => void>
                },
                alert: jest.fn() as jest.MockedFunction<(message: string) => void>
            };
            
            (nullTestDependencies.notificationAPI.isSupported as jest.MockedFunction<() => boolean>).mockReturnValue(true);
            
            const managerWithNulls = new NotificationPermissionManager(null, null, null, nullTestDependencies);
            
            // これらはnull要素があってもエラーが出ないはず
            expect(() => managerWithNulls.getPermissionStatus()).not.toThrow();
            expect(() => managerWithNulls.isNotificationSupported()).not.toThrow();
        });
    });

    describe('Public API methods', () => {
        beforeEach(() => {
            manager = new NotificationPermissionManager(
                mockNotificationScreen,
                mockMainScreen,
                mockButton,
                mockDependencies
            );
        });

        it('should return current notification permission status', () => {
            mockDependencies.notificationAPI.permission = 'granted';

            const status = manager.getPermissionStatus();

            expect(status).toBe('granted');
        });

        it('should return notification support status', () => {
            (mockDependencies.notificationAPI.isSupported as jest.MockedFunction<() => boolean>).mockReturnValue(true);

            const isSupported = manager.isNotificationSupported();

            expect(isSupported).toBe(true);
        });

        it('should return false for notification support when not supported', () => {
            (mockDependencies.notificationAPI.isSupported as jest.MockedFunction<() => boolean>).mockReturnValue(false);

            const isSupported = manager.isNotificationSupported();

            expect(isSupported).toBe(false);
        });
    });

    describe('Event binding', () => {
        it('should bind click event to enable notification button', () => {
            manager = new NotificationPermissionManager(
                mockNotificationScreen,
                mockMainScreen,
                mockButton,
                mockDependencies
            );

            expect(mockButton.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
        });

        it('should not throw when button is null', () => {
            expect(() => {
                new NotificationPermissionManager(
                    mockNotificationScreen,
                    mockMainScreen,
                    null,
                    mockDependencies
                );
            }).not.toThrow();
        });
    });

    describe('Integration flow', () => {
        it('should complete full flow from permission request to main app', async () => {
            (mockDependencies.notificationAPI.requestPermission as jest.MockedFunction<() => Promise<NotificationPermission>>).mockResolvedValue('granted');
            mockDependencies.notificationAPI.permission = 'default';

            // このテスト用に新しいボタンモックを作成
            const testButton = {
                addEventListener: jest.fn()
            } as any;

            manager = new NotificationPermissionManager(
                mockNotificationScreen,
                mockMainScreen,
                testButton,
                mockDependencies
            );

            // 最初に許可画面を表示するはず
            expect(mockNotificationScreen.classList.remove).toHaveBeenCalledWith('hidden');

            // Get the click handler that was added during initialization
            const addEventListenerMock = testButton.addEventListener as jest.Mock;
            const clickHandler = addEventListenerMock.mock.calls.find(call => call[0] === 'click')[1];
            
            jest.clearAllMocks();

            await clickHandler();

            // メインアプリを表示し、通知を作成するはず
            expect(mockNotificationScreen.classList.add).toHaveBeenCalledWith('hidden');
            expect(mockMainScreen.classList.remove).toHaveBeenCalledWith('hidden');
            expect(mockDependencies.notificationAPI.create).toHaveBeenCalled();
        });
    });
});