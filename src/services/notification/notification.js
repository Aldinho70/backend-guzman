export async function sendNotificationDataBase(notification) {
  try {
    const response = await fetch("http://ws4cjdg.com/JDigitalReportsV2/src/api/routes/notifications/addNotification.php", {
    // const response = await fetch("http://localhost:8080/repos/Jornada%20Digital/JornadaDigital.ReportesDeUnidades.com/src/api/routes/notifications/addNotification.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(notification)
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log("Notificación enviada correctamente:", data);
    return data;

  } catch (error) {
    console.error("Error al enviar la notificación:");
    console.error(error);
  }
}