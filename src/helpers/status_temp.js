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

    const groups_with_units = await WialonService.loadGroupsWithUnits(groupNames);
    const array_cajas = groups_with_units.flatMap(g => g?.units || []);
    
    const result = units
        .map( async ( unit ) => {
            const unitCaja = normalize(unit?.caja);
            const unitNum = extractNumber(unitCaja);
            const sens_temp = extractSens(unit.sens, ['Temperatura']);
            // console.log();
            

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

                    // const lattest_messages = await WialonService.getLatestMessages( match.id ) || []
                    // extractSensByArray( lattest_messages )
                    // match.lattest_messages = await WialonService.getLatestMessages( match.id )
                    const historico_temperatura = await WialonService.getSensorHistory( match.id, sens_temp['TEMPERATURA'] );
                    
                    if( historico_temperatura ){
                        if(Object.keys(historico_temperatura).length){
                            // console.log(historico_temperatura);
                            match.historico_temperatura = historico_temperatura
                        }
                    }
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

            // console.log(match);
            
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
            const temp = WialonService.getValueSensor(caja.id, sens_temp['TEMPERATURA'])
            if (temp < 0 || temp > 5) {
                caja.Temperatura = temp
                array_variacion_temp.push( caja );
            }
        }
    });
    
    mapGuzmanVariacionTemperatura( {units: array_variacion_temp} )
}