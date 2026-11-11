import fs from "node:fs/promises";
import path from "node:path";

export default async function searchSrc(projectPath) {
    const folders = await fs.readFileSync(projectPath);

    for ( const folder of folders ) {
        const fullpath = path.join(projectPath, folder);
        if ( folder.isDirectory() ) {
            if ( folder === "src" ) {
                return folder
            } else {
                searchSrc(fullpath);
            }
        }
    }
}