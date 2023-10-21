import { readFileContent,writeContentToFile } from "./utils"
const os = require('os')

import { StorageService } from "./StorageService"

import {Request} from "../models/Request"

export class RequestService{
    static get(filePath:string){
        let data = StorageService.getSync(filePath)
        let dataJson =  JSON.parse(data)

        return new Request(
            dataJson.requestName,
            dataJson.body,
            dataJson.headers,
            dataJson.params,
            dataJson.url,
            dataJson.httpmethod,
            dataJson.script,
            dataJson.selectedContentType,
            dataJson.gqlVariable,
            dataJson.gqlQueryBody,
            dataJson.urlEncodedParams
        )
    }
    static save(filePath:string,data:Request){
        StorageService.writeSync(filePath,JSON.stringify(data))
    }
    static add(filePath:string,filename:string){
        let request = new Request("New Request","",[],[],"","","","","","",[])
        StorageService.writeSync(`${filePath}/${filename}`,JSON.stringify(request))
        return request
    }
}