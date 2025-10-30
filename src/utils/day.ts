import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import duration from 'dayjs/plugin/duration';
import calendar from 'dayjs/plugin/calendar';
import updateLocale from 'dayjs/plugin/updateLocale';

// Load plugins
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.extend(duration);
dayjs.extend(calendar);
dayjs.extend(updateLocale);

// Configure locale (example for English)
dayjs.updateLocale('en', {
    relativeTime: {
        future: 'in %s',
        past: '%s ago',
        s: 'a few seconds',
        m: 'a minute',
        mm: '%d minutes',
        h: 'an hour',
        hh: '%d hours',
        d: 'a day',
        dd: '%d days',
        M: 'a month',
        MM: '%d months',
        y: 'a year',
        yy: '%d years'
    }
});
// Common date formatting functions
export const formatDate = (date: string | number | Date | dayjs.Dayjs | null | undefined, format = 'YYYY-MM-DD'): string => {
    if (!date) return '';
    return dayjs(date).format(format);
};

export const formatDateTime = (date: string | number | Date | dayjs.Dayjs | null | undefined, format = 'YYYY-MM-DD HH:mm'): string => {
    if (!date) return '';
    return dayjs(date).format(format);
};

export const formatRelativeTime = (date: string | number | Date | dayjs.Dayjs | null | undefined): string => {
    if (!date) return '';
    return dayjs(date).fromNow();
};

export const formatCalendar = (date: string | number | Date | dayjs.Dayjs | null | undefined): string => {
    if (!date) return '';
    return dayjs(date).calendar();
};

// Get current date/time
export const now = (): dayjs.Dayjs => dayjs();

// Other utility functions
export const isToday = (date: string | number | Date | dayjs.Dayjs | null | undefined): boolean => {
    if (!date) return false;
    return dayjs(date).isSame(dayjs(), 'day');
};

export const isFuture = (date: string | number | Date | dayjs.Dayjs | null | undefined): boolean => {
    if (!date) return false;
    return dayjs(date).isAfter(dayjs());
};

export const isPast = (date: string | number | Date | dayjs.Dayjs | null | undefined): boolean => {
    if (!date) return false;
    return dayjs(date).isBefore(dayjs());
};

export default dayjs;