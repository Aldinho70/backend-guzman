import { mapGuzmanRefrigerados, mapGuzmanSecos, mapGuzmanVariacionTemperatura } from "../services/guzman/guzman.index.js";
import { extractSens, extractSensByArray } from "../services/wialon/utils/wialon.utils.js";

const normalize = (str = '') => str.trim().toUpperCase();

const extractNumber = (str = '') => {
    const match = str.match(/\d+/);
    return match ? Number(match[0]) : null; // ← aquí el cambio
};

export const mapRefrigeradoSecoCajas = async (units = []) => {

    const groupNames = [
        'GUZMAN CAJAS DOBLES',
        'GUZMAN IRAPUATO CAJAS',
    ];

    const array_refrigerado = [];
    const array_seco = [];
    const variacion_temperatura = [];

    // =========================
    // CAJAS
    // =========================
    const groups_with_units =
        await WialonService.loadGroupsWithUnits(
            groupNames
        );

    const array_cajas =
        groups_with_units.flatMap(
            g => g?.units || []
        );

    // =========================
    // MAPEO PRINCIPAL
    // =========================
    const result = await Promise.all(

        units.map(async (unit) => {

            try {

                const unitCaja =
                    normalize(unit?.caja);

                const unitNum =
                    extractNumber(unitCaja);

                // =====================================
                // SENSOR TEMPERATURA
                // =====================================
                const sens_temp =
                    extractSens(
                        unit?.sens || {},
                        ['Temperatura']
                    );

                // =====================================
                // MATCH EXACTO
                // =====================================
                let match = array_cajas.find(d =>
                    normalize(d?.name) === unitCaja
                );

                // =====================================
                // MATCH POR NUMERO
                // =====================================
                if (!match && unitNum) {

                    match = array_cajas.find(d =>
                        extractNumber(d?.name) === unitNum
                    );
                }

                // =====================================
                // SIN MATCH
                // =====================================
                if (!match) {
                    return null;
                }

                // =====================================
                // DATA EXTRA
                // =====================================
                match.tracto = unit?.name;
                match.is_caja = true;

                // =====================================
                // HISTORICO TEMPERATURA
                // =====================================
                if (
                    sens_temp &&
                    sens_temp['TEMPERATURA']
                ) {

                    try {

                        const sensorId = Number(
                            sens_temp['TEMPERATURA']
                        );

                        const unitId = Number(
                            match.id
                        );

                        if (
                            !isNaN(sensorId) &&
                            !isNaN(unitId)
                        ) {

                            console.log({
                                sensorId,
                                unitId
                            });

                            const historico_temperatura =
                                await WialonService.getSensorHistory(
                                    unitId,
                                    sensorId
                                );

                            if (
                                Array.isArray(
                                    historico_temperatura
                                ) &&
                                historico_temperatura.length
                            ) {

                                match.historico_temperatura =
                                    historico_temperatura;
                            }
                        }

                    } catch (err) {

                        console.log(
                            'Error getSensorHistory:',
                            err
                        );
                    }
                }

                // =====================================
                // ARRAYS
                // =====================================
                if (unit.status === 'REFRI') {

                    array_refrigerado.push(match);

                    variacion_temperatura.push(match);

                } else if (
                    unit.status === 'SECO'
                ) {

                    array_seco.push(match);
                }

                console.log(match);

                return match;

            } catch (err) {

                console.error(
                    'Error mapRefrigeradoSecoCajas:',
                    err
                );

                return null;
            }
        })
    );

    // =========================
    // LIMPIAR NULOS
    // =========================
    const filtered =
        result.filter(Boolean);

    // =========================
    // RENDER
    // =========================
    mapVariacionTemperatura(
        variacion_temperatura
    );

    mapGuzmanRefrigerados({
        units: array_refrigerado
    });

    mapGuzmanSecos({
        units: array_seco
    });

    return filtered;
};

const mapVariacionTemperatura = (array_cajas) => {
    const array_variacion_temp = []
    array_cajas.forEach(caja => {
        const sens_temp = extractSens(caja.sens, ['Temperatura']);
        if (sens_temp['TEMPERATURA']) {
            const temp = WialonService.getValueSensor(caja.id, sens_temp['TEMPERATURA'])
            if (temp < 0 || temp > 5) {
                caja.Temperatura = temp
                array_variacion_temp.push(caja);
            }
        }
    });

    mapGuzmanVariacionTemperatura({ units: array_variacion_temp })
}