import { Environment } from "../models/Environment"
import { EnvironmentService } from "./EnvironmentService"
import { readFileContent,writeContentToFile } from "./utils"

import { NameValueEnabled } from "../components/common/model"
const os = require('os')

export class FalconService {
    env:any
    envName : string
    constructor(envName:string,env:any){
        this.env = env
        this.envName = envName
    }

    setEnv(name:string,value:any){
        console.log(this.envName)
        let env : Environment|undefined = EnvironmentService.get(this.envName)

        if(env != undefined){
            
            let found = false
            for (let i=0;i<env.params.length;i++){
                if (env.params[i].name == name){
                    env.params[i].value = value
                    found = true
                }
            }
            if (found == false){
                env.params.push(new NameValueEnabled(name,value,true))
            }
            console.log("In setEnv", env)
            EnvironmentService.updateEnv(env)
        }
        
        console.log(name,value)
        this.env[name] = value
    }

}