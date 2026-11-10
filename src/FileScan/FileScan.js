import fs from "fs";
import path from "path";
import hljs from "highlight.js";
import UC, { semantics } from "../compilerUC.js";

const supportedLanguages = [
    "javascript",
    "typescript",
    "python",
    "java",
    "cpp",
    "c",
    "json",
    "html",
    "css"
];

const detectLanguage = (content) => {
    const language = hljs.highlightAuto(content);

    return {
        language: language.language ?? "unknown",
        relevance: language.relevance ?? 0,
    }
}

export default function FileScan(directory) {
    const files = fs.readFileSync(directory);

    for ( const file of files ) {
        const fullpath = path.join(directory, file);

        const stats = fs.statSync(fullpath);

        if ( stats.isDirectory() ) {
            FileScan(fullpath);
        } else if ( stats.isFile() ) {
            console.log(fullpath);

            const content = fs.readFileSync(fullpath, "utf-8");
            const language = detectLanguage(content);
            console.log(language);

            if( supportedLanguages.includes(language.language) ) { 
                return 0;
            } else {
                // О задачим компилятор UC и запустим его на файл с содержимым
                const result = UC.match(content, "Program");
                if(result.succeeded()) {
                    const javascript = semantics(result).toJS();
                    fs.writeFileSync(fullpath, javascript, "utf-8");
                } else {
                    console.log(result.message);
                }
            }
        }
    }
}