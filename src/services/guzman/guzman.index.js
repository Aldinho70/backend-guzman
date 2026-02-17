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

    const res = mapStateGroups(status)
    console.log(res);

    sendJsonTractos( res )

}

const sendJsonTractos = async ( data ) => {
    let result
    for (const key in data) {
        if (!Object.hasOwn(data, key)) continue;
        
        const groups = data[key];
        // console.log(key);
        // console.log(groups);

        switch( key ){
            case 'vacio':
                for (const key in groups) {
                    if (!Object.hasOwn(groups, key)) continue;
                    const group = groups[key];
                    switch( key ){
                        case 'detenidos':
                                result = await JsonInterceptor.sendJson("json_arrvaciosdet.json", []);
                                console.log(result);[]
                            break;
                        case 'general':
                                result = await JsonInterceptor.sendJson("json_arrvacios.json", []);
                                console.log(result);[]
                            break;
                        case 'movimiento':
                                result = await JsonInterceptor.sendJson("json_arrvaciosmov.json", []);
                                console.log(result);[]
                            break;
                    }
                }
                break;

            case 'cargado':
                for (const key in groups) {
                    if (!Object.hasOwn(groups, key)) continue;
                    const group = groups[key];
                    switch( key ){
                        case 'detenidos':
                                result = await JsonInterceptor.sendJson("json_arrcargadosdet.json", []);
                                console.log(result);[]
                            break;
                        case 'general':
                                result = await JsonInterceptor.sendJson("json_arrcargados.json", []);
                                console.log(result);[]
                            break;
                        case 'movimiento':
                                result = await JsonInterceptor.sendJson("json_arrcargadosmov.json", []);
                                console.log(result);[]
                            break;
                        case 'sin_reportar':
                                result = await JsonInterceptor.sendJson("json_arrcargadosdead.json", []);
                                console.log(result);[]
                            break;
                    }
                }
                break;
            case 'espera_de_carga':
                for (const key in groups) {
                    if (!Object.hasOwn(groups, key)) continue;
                    const group = groups[key];
                    switch( key ){
                        case 'general':
                            result = await JsonInterceptor.sendJson("json_arrcargando.json", []);
                            console.log(result);[]
                        break;
                    }
                }
                break;
            case 'espera_descarga':
                for (const key in groups) {
                    if (!Object.hasOwn(groups, key)) continue;
                    const group = groups[key];
                    switch( key ){
                        case 'general':
                            result = await JsonInterceptor.sendJson("json_arrdescargando.json", []);
                            console.log(result);[]
                        break;
                    }
                }
                break;
            case 'sin_estatus':
                for (const key in groups) {
                    if (!Object.hasOwn(groups, key)) continue;
                    const group = groups[key];
                    switch( key ){
                        case 'general':
                            result = await JsonInterceptor.sendJson("json_arrsinstatus.json", []);
                            console.log(result);[]
                        break;
                    }
                }
                break;
        }
        
        // const result = await JsonInterceptor.sendJson("unidades.json", data);
        // console.log(result);
        
    }
}