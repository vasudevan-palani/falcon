import { readFileContent, writeContentToFile } from "./utils"
const os = require('os')
const fs = require('fs')

import { Environment } from "../models/Environment";
import { StorageService } from "./StorageService";

export class EnvironmentService {

    static getFilePath() {
        return os.homedir() + "/.falcon_env"
    }

    static init() {
        if (!StorageService.isExists(this.getFilePath())) {
            StorageService.writeSync(this.getFilePath(), JSON.stringify([new Environment("default", "default", [])]))
        }
    }

    static getAll() {
        return this.getAllSync()
    }

    static get(envName : string) : Environment | undefined {
        let envs = this.getAllSync()
        let selectedenv = undefined
        envs.map((env:Environment) =>{
            if (env.name == envName){
                console.log(env.name,envName)
                selectedenv =  env
            }
        })

        return selectedenv
    }

    static getAllSync() {
        let data = fs.readFileSync(this.getFilePath(), 'utf8');
        return JSON.parse(data)
    }

    static updateAllSync(content: Environment[]) {
        StorageService.writeSync(this.getFilePath(), JSON.stringify(content))
    }

    static addAll(envs: Environment[]) {
        StorageService.writeSync(this.getFilePath(), JSON.stringify(envs))
    }

    static updateAll(envs: Environment[]) {
        return this.updateAllSync(envs)
    }

    static updateEnv(env:Environment){
        let envs = this.getAllSync()

        for (let i=0;i<envs.length;i++){
            console.log("updateEnv",envs[i].name,env.name)
            if(envs[i].name == env.name){
                console.log("updateEnv found the env")
                envs[i] = env
            }
        }
        console.log(envs,JSON.stringify(envs))
        this.updateAll(envs)
    }

}