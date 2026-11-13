

export default function DetectionRootFolder(ArrayPath) {
    if (!ArrayPath.length || ArrayPath.some(file => !file)) return [];
    
    const storageFirstFolder = [];
    const NicklinePath = ArrayPath.map(item => item.split("/"));

    // new Array Path
    console.log(NicklinePath);

    for(const file of NicklinePath) {
        const root = file[0];
        storageFirstFolder.push(root);
    }
    const resultRootFolder = storageFirstFolder.every(item => item === storageFirstFolder[0]);

    if(resultRootFolder) {
        return DetectionRootFolder(
            NicklinePath.map(file => file.slice(1).join("/"))
        );
    } else {
        return [...new Set(storageFirstFolder)];
    }
}