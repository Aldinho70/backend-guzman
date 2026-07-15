import { TOKEN_WIALON } from "./config/wialon.config.js";
import { GROUP_FILTER } from "./config/guzman.config.js";
import { mapGuzman } from "./services/guzman/guzman.index.js";
import { sendNotificationDataBase } from "./services/notification/notification.js";

document.addEventListener("DOMContentLoaded", async () => {
  const initWialon = async () => {
  try {
    await WialonService.login( TOKEN_WIALON );

    const groups_with_units =
      await WialonService.loadGroupsWithUnits(GROUP_FILTER);

    mapGuzman(groups_with_units);

    // console.log( 'Notificaciones: ', WialonService.getNotifications() );
    

  } catch (err) {
    console.error(err);
  }
};

const relouder = async () => {
  try {
    console.log('Recargando informacion');
    
    const groups_with_units = await WialonService.loadGroupsWithUnits(GROUP_FILTER);
    mapGuzman( groups_with_units );

    const notifications = WialonService.getNotifications();
    console.log( 'Notificaciones: ', notifications );

    if( notifications.lastNotifications.length ){
      console.log( 'Notificaciones nuevas: ', notifications.lastNotifications[0] );
      // Aquí puedes enviar las notificaciones a la base de datos o realizar otras acciones
      sendNotificationDataBase( notifications.lastNotifications[0] );
    }

  } catch (err) {
    console.error(err);
  }
};

// Ejecutar login + primera carga
await initWialon();

// Repetir cada 50 segundos
setInterval(relouder, 50 * 1000);

});
