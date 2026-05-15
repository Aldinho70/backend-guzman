import { mapGuzmanRefrigerados, mapGuzmanSecos, mapGuzmanVariacionTemperatura } from "../services/guzman/guzman.index.js";
import { extractSens } from "../services/wialon/utils/wialon.utils.js";

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

    const groups_with_units = await WialonService.loadGroupsWithUnits(groupNames);
    const array_cajas = groups_with_units.flatMap(g => g?.units || []);
    
    const result = units
        .map(unit => {
            const unitCaja = normalize(unit?.caja);
            const unitNum = extractNumber(unitCaja);

            // console.log(
            //     `%cTracto: ${unit.Unidad}\nEstatus: ${unit.status}\nCaja: ${unit.caja} ${unit.caja_doble}`,
            //     'color: #00bcd4; font-weight: bold;'
            // );

            let match = array_cajas.find(d =>
                normalize(d?.name) === unitCaja
            );
            if (!match && unitNum) {
                match = array_cajas.find(d =>
                    extractNumber(d?.name) === unitNum
                );
                
                if(match){
                    match.tracto = unit.name;
                    match.is_caja = true;
                }

                if( match && unit.status === 'REFRI'){
                    variacion_temperatura.push( match )
                }
            }
            
            else{
                match = unit;
            }
            
            if (unit.status === 'REFRI' && match) {
                array_refrigerado.push(match);
            } else if (unit.status === 'SECO' && match) {
                array_seco.push(match);
            }

            return match; 
        })
        .filter(Boolean); 


    mapVariacionTemperatura( variacion_temperatura )
    mapGuzmanRefrigerados( {units: array_refrigerado} )
    mapGuzmanSecos( {units: array_seco} )
};

const mapVariacionTemperatura = ( array_cajas ) => {
    const array_variacion_temp = []
    array_cajas.forEach(caja => {
        const sens_temp = extractSens(caja.sens, ['Temperatura']); 
        if( sens_temp['TEMPERATURA'] ){
            const temp = sens_temp['TEMPERATURA'];
            if (temp < 0 || temp > 5) {
                caja.Temperatura = temp
                array_variacion_temp.push( caja );
            }
        }
    });
    
    mapGuzmanVariacionTemperatura( {units: array_variacion_temp} )
}