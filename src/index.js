import { TOKEN_WIALON } from "./config/wialon.config.js";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const info = await WialonService.login( TOKEN_WIALON );
    console.log("Login:", info);

    // const units = await WialonService.loadUnits();
    // console.log("Units:", units);

    const groups_with_units = await WialonService.loadGroupsWithUnits();
    console.log("Groups:", groups_with_units);

  } catch (err) {
    console.error(err);
  }
});
