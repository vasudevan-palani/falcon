// interfaces
export class NameValueEnabled{
    name:string
    value:string
    enabled:boolean

    constructor(name:string,value:string,enabled:boolean){
        this.name = name
        this.value = value
        this.enabled = enabled
    }
}


export class HttpResponse{
    status:number
    statusText : string
    headers : NameValueEnabled[]
    responseText: string
    responseJson: JSON

    constructor(status:number,statusText:string,headers:NameValueEnabled[],responseText:string,responseJson:JSON){
        this.status = status
        this.statusText = statusText
        this.headers = headers
        this.responseText = responseText
        this.responseJson = responseJson
    }
}

