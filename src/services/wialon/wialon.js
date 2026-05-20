
const WialonService = (() => {
  let session = null;
  let initialized = false;

  const HOST = "https://hst-api.wialon.com";

  function init() {
    if (initialized) return;
    session = wialon.core.Session.getInstance();
    session.initSession(HOST);
    initialized = true;
  }

  function login(token) {
    return new Promise((resolve, reject) => {
      init();

      session.loginToken(token, "", (code) => {
        if (code) {
          return reject(wialon.core.Errors.getErrorText(code));
        }

        resolve({
          user: session.getCurrUser().getName(),
          id: session.getCurrUser().getId(),
        });
      });
    });
  }

  function logout() {
    return new Promise((resolve) => {
      session.logout(() => {
        resolve(true);
      });
    });
  }

  function loadUnits() {
    return new Promise((resolve, reject) => {
      const flags =
        wialon.item.Item.dataFlag.base |
        wialon.item.Item.dataFlag.customFields |
        wialon.item.Item.dataFlag.adminFields |
        wialon.item.Unit.dataFlag.lastMessage;

      session.loadLibrary("itemCustomFields");

      session.updateDataFlags(
        [
          {
            type: "type",
            data: "avl_unit",
            flags,
            mode: 0,
          },
        ],
        (code) => {
          if (code) return reject(code);

          const units = session.getItems("avl_unit") || [];

          const result = units.map((u) => {

            const p = u.getPosition();
            const flds = u.getCustomFields();

            return {
              id: u.getId(),
              name: u.getName(),
              lat: p?.y,
              lon: p?.x,
              speed: p?.s,
              velocidad: p?.s,
              timestamp: p?.t,
              fields_customers: flds,
            };
          });

          resolve(result);
        }
      );
    });
  }

  async function loadGroupsWithUnits(groups_filter = []) {
    return new Promise((resolve, reject) => {
      const session = wialon.core.Session.getInstance();

      const unitFlags =
        wialon.item.Item.dataFlag.base |
        wialon.item.Unit.dataFlag.sensors |
        wialon.item.Item.dataFlag.adminFields |
        wialon.item.Item.dataFlag.customFields |
        wialon.item.Unit.dataFlag.lastMessage;

      session.loadLibrary("unitSensors");
      session.loadLibrary("itemCustomFields");

      const groupFlags =
        wialon.item.Item.dataFlag.base;

      session.updateDataFlags(
        [
          { type: "type", data: "avl_unit", flags: unitFlags, mode: 0 },
          { type: "type", data: "avl_unit_group", flags: groupFlags, mode: 0 },
        ],
        (code) => {
          if (code) return reject(code);

          const groups = session.getItems("avl_unit_group") || [];
          const result = groups
            .filter(group =>
              groups_filter.some(f => group.getName().includes(f))
            )
            .map(group => {
              const units = group.getUnits() || [];

              const parsedUnits = units.map((_u) => {
                const u = session.getItem(_u);
                const p = u.getPosition();
                const sens = u.getSensors();
                const flds = u.getCustomFields();
                const lastMessage = u.getLastMessage();

                return {
                  id: u.getId(),
                  name: u.getName(),
                  Unidad: u.getName(),
                  Latitud: p?.y,
                  Longitud: p?.x,
                  speed: p?.s,
                  Velocidad: p?.s,
                  timestamp: p?.t,
                  Ultimo_mensaje: formatTimestamp(lastMessage.t),
                  Diferencia_tiempo: formatTimestamp(lastMessage.t),
                  Caja_Reportando: formatTimestamp(lastMessage.t),
                  Destino: 'Sin destino',
                  Origen: 'Sin origen',
                  Voltaje: 0,
                  Online: 0,
                  fields_customers: flds,
                  sens,
                  lastMessage,
                };
              });

              return {
                group_id: group.getId(),
                group_name: group.getName(),
                units: parsedUnits,
              };
            });



          resolve(result);
        }
      );
    });
  }

  function getValueSensor(unit_id, sen_id) {

    const unit = session.getItem(unit_id);
    const sens = unit.getSensor(sen_id);

    let result = unit.calculateSensorValue(sens, unit.getLastMessage());

    if (result == -348201.3876) {
      result = "N/A";
    }
    return result
  }

  formatTimestamp = (ts) => {
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

  async function getLatestMessages(unitId, dateFrom = null, dateTo = null) {

    return new Promise((resolve, reject) => {

      const ml = session.getMessagesLoader();

      let from;
      let to;

      // =========================
      // DEFAULT RANGE
      // =========================
      if (!dateFrom || !dateTo) {

        const range = lastHourActually();

        from = range.from;
        to = range.to;

      } else {

        from = Math.floor(
          new Date(dateFrom).getTime() / 1000
        );

        to = Math.floor(
          new Date(dateTo).getTime() / 1000
        );
      }

      ml.loadInterval(
        unitId,
        from,
        to,
        0,
        0,
        100,

        (code, data) => {

          if (code) {
            return reject(
              wialon.core.Errors.getErrorText(code)
            );
          }

          ml.getMessages(
            0,
            data.count - 1,

            (code2, messages) => {

              if (code2) {
                return reject(
                  wialon.core.Errors.getErrorText(code2)
                );
              }

              resolve(messages);
            }
          );
        }
      );
    });
  }

  async function getSensorHistory( unitId, sensorId, dateFrom = null, dateTo = null) {

    // =========================
    // Obtener unidad
    // =========================
    const unit = session.getItem(unitId);

    if (!unit) {
      return
      // throw new Error("Unidad no encontrada");
    }

    // =========================
    // Obtener sensor
    // =========================
    const sensor = unit.getSensor(sensorId);

    if (!sensor) {
      return 
      // throw new Error("Sensor no encontrado");
    }

    // =========================
    // Obtener mensajes
    // =========================
    const messages = await getLatestMessages(
      unitId,
      dateFrom,
      dateTo
    );

    // =========================
    // Procesar histórico
    // =========================
    const history = messages.map(msg => {

      let value = unit.calculateSensorValue(
        sensor,
        msg
      );

      if (value == -348201.3876) {
        value = null;
      }

      return {
        timestamp: msg.t,

        date: formatTimestamp(msg.t),

        value,

        raw: msg.p
      };
    });

    return history.filter(h => h.value !== null);
  }

  function lastHourActually() {

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

  return {
    login,
    logout,
    loadUnits,
    loadGroupsWithUnits,
    getValueSensor,
    getLatestMessages,
    getSensorHistory,
  };
})();
