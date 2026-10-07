import { createApp } from "./app";
import { loadConfig } from "./config";

const config = loadConfig();
const app = createApp();

app.listen(config.PORT, () => {
  console.log(`api listening on :${config.PORT}`);
});
