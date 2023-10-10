import { readFileContent,writeContentToFile } from "./utils"
const os = require('os')

export class EnvironmentService {
    init(){

    }

    static getAll(){
        return new Promise((resolve,reject)=>{
            readFileContent(os.homedir() + "/.falcon_env",(err:any,data:any)=>{
                if(err != undefined || err != null){
                    reject(err);
                }
                resolve(JSON.parse(data));
            })
        })
    }

    static addAll(envs:any){
        return new Promise((resolve,reject)=>{
            writeContentToFile(os.homedir() + "/.falcon_env",JSON.stringify(envs),(err:any,data:any)=>{
                if(err != undefined || err != null){
                    reject(err);
                }
                resolve(data);
            })
        })
    }

    static updateAll(envs:any){
        return this.addAll(envs)
    }

}