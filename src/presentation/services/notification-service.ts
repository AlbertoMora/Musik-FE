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
