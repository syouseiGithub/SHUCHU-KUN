/**
 * Unit tests for NotificationPermissionManager
 */

// Mock the Notification API
class MockNotification {
    static permission: NotificationPermission = 'default';
    static requestPermission = jest.fn().mockResolvedValue('granted');
    
    constructor(public title: string, public options?: NotificationOptions) {}
}

// Setup DOM mock
const mockDocument = {
    getElementById: jest.fn(),
    addEventListener: jest.fn()
};

// Setup window mock with Notification
Object.defineProperty(window, 'Notification', {
    writable: true,
    value: MockNotification
});

Object.defineProperty(global, 'document', {
    writable: true,
    value: mockDocument
});

// Import the class after mocking
import '../ts/NotificationPermissionManager';

describe('NotificationPermissionManager', () => {
    let mockElements: { [key: string]: any };
    
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Mock DOM elements
        mockElements = {
            'notification-permission-screen': {
                classList: { add: jest.fn(), remove: jest.fn() }
            },
            'main-app-screen': {
                classList: { add: jest.fn(), remove: jest.fn() }
            },
            'enable-notification-btn': {
                addEventListener: jest.fn()
            }
        };
        
        mockDocument.getElementById.mockImplementation((id: string) => mockElements[id] || null);
        MockNotification.permission = 'default';
        MockNotification.requestPermission.mockClear();
    });

    describe('constructor', () => {
        it('should get required DOM elements', () => {
            new (window as any).NotificationPermissionManager();
            
            expect(mockDocument.getElementById).toHaveBeenCalledWith('notification-permission-screen');
            expect(mockDocument.getElementById).toHaveBeenCalledWith('main-app-screen');
            expect(mockDocument.getElementById).toHaveBeenCalledWith('enable-notification-btn');
        });
    });

    describe('checkNotificationPermission', () => {
        it('should show main screen when permission is granted', () => {
            MockNotification.permission = 'granted';
            const manager = new (window as any).NotificationPermissionManager();
            
            expect(mockElements['notification-permission-screen'].classList.add).toHaveBeenCalledWith('hidden');
            expect(mockElements['main-app-screen'].classList.remove).toHaveBeenCalledWith('hidden');
        });

        it('should show permission screen when permission is denied', () => {
            MockNotification.permission = 'denied';
            const manager = new (window as any).NotificationPermissionManager();
            
            expect(mockElements['notification-permission-screen'].classList.remove).toHaveBeenCalledWith('hidden');
            expect(mockElements['main-app-screen'].classList.add).toHaveBeenCalledWith('hidden');
        });

        it('should show permission screen when permission is default', () => {
            MockNotification.permission = 'default';
            const manager = new (window as any).NotificationPermissionManager();
            
            expect(mockElements['notification-permission-screen'].classList.remove).toHaveBeenCalledWith('hidden');
            expect(mockElements['main-app-screen'].classList.add).toHaveBeenCalledWith('hidden');
        });
    });

    describe('requestNotificationPermission', () => {
        it('should request permission and show main screen on grant', async () => {
            MockNotification.requestPermission.mockResolvedValue('granted');
            const manager = new (window as any).NotificationPermissionManager();
            
            await manager.requestNotificationPermission();
            
            expect(MockNotification.requestPermission).toHaveBeenCalled();
            expect(mockElements['notification-permission-screen'].classList.add).toHaveBeenCalledWith('hidden');
            expect(mockElements['main-app-screen'].classList.remove).toHaveBeenCalledWith('hidden');
        });

        it('should show alert when permission is denied', async () => {
            const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
            MockNotification.requestPermission.mockResolvedValue('denied');
            const manager = new (window as any).NotificationPermissionManager();
            
            await manager.requestNotificationPermission();
            
            expect(alertSpy).toHaveBeenCalledWith('通知機能を有効にしてください。ブラウザの設定から通知を許可できます。');
            alertSpy.mockRestore();
        });
    });

    describe('isNotificationSupported', () => {
        it('should return true when Notification is available', () => {
            const manager = new (window as any).NotificationPermissionManager();
            expect(manager.isNotificationSupported()).toBe(true);
        });

        it('should return false when Notification is not available', () => {
            const originalNotification = (window as any).Notification;
            delete (window as any).Notification;
            
            const manager = new (window as any).NotificationPermissionManager();
            expect(manager.isNotificationSupported()).toBe(false);
            
            (window as any).Notification = originalNotification;
        });
    });

    describe('getPermissionStatus', () => {
        it('should return current permission status', () => {
            MockNotification.permission = 'granted';
            const manager = new (window as any).NotificationPermissionManager();
            
            expect(manager.getPermissionStatus()).toBe('granted');
        });

        it('should return denied when Notification is not supported', () => {
            const originalNotification = (window as any).Notification;
            delete (window as any).Notification;
            
            const manager = new (window as any).NotificationPermissionManager();
            expect(manager.getPermissionStatus()).toBe('denied');
            
            (window as any).Notification = originalNotification;
        });
    });
});