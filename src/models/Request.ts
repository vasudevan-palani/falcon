import { NameValueEnabled } from "../components/common/model"
export class Request{
    requestName : string
    body : string
    headers : NameValueEnabled[]
    params : NameValueEnabled[]
    url : string
    httpmethod : string
    script : string

    constructor(requestName : string,body : string, headers : NameValueEnabled[],params:NameValueEnabled[],url:string,httpmethod:string,script:string){
        this.requestName  = requestName
        this.body = body
        this.headers = headers
        this.params = params
        this.url = url
        this.httpmethod = httpmethod
        this.script = script
    }
}