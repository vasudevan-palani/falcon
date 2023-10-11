const fs = require('fs')
const path = require('path')

export class WorkspaceService {
    static createFolder(parentDirectory: string, folderName: string) {
        let folderPath = `${parentDirectory}/${folderName}`
        return new Promise((resolve, reject) => {
            if (fs.existsSync(folderPath)) {
                reject(`Folder '${folderName}' already exists in '${parentDirectory}'.`);
            } else {
                // Create the folder
                fs.mkdirSync(folderPath);
                resolve(`Folder '${folderName}' created in '${parentDirectory}'.`);
            }
        })
    }

    static _deleteFileOrDirectory(targetPath: string) {
        let failed = false;
        let error = ""
        if (fs.existsSync(targetPath)) {
            if (fs.lstatSync(targetPath).isDirectory()) {
                // If the target is a directory, recursively delete its contents
                fs.readdirSync(targetPath).forEach((file: any) => {
                    const curPath = path.join(targetPath, file);
                    this._deleteFileOrDirectory(curPath);
                });
                // After deleting the contents, delete the directory itself
                fs.rmdirSync(targetPath);
                console.log(`Directory '${targetPath}' has been deleted.`);
            } else {
                // If the target is a file, delete the file
                fs.unlinkSync(targetPath);
                console.log(`File '${targetPath}' has been deleted.`);
            }
        } else {
            failed = true
            error =`The target '${targetPath}' does not exist.`;
        }

        return error
    }

    static deleteFileOrDirectory(targetPath: string) {
        return new Promise((resolve, reject) => {
            let error = this._deleteFileOrDirectory(targetPath)
            if(error != ""){
                console.log("rejecting",error)
                reject(error)
            }
            console.log("resolving")
            resolve("")
        })

    }

}