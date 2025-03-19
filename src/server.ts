import app from "./app.ts";

import { register } from "node:module";
import { pathToFileURL } from "node:url";

register("ts-node/esm", pathToFileURL("./"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
	console.log(`Servidor rodando na porta ${PORT}`);
});
