import { NotificationData, notifications } from '@mantine/notifications';

export class NotificationService {
    static showMessage(
        message: string,
        type: NotificationTypes,
        title?: string,
        position?: NotificationData['position']
    ) {
        notifications.show({
            title,
            message,
            color: type,
            position,
        });
    }
}

export enum NotificationTypes {
    ok = 'green',
    error = 'red',
    warning = 'yellow',
}

export const NotificationsService = {
    success: ({ title, message }: { title?: string; message: string }) =>
        NotificationService.showMessage(message, NotificationTypes.ok, title),
    error: ({ title, message }: { title?: string; message: string }) =>
        NotificationService.showMessage(message, NotificationTypes.error, title),
    warning: ({ title, message }: { title?: string; message: string }) =>
        NotificationService.showMessage(message, NotificationTypes.warning, title),
};
