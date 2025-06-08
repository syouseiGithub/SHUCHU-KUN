/**
 * Unit tests for NotificationPermissionManager class
 */

// Import the actual class for testing
import { NotificationPermissionManager } from '../ts/NotificationPermissionManager';

// Testable version that exposes protected methods
class TestableNotificationPermissionManager extends NotificationPermissionManager {
    // Access protected properties directly since they are inherited
    public get notificationPermissionScreenElement(): HTMLElement | null {
        return this.notificationPermissionScreen;
    }

    public get mainAppScreenElement(): HTMLElement | null {
        return this.mainAppScreen;
    }

    public get enableNotificationBtnElement(): HTMLElement | null {
        return this.enableNotificationBtn;
    }

    // Expose protected methods as public for testing
    public init(): void {
        super.init();
    }

    public checkNotificationPermission(): void {
        super.checkNotificationPermission();
    }

    public async requestNotificationPermission(): Promise<void> {
        return super.requestNotificationPermission();
    }

    public showNotificationPermissionScreen(): void {
        super.showNotificationPermissionScreen();
    }

    public showMainAppScreen(): void {
        super.showMainAppScreen();
    }

    public bindEvents(): void {
        super.bindEvents();
    }
}

describe('NotificationPermissionManager', () => {
    let manager: TestableNotificationPermissionManager;
    let mockNotificationScreen: HTMLElement;
    let mockMainScreen: HTMLElement;
    let mockButton: HTMLElement;
    let mockNotification: any;
    let originalNotification: any;

    beforeEach(() => {
        // Store original Notification
        originalNotification = (window as any).Notification;

        // Mock DOM elements
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

        // Mock Notification API
        mockNotification = jest.fn().mockImplementation(() => ({}));
        mockNotification.permission = 'default' as NotificationPermission;
        mockNotification.requestPermission = jest.fn();

        // Clear all mocks
        jest.clearAllMocks();

        // Mock global functions
        (global as any).alert = jest.fn();
        (global as any).console = {
            warn: jest.fn(),
            error: jest.fn()
        };

        // Mock window.Notification
        Object.defineProperty(window, 'Notification', {
            writable: true,
            configurable: true,
            value: mockNotification
        });

        // Create manager instance with mocked DOM elements
        manager = new TestableNotificationPermissionManager(
            mockNotificationScreen,
            mockMainScreen,
            mockButton
        );
    });

    afterEach(() => {
        // Restore original Notification
        Object.defineProperty(window, 'Notification', {
            writable: true,
            configurable: true,
            value: originalNotification
        });
    });

    describe('Constructor and Initialization', () => {
        it('should initialize with provided DOM elements', () => {
            expect(manager.notificationPermissionScreenElement).toBe(mockNotificationScreen);
            expect(manager.mainAppScreenElement).toBe(mockMainScreen);
            expect(manager.enableNotificationBtnElement).toBe(mockButton);
        });

        it('should call init during construction', () => {
            // Since init is called in constructor, check its effects
            expect(mockButton.addEventListener).toHaveBeenCalled();
        });
    });

    describe('checkNotificationPermission method', () => {
        it('should show main app screen when permission is granted', () => {
            mockNotification.permission = 'granted';
            
            manager.checkNotificationPermission();
            
            expect(mockNotificationScreen.classList.add).toHaveBeenCalledWith('hidden');
            expect(mockMainScreen.classList.remove).toHaveBeenCalledWith('hidden');
        });

        it('should show permission screen when permission is denied', () => {
            mockNotification.permission = 'denied';
            
            manager.checkNotificationPermission();
            
            expect(mockNotificationScreen.classList.remove).toHaveBeenCalledWith('hidden');
            expect(mockMainScreen.classList.add).toHaveBeenCalledWith('hidden');
        });

        it('should show permission screen when permission is default', () => {
            mockNotification.permission = 'default';
            
            manager.checkNotificationPermission();
            
            expect(mockNotificationScreen.classList.remove).toHaveBeenCalledWith('hidden');
            expect(mockMainScreen.classList.add).toHaveBeenCalledWith('hidden');
        });

        it('should show permission screen and warn when notifications are not supported', () => {
            // Mock console.warn before clearing all mocks
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
            
            // Create a manager instance without constructor calling init()
            const unsupportedManager = Object.create(TestableNotificationPermissionManager.prototype);
            unsupportedManager.notificationPermissionScreen = mockNotificationScreen;
            unsupportedManager.mainAppScreen = mockMainScreen;
            unsupportedManager.enableNotificationBtn = mockButton;
            
            // Remove Notification from window
            Object.defineProperty(window, 'Notification', {
                writable: true,
                configurable: true,
                value: undefined
            });
            
            unsupportedManager.checkNotificationPermission();
            
            expect(consoleSpy).toHaveBeenCalledWith('This browser does not support notifications');
            expect(mockNotificationScreen.classList.remove).toHaveBeenCalledWith('hidden');
            expect(mockMainScreen.classList.add).toHaveBeenCalledWith('hidden');
            
            consoleSpy.mockRestore();
        });
    });

    describe('requestNotificationPermission method', () => {
        it('should show alert when notifications are not supported', async () => {
            // Mock alert before clearing all mocks
            const alertSpy = jest.spyOn(window, 'alert').mockImplementation();
            
            // Create a manager instance without constructor calling init()
            const unsupportedManager = Object.create(TestableNotificationPermissionManager.prototype);
            unsupportedManager.notificationPermissionScreen = mockNotificationScreen;
            unsupportedManager.mainAppScreen = mockMainScreen;
            unsupportedManager.enableNotificationBtn = mockButton;
            
            // Remove Notification from window by setting it to undefined
            Object.defineProperty(window, 'Notification', {
                writable: true,
                configurable: true,
                value: undefined
            });
            
            await unsupportedManager.requestNotificationPermission();
            
            expect(alertSpy).toHaveBeenCalledWith('このブラウザは通知機能をサポートしていません。');
            
            alertSpy.mockRestore();
        });

        it('should show main app and create notification when permission is granted', async () => {
            mockNotification.requestPermission.mockResolvedValue('granted');
            
            await manager.requestNotificationPermission();
            
            expect(mockNotification.requestPermission).toHaveBeenCalled();
            expect(mockNotificationScreen.classList.add).toHaveBeenCalledWith('hidden');
            expect(mockMainScreen.classList.remove).toHaveBeenCalledWith('hidden');
            expect(mockNotification).toHaveBeenCalledWith('集中君', {
                body: '通知機能が有効になりました！',
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎯</text></svg>'
            });
        });

        it('should show alert when permission is denied', async () => {
            mockNotification.requestPermission.mockResolvedValue('denied');
            
            await manager.requestNotificationPermission();
            
            expect((global as any).alert).toHaveBeenCalledWith('通知機能を有効にしてください。ブラウザの設定から通知を許可できます。');
        });

        it('should handle errors gracefully', async () => {
            const error = new Error('Permission request failed');
            mockNotification.requestPermission.mockRejectedValue(error);
            
            await manager.requestNotificationPermission();
            
            expect((global as any).console.error).toHaveBeenCalledWith('Error requesting notification permission:', error);
            expect((global as any).alert).toHaveBeenCalledWith('通知機能の許可中にエラーが発生しました。');
        });
    });

    describe('showNotificationPermissionScreen method', () => {
        it('should show notification permission screen and hide main screen', () => {
            manager.showNotificationPermissionScreen();
            
            expect(mockNotificationScreen.classList.remove).toHaveBeenCalledWith('hidden');
            expect(mockMainScreen.classList.add).toHaveBeenCalledWith('hidden');
        });

        it('should handle null elements gracefully', () => {
            const managerWithNulls = new TestableNotificationPermissionManager(null, null, null);
            
            expect(() => managerWithNulls.showNotificationPermissionScreen()).not.toThrow();
        });
    });

    describe('showMainAppScreen method', () => {
        it('should hide notification permission screen and show main screen', () => {
            manager.showMainAppScreen();
            
            expect(mockNotificationScreen.classList.add).toHaveBeenCalledWith('hidden');
            expect(mockMainScreen.classList.remove).toHaveBeenCalledWith('hidden');
        });

        it('should handle null elements gracefully', () => {
            const managerWithNulls = new TestableNotificationPermissionManager(null, null, null);
            
            expect(() => managerWithNulls.showMainAppScreen()).not.toThrow();
        });
    });

    describe('bindEvents method', () => {
        it('should bind click event to enable notification button', () => {
            manager.bindEvents();
            
            expect(mockButton.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
        });

        it('should handle null button gracefully', () => {
            const managerWithNullBtn = new TestableNotificationPermissionManager(
                mockNotificationScreen,
                mockMainScreen,
                null
            );
            
            expect(() => managerWithNullBtn.bindEvents()).not.toThrow();
        });

        it('should call requestNotificationPermission when button is clicked', () => {
            // Spy on the method
            const requestSpy = jest.spyOn(manager, 'requestNotificationPermission');
            
            manager.bindEvents();
            
            // Get the click handler that was added
            const addEventListenerMock = mockButton.addEventListener as jest.Mock;
            const clickHandler = addEventListenerMock.mock.calls[0][1];
            clickHandler();
            
            expect(requestSpy).toHaveBeenCalled();
        });
    });

    describe('getPermissionStatus method', () => {
        it('should return current notification permission status', () => {
            mockNotification.permission = 'granted';
            
            const status = manager.getPermissionStatus();
            
            expect(status).toBe('granted');
        });

        it('should return denied when notifications are not supported', () => {
            // Create a manager instance without constructor calling init()
            const unsupportedManager = Object.create(TestableNotificationPermissionManager.prototype);
            
            // Remove Notification from window by setting it to undefined
            Object.defineProperty(window, 'Notification', {
                writable: true,
                configurable: true,
                value: undefined
            });
            
            const status = unsupportedManager.getPermissionStatus();
            
            expect(status).toBe('denied');
        });
    });

    describe('isNotificationSupported method', () => {
        it('should return true when notifications are supported', () => {
            const isSupported = manager.isNotificationSupported();
            
            expect(isSupported).toBe(true);
        });

        it('should return false when notifications are not supported', () => {
            // Create a manager instance without constructor calling init()
            const unsupportedManager = Object.create(TestableNotificationPermissionManager.prototype);
            
            // Remove Notification from window by setting it to undefined
            Object.defineProperty(window, 'Notification', {
                writable: true,
                configurable: true,
                value: undefined
            });
            
            const isSupported = unsupportedManager.isNotificationSupported();
            
            expect(isSupported).toBe(false);
        });
    });

    describe('Integration tests', () => {
        it('should complete full flow from permission request to main app', async () => {
            // Mock successful permission request
            mockNotification.requestPermission.mockResolvedValue('granted');
            mockNotification.permission = 'default';
            
            // Create a new manager to test the full flow
            const flowManager = new TestableNotificationPermissionManager(
                mockNotificationScreen,
                mockMainScreen,
                mockButton
            );
            
            // Initial state should show permission screen (already called in constructor)
            expect(mockNotificationScreen.classList.remove).toHaveBeenCalledWith('hidden');
            
            // Request permission
            await flowManager.requestNotificationPermission();
            
            // Should show main app and create notification
            expect(mockNotificationScreen.classList.add).toHaveBeenCalledWith('hidden');
            expect(mockMainScreen.classList.remove).toHaveBeenCalledWith('hidden');
            expect(mockNotification).toHaveBeenCalled();
        });
    });
});