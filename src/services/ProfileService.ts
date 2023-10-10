import { readFileContent,writeContentToFile } from "./utils"
const os = require('os')

export class ProfileService{
    static get(){
        return new Promise((resolve,reject)=>{
            readFileContent(os.homedir() + "/.falcon",(err:any,data:any)=>{
                if(err != undefined || err != null){
                    reject(err);
                }
                resolve(JSON.parse(data));
            })
        })
    }
    static update(data:any){
        return new Promise((resolve,reject)=>{
            writeContentToFile(os.homedir() + "/.falcon",JSON.stringify(data),(err:any,data:any)=>{
                if(err != undefined || err != null){
                    reject(err);
                }
                resolve(data);
            })
        })
    }
}