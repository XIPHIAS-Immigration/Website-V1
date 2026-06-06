export function getLocalTimezone() {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; }
    catch { return "UTC"; }
  }
  export function addDays(base: Date, days: number) {
    const copy = new Date(base); copy.setDate(copy.getDate() + days); return copy;
  }
  export function formatISODate(d: Date) {
    const yyyy = d.getFullYear(); const mm = String(d.getMonth()+1).padStart(2,"0"); const dd = String(d.getDate()).padStart(2,"0");
    return `${yyyy}-${mm}-${dd}`;
  }
  export function timesForDay() { return ["09:00","11:00","14:00","17:00"]; }  