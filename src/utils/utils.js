export const formatTimestamp = (ts) => {
  if (!ts) return 'fecha_invalida';

  const date = new Date(ts * 1000);

  return date.toLocaleString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};


export const ordenarStatusPorFecha = (status) => {
  const result = {};

  Object.keys(status).forEach(key => {
    result[key] = [...status[key]].sort((a, b) => b.timestamp - a.timestamp);
  });

  return result;
};

export function lastHourActually() {

  const now = new Date();

  // =========================
  // FROM
  // =========================
  const from = new Date(now);

  from.setMinutes(0);
  from.setSeconds(0);
  from.setMilliseconds(0);

  // =========================
  // TO
  // =========================
  const to = new Date(now);

  to.setHours(23);
  to.setMinutes(59);
  to.setSeconds(59);
  to.setMilliseconds(999);

  return {
    from: Math.floor(from.getTime() / 1000),
    to: Math.floor(to.getTime() / 1000),

    from_date: from,
    to_date: to
  };
}