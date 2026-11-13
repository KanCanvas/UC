import fs from "fs";
import path from "path";

const data = [];

// Функция для сбора данных из папки проекта
export default function CollectionDataFiles(directory) {
    const files = fs.readFileSync(directory);

    for ( const file of files ) {
        const fullpath = path.join(directory, file);

        const stats = fs.statSync(fullpath);

        if(stats.isDirectory()) {
            CollectionDataFiles(fullpath);
        } else if (stats.isFile()) {
            console.log(fullpath);
            data.push(fullpath);
        }
    }
    console.log(data);
    return data;
}