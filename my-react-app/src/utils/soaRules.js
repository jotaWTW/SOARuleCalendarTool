import { addHours } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

export const adjustToWeekday = date => {
  const newDate = new Date(date);
  const dayOfWeek = newDate.getDay();
  if (dayOfWeek === 0) newDate.setDate(newDate.getDate() + 1);
  if (dayOfWeek === 6) newDate.setDate(newDate.getDate() + 2);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

export const isEnrollmentEndingWithinNext4Days = endEnrollment => {
  const currentDate = new Date().setHours(0, 0, 0, 0);
  const dateToCheck = new Date(endEnrollment).setHours(0, 0, 0, 0);
  const fourDaysFromNow = currentDate + 4 * 24 * 60 * 60 * 1000;
  return dateToCheck > currentDate && dateToCheck <= fourDaysFromNow;
};

export const hasPostEnrollmentDateException = selectedMembers => {
  return selectedMembers.some(member =>
    member.campaigns?.some(campaign =>
      campaign.postEnrollmentStartDate !== null &&
      isEnrollmentEndingWithinNext4Days(campaign.postEnrollmentStartDate)
    )
  );
};

export const isInboundException = () => {
  // const callStatus = getCallStatus();
  // return callStatus?.direction?.toString().toLowerCase() === 'inbound';
  return false;
};

export const isIFPException = product => {
  return product != null && product === 'IFP';
};

const toTimezone = (date, timezone) => formatInTimeZone(date, timezone, 'yyyy-MM-dd HH:mm:ssXXX');
const add48Hours = (date) => adjustToWeekday(addHours(date, 48));
const getMaxDate = (dateList) => dateList.length ? new Date(Math.max(...dateList.map(d => new Date(d)))) : null;
const isSameMonthYear = (d1, d2) => d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();

export const getSOARules = (
  soaListUTC,
  selectedDate,
  isPostEnrollException,
  isIFPException,
  isOnChangeMonthEvent = false,
  mockToday = new Date()
) => {
  const timezone = 'America/Denver';
  let minDate = mockToday;
  let selectedAfter48 = new Date(selectedDate);
  let rule48Applied = false;

  const now = mockToday;
  const nowTZ = toTimezone(now, timezone);
  const selected = new Date(selectedDate);
  const maxSOADate = getMaxDate(soaListUTC);

  if (maxSOADate && !isPostEnrollException && !isInboundException() && !isIFPException ) {
    const minDate48 = add48Hours(maxSOADate);
    const minDate48TZ = toTimezone(minDate48, timezone);

    if (isSameMonthYear(minDate48, selected)) {
      minDate = minDate48 > now ? minDate48TZ : nowTZ;
      selectedAfter48 = minDate48 > selected ? minDate48 : selected;
    } else {
      if (selected < minDate48) {
        minDate = minDate48TZ;
        selectedAfter48 = minDate48;
      } else {
        minDate = nowTZ;
        selectedAfter48 = selected;
      }
    }
    rule48Applied = true;
  } 

  return {
    minDate: new Date(minDate.replace(/-\d{2}:\d{2}$/, '')),
    selectedDate: new Date(selectedAfter48),
    rule48applied: rule48Applied
  };
};