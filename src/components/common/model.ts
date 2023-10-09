// interfaces
export interface NameValueEnabled{
    name:string
    value:string
    enabled:boolean
}


export interface HttpResponse{
    status:number
    statusText : string
    headers : NameValueEnabled[]
    responseText: string
    responseJson: JSON
}

