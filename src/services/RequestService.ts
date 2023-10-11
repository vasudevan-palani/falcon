import { readFileContent,writeContentToFile } from "./utils"
const os = require('os')

export class RequestService{
    static get(filePath:string){
        return new Promise((resolve,reject)=>{
            readFileContent(filePath,(err:any,data:any)=>{
                if(err != undefined || err != null){
                    reject(err);
                }
                resolve(JSON.parse(data));
            })
        })
    }
    static save(filePath:string,data:JSON){
        return new Promise((resolve,reject)=>{
            writeContentToFile(filePath,JSON.stringify(data),(err:any,data:any)=>{
                if(err != undefined || err != null){
                    reject(err);
                }
                resolve(data);
            })
        })
    }
}