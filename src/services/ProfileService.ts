import { readFileContent,writeContentToFile } from "./utils"
const os = require('os')
const fs = require('fs')

import { StorageService } from "./StorageService"
import { FalconProfile } from "../models/FalconProfile"

export class ProfileService{
    static getFilePath(){
        return os.homedir() + "/.falcon"
    }
    static get(){
        let profilestring = StorageService.getSync(this.getFilePath())
        return JSON.parse(profilestring)
    }
    static update(data:FalconProfile){
        StorageService.writeSync(this.getFilePath(),JSON.stringify(data))
    }

    static updateSync(data:FalconProfile){
        this.update(data)
    }
}