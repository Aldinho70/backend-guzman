import { TOKEN_WIALON } from "./config/wialon.config.js";
import { GROUP_FILTER } from "./config/guzman.config.js";
import { mapGuzman } from "./services/guzman/guzman.index.js";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await WialonService.login( TOKEN_WIALON );
    
    const groups_with_units = await WialonService.loadGroupsWithUnits( GROUP_FILTER );

    mapGuzman( groups_with_units )

  } catch (err) {
    console.error(err);
  }
});
