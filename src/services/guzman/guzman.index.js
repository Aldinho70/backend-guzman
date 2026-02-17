import { fileMap } from "../../config/guzman.config.js";
import { formatTimestamp } from "../../utils/utils.js";
import { extractCustomFields, extractSens, getConnectionStatus, mapStateGroups } from "../wialon/utils/wialon.utils.js";

export const mapGuzman = (data) => {
    data.forEach(_group => {

        switch (_group.group_name) {
            case 'TRACTOS DASHBOARD':
                mapGuzmanTractos(_group)
                break;

            default:

                break;
        }

    });
}

const mapGuzmanTractos = (data) => {

    const status = {
        vacio: [],
        cargado: [],
        espera_de_carga: [],
        espera_descarga: [],
        sin_estatus: []
    };

    data.units.forEach(_u => {

        _u["Ultimo reporte"] = formatTimestamp(_u.lastMessage.t);
        _u.status_connection = getConnectionStatus(_u.lastMessage.t)
        _u.Online = (_u.status_connection == 'online') ? 1 : 0;

        /**
         * Procesamiento de campos personalizados
         */
            const flds = extractCustomFields(_u.fields_customers, ['1STATUSDASHBOARD', '1 ORIGEN', '2 DESTINO']);
            
            const fld_status =flds?.['1STATUSDASHBOARD'] ?.replaceAll(' ', '_') ?.toLowerCase() ?? 'sin_estatus';
            _u.status = fld_status;

            _u.Origen = flds?.['1 ORIGEN'] ?? '';
            _u.detenidos = flds?.['2 DESTINO'] ?? '';

        /**
         * Procesamiento de sensores
         */
            const sens = extractSens(_u.sens, ['IGNICION']);
            if (sens['IGNICION']) {
                const sens_ignition = WialonService.getValueSensor(_u.id, sens['IGNICION'])
                // console.log( sens_ignition );
                _u.sens_ignition = sens_ignition;
            }
        
        const key_status = status[fld_status] ? fld_status : 'sin_estatus';
        status[key_status].push(_u);
    });

    sendJson( mapStateGroups(status) )

}

const sendJson = async (data) => {

  for (const statusKey in data) {
    if (!Object.hasOwn(data, statusKey)) continue;

    const groups = data[statusKey];
    const statusConfig = fileMap[statusKey];

    if (!statusConfig) continue;

    for (const groupKey in groups) {
      if (!Object.hasOwn(groups, groupKey)) continue;

      const filename = statusConfig[groupKey];
      if (!filename) continue;

      const result = await JsonInterceptor.sendJson(
        filename,
        groups[groupKey] // aquí sí enviamos la data real
        // [] // aquí sí enviamos la data real
      );

      console.table(result);
    }
  }
};
