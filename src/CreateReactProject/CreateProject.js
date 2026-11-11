import { exec } from "node:child_process";


export default exec("npm create vite@latest my-react-app -- --template react", (error, stdout, stderr) => {
    if(error) {
        console.error(`error: ${error.message}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
})