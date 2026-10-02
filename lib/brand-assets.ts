import { readFile } from "node:fs/promises";
import path from "node:path";

export const getLogoDataUrl = async () => {
  const logo = await readFile(
    path.join(process.cwd(), "public", "assets", "vandor-ui-logo.png")
  );

  return `data:image/png;base64,${logo.toString("base64")}`;
};
