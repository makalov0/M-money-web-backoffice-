import axios from "axios";

const BASE = process.env.EXTERNAL_MENU_BASE || "http://172.28.14.230:3300";

class ExternalMenuModel {
  static async getMenu() {
    const url = `${BASE}/webapp/menu/getmenu`;
    console.log("➡️ external url:", url);

    const resp = await axios.get(url, {
      timeout: 15000,
      headers: { Accept: "application/json" },
    });
    return resp.data;
  }

  static async getSubmenu(menuId) {
    const url = `${BASE}/webapp/menu/getsubmenu/${menuId}`;
    console.log("➡️ external url:", url);

    const resp = await axios.get(url, {
      timeout: 15000,
      headers: { Accept: "application/json" },
    });
    return resp.data;
  }
}

export default ExternalMenuModel;
