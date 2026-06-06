// utils/date.ts
export const formatDateUTC = (iso: string) =>
    new Intl.DateTimeFormat('en-US', { year:'numeric', month:'short', day:'2-digit', timeZone:'UTC' })
      .format(new Date(iso));
  