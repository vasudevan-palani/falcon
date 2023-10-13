export class EnvironmentParam{
    name : string
    value : string
    enabled : boolean

    constructor(name:string,value:string,enabled:boolean){
        this.name  = name
        this.value = value
        this.enabled = enabled
    }
}
export class Environment{
    name : string
    label : string
    params : EnvironmentParam[]

    constructor(name: string, label: string, params : EnvironmentParam[]) {
        this.name = name;
        this.label = label;
        this.params = params;
      }
}