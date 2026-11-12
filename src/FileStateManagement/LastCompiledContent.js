import fs from "fs";
import path from "path";

// Storage files content
const storageFilesContent = new Map();

// Export storage files content
export { storageFilesContent };

// Last compiled content
export default function LastCompiledContent(path, content) {
    const LastComp = storageFilesContent.get(path);

    const directoryFile = fs.readFileSync(path, "utf-8");

    if( LastComp === directoryFile ) {
        storageFilesContent.set(path, content);
        return true;
    } else {
        return false;
    }
}