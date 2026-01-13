import { differenceInDays, parseISO } from 'date-fns';

const now = new Date();
const end = new Date();
end.setDate(now.getDate() + 3); // 3 days from now

const daysLeft = differenceInDays(end, now);
console.log('Now:', now.toISOString());
console.log('End:', end.toISOString());
console.log('Days Left:', daysLeft);
console.log('Is <= 7?', daysLeft <= 7);

const endStr = "2025-01-17T00:00:00.000Z";
const parsedEnd = parseISO(endStr);
console.log('Parsed End:', parsedEnd.toISOString());
