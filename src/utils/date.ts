export function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function nowIso() {
  return new Date().toISOString();
}

export function shortTime(iso: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}
