class JsonInterceptor {
  static INTERCEPTOR_URL = "http://ws4cjdg.com/OPERACION_GUZMAN/save_json.php";
  static INTERCEPTOR_KEY = "GUZMAN_SECURE_KEY_2025";

  static async sendJson(filename, data) {
    try {

      if (!Array.isArray(data)) {
        throw new Error("El parámetro 'data' debe ser un array.");
      }

      const jsonContent = JSON.stringify(data);

      const payload = new URLSearchParams();
      payload.append("key", this.INTERCEPTOR_KEY);
      payload.append("filename", filename);
      payload.append("content", jsonContent);

      const response = await axios.post(
        this.INTERCEPTOR_URL,
        payload,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          timeout: 20000
        }
      );

      return {
        file: filename,
        http_code: response.status,
        raw_reply: response.data
      };

    } catch (error) {

      return {
        file: filename,
        error: error.response?.data || error.message,
        http_code: error.response?.status || null
      };
    }
  }
}
