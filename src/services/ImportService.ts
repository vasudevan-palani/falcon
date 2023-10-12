import { readFileContent, writeContentToFile } from "./utils"
const os = require('os')
const fs = require('fs')

export class ImportService {

    static importFolder(filepath: string, folder: any) {
        folder.map((item: any) => {
            if (item.item != undefined && item.item.length > 0) {
                this.createFolder(filepath, item.name)
                this.importFolder(`${filepath}/${item.name}`, item.item)
            } else {
                this.createFile(filepath, item)
            }
        })
    }

    static import(parentDirectory: string, filePath: string) {
        return new Promise((resolve, reject) => {
            try {
                readFileContent(filePath, (err: any, data: any) => {
                    if (err != undefined || err != null) {
                        reject(err);
                    }
                    let collectionJson = JSON.parse(data)
                    let collectionName = collectionJson.info.name
                    if (collectionName != undefined && collectionName != '') {
                        this.createFolder(parentDirectory, collectionName)
                        this.importFolder(`${parentDirectory}/${collectionName}`, collectionJson.item)
                    }

                    resolve("");
                })
            } catch (err) {
                reject(err)
            }

        })
    }

    static createFile(filePath: string, content: any) {
        let falconRequest = this.convertSchema(content)
        let filename = `${filePath}/${content.name}.json`.replaceAll(" ", "_")
        fs.writeFileSync(filename, JSON.stringify(falconRequest))
    }

    static createFolder(parentDirectory: string, folderName: string) {
        let folderPath = `${parentDirectory}/${folderName}`.replaceAll(" ", "_")
        if (fs.existsSync(folderPath)) {
            console.log(`directory ${parentDirectory}/${folderName} exists`)
        } else {
            // Create the folder
            fs.mkdirSync(folderPath);
            console.log(`directory ${parentDirectory}/${folderName} created`)
        }
    }

    static buildURL(protocol:string, hostnames:any, pathSegments:any) {
        // Ensure that there is at least one hostname and one path segment
        if (!hostnames || hostnames.length === 0 || !pathSegments || pathSegments.length === 0) {
            throw new Error('Invalid input. Hostnames and pathSegments must not be empty.');
        }

        // Join hostnames with dots to form the hostname part
        const hostname = hostnames.join('.');

        // Join path segments with slashes to form the path part
        const path = pathSegments.join('/');

        // Construct the URL
        const url = `${protocol}://${hostname}/${path}`;

        return url;
    }

    static getQueryParams(url:any){
        if (url?.query == undefined){
            return []
        }
        else return url.query.map((param:any)=>{
            return {
                "name" : param.key,
                "value" : param.value,
                "enabled" :true
            }
        })
    }

    static convertSchema(item: any) {
        return {
            "requestName": item.name,
            "body": item.request.body?.raw,
            "headers": item.request.header.map((headerItem: any) => {
                return {
                    "name": headerItem.name,
                    "value": headerItem.value,
                    "enabled" : true
                }
            }),
            "url": this.buildURL(
                item.request.url.protocol,
                item.request.url.host,
                item.request.url.path),
            "params" : this.getQueryParams(item.request.url),
            "httpmethod": item.request.method.toLowerCase()
        }
    }
}