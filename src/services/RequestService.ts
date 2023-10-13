import { readFileContent,writeContentToFile } from "./utils"
const os = require('os')

import { StorageService } from "./StorageService"

import {Request} from "../models/Request"

export class RequestService{
    static get(filePath:string){
        let data = StorageService.getSync(filePath)
        return JSON.parse(data)
    }
    static save(filePath:string,data:Request){
        StorageService.writeSync(filePath,JSON.stringify(data))
    }
    static add(filePath:string,filename:string){
        let request = new Request("New Request","",[],[],"","")
        StorageService.writeSync(`${filePath}/${filename}.json`,JSON.stringify(request))
        return request
    }
}