import { TOKEN_WIALON } from "./config/wialon.config.js";
import { GROUP_FILTER } from "./config/guzman.config.js";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await WialonService.login( TOKEN_WIALON );

    // const info = await WialonService.login( TOKEN_WIALON );
    // console.log("Login:", info);

    // const units = await WialonService.loadUnits();
    // console.log("Units:", units);

    const groups_with_units = await WialonService.loadGroupsWithUnits( GROUP_FILTER );
    console.log("Groups:", groups_with_units);

  } catch (err) {
    console.error(err);
  }
});
