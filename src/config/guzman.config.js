
const tractos = "IRAPUATO TRACTOS GUZMAN";
const cajas = "GUZMAN IRAPUATO CAJAS";
const dobles_tractos = "DEV GUZMAN TRACTOS DOBLES";
const dobles_cajas = "GUZMAN CAJAS DOBLES";

export const GROUP_FILTER = ["TRACTOS DASHBOARD", "GUZMAN IRAPUATO CAJAS", "DEV GUZMAN TRACTOS DOBLES", "GUZMAN CAJAS DOBLES",]

export const fileMap = {
  vacio: {
    detenidos: "json_arrvaciosdet.json",
    general: "json_arrvacios.json",
    movimiento: "json_arrvaciosmov.json"
  },
  cargado: {
    detenidos: "json_arrcargadosdet.json",
    general: "json_arrcargados.json",
    movimiento: "json_arrcargadosmov.json",
    sin_reportar: "json_arrcargadosdead.json"
  },
  espera_de_carga: {
    general: "json_arrcargando.json"
  },
  espera_descarga: {
    general: "json_arrdescargando.json"
  },
  sin_estatus: {
    general: "json_arrsinstatus.json"
  }
};
