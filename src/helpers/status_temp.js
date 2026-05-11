import { mapGuzmanRefrigerados, mapGuzmanSecos } from "../services/guzman/guzman.index.js";

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

    const array_refrigerado = []
    const array_seco = []

    const groups_with_units = await WialonService.loadGroupsWithUnits(groupNames);
    const array_cajas = groups_with_units.flatMap(g => g?.units || []);

    const result = units
        .map(unit => {
            const unitCaja = normalize(unit?.caja);
            const unitNum = extractNumber(unitCaja);

            let match = array_cajas.find(d =>
                normalize(d?.name) === unitCaja
            );

            if (!match && unitNum) {
                match = array_cajas.find(d =>
                    extractNumber(d?.name) === unitNum
                );
            }

            if (unit.status === 'REFRI' && match) {
                array_refrigerado.push(match);
            } else if (unit.status === 'SECO' && match) {
                array_seco.push(match);
            }

            return match; 
        })
        .filter(Boolean); 

    // console.log(array_refrigerado);
    // console.log(array_seco);
    mapGuzmanRefrigerados( {units: array_refrigerado} )
    mapGuzmanSecos( {units: array_seco} )
};