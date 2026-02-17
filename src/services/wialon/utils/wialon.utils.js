export function extractCustomFields(customFields, fieldNames = []) {
  if (!customFields || !fieldNames.length) return {};

  // Normalizamos nombres buscados para evitar problemas de espacios/números
  const normalize = (str) =>
    // str.replace(/^\d+\s*/, "").trim().toUpperCase();
    str.trim().toUpperCase();

  const wanted = fieldNames.map(normalize);
  const result = {};

  Object.values(customFields).forEach((field) => {
    const normalizedName = normalize(field.n);

    if (wanted.includes(normalizedName)) {
      result[normalizedName] = field.v?.trim() ?? "";
    }
  });

  return result;
}

export function extractSens ( sens, sensNames = [] ) {
  if (!sens || !sensNames.length) return {};

  // Normalizamos nombres buscados para evitar problemas de espacios/números
  const normalize = (str) =>
    str.trim().toUpperCase();

  const wanted = sensNames.map(normalize);
  const result = {};

  Object.values(sens).forEach((field) => {
    const normalizedName = normalize(field.n);

    if (wanted.includes(normalizedName)) {
      result[normalizedName] = field.id ?? "";
    }
  });

  return result;
}

export const getConnectionStatus = (ts, toleranceMinutes = 15) => {
  if (!ts) return 'offline';

  const now = Date.now(); // ms
  const lastUpdate = ts * 1000; // convertir a ms

  const diffMinutes = (now - lastUpdate) / (1000 * 60);

  return diffMinutes <= toleranceMinutes ? 'online' : 'offline';
};

export const mapStateGroups = (groups) => {
    const result = {};

    for (const key in groups) {
        if (!Object.hasOwn(groups, key)) continue;

        result[key] = {
            movimiento: [],
            detenidos: [],
            sin_reportar: [],
            general: [],
        };

        groups[key].forEach(_unit => {
            result[key].general.push(_unit)

            if (_unit.status_connection === 'online' && _unit.speed > 0) {
                result[key].movimiento.push(_unit);
            }
            else if (_unit.status_connection === 'online') {
                result[key].detenidos.push(_unit);
            }
            else {
                result[key].sin_reportar.push(_unit);
            }
        });
    }

    return result;
};