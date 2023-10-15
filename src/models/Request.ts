import { NameValueEnabled } from "../components/common/model"
export class Request{
    requestName : string
    body : string
    headers : NameValueEnabled[]
    params : NameValueEnabled[]
    url : string
    httpmethod : string
    script : string
    selectedContentType : string
    gqlVariable : string
    gqlQueryBody : string

    constructor(
        requestName : string,
        body : string, 
        headers : NameValueEnabled[],
        params:NameValueEnabled[],
        url:string,
        httpmethod:string,
        script:string,
        selectedContentType:string,
        gqlVariable:string,
        gqlQueryBody:string
    ){
        this.requestName  = requestName
        this.body = body
        this.headers = headers
        this.params = params
        this.url = url
        this.httpmethod = httpmethod
        this.script = script
        this.selectedContentType = selectedContentType
        this.gqlVariable = gqlVariable
        this.gqlQueryBody = gqlQueryBody
    }
}