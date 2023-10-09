class AwsCredentials {
    accessKey : string;
    secretKey : string;
    sessionToken : string;
    defaultRegion : string;

    constructor(accessKey: string, secretKey: string, sessionToken: string, defaultRegion: string) {
        this.accessKey = accessKey;
        this.secretKey = secretKey;
        this.sessionToken = sessionToken;
        this.defaultRegion = defaultRegion;
    }

    setAccessKey(accessKey : string){
        this.accessKey = accessKey
    }

    setSecretKey(secretKey : string){
        this.secretKey = secretKey
    }

    getAccessKey(){
        return this.accessKey
    }

    getSecretKey(){
        return this.secretKey
    }

    getDefaultRegion(){
        return this.defaultRegion
    }

    getSessionToken(){
        return this.sessionToken
    }

    setSessionToken(sessionToken:string){
        this.sessionToken = sessionToken
    }

    setDefaultRegion(defaultRegion:string){
        this.defaultRegion = defaultRegion
    }
}

let Credentials = new AwsCredentials("","","","")
export default Credentials