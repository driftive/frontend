import dayjs1 from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import duration from 'dayjs/plugin/duration';

dayjs1.extend(relativeTime);
dayjs1.extend(localizedFormat);
dayjs1.extend(duration);

export const dayjs = dayjs1;
