import fs from "fs";
import path from "path";
import hljs from "highlight.js";
import UC, { semantics } from "../compilerUC.js";
import CreateProject from "../CreateReactProject/CreateProject.js";
import scanProjects from "../ScanReactProject/ScanProject.js";
import searchSrc from "../ScanReactProject/searchSrc.js";
import LastCompiledContent from "../FileStateManagement/LastCompiledContent.js";

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

// Функция определения языка программирования
const detectLanguage = (content) => {
    const language = hljs.highlightAuto(content);

    return {
        language: language.language ?? "unknown",
        relevance: language.relevance ?? 0,
    }
}

// Функция сканирования папок и файлов (локального языка программирования) для компиляция в проект React
export default async function FileScan(directory) {
    const files = fs.readFileSync(directory);

    for (const file of files) {
        const fullpath = path.join(directory, file);

        const stats = fs.statSync(fullpath);

        if (stats.isDirectory()) {
            FileScan(fullpath);
        } else if (stats.isFile()) {
            console.log(fullpath);

            const content = fs.readFileSync(fullpath, "utf-8");
            const language = detectLanguage(content);
            console.log(language);

            if (supportedLanguages.includes(language.language)) {
                return 0;
            } else {
                // О задачим компилятор UC и запустим его на файл с содержимым
                const result = UC.match(content, "Program");
                if (result.succeeded()) {
                    const javascript = semantics(result).toJS();

                    const srcUC = fullpath.split(path.sep).find(item => item === "src");
                    const reactProject = await scanProjects(directory);
                    const { srcReact, FullPathReact } = await searchSrc(reactProject);

                    if (srcUC === srcReact) {
                        const lastComp = LastCompiledContent(fullpath, content);

                        if (lastComp) {
                            console.log("Компилирование файлов...");
                            const parts = fullpath.split(/[\\/]/);

                            const index = parts.indexOf("src");

                            const results = parts.slice(index + 1).join("/");

                            console.log(results);

                            const SrcNoUc = results.split("/");

                            const newPathReact = path.join(fullpath, ...SrcNoUc);

                            // Создаём папки
                            fs.mkdir(path.dirname(newPathReact), { recursive: true });

                            // Создаём файл
                            fs.writeFile(newPathReact, javascript, "utf-8");
                        } else {
                            console.log("Файл не изменился");
                        }

                    } else {
                        console.log("Создание нового проекта...");
                        CreateProject()
                    }
                } else {
                    console.log(result.message);
                }
            }
        }
    }
}