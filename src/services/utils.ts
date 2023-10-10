const fs = require('fs')
//Utility function to truncate text
//
export const truncateText = (text:string, maxLength:number) => {
    if (text.length <= maxLength) {
      return text; // Return the original text if it's shorter than or equal to maxLength
    } else {
      return text.slice(0, maxLength) + '...'; // Truncate and add ellipsis
    }
}


export function readFileContent(filePath: string, callback: any) {
  fs.readFile(filePath, 'utf8', (err: any, data: any) => {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, data);
  });
}

export function writeContentToFile(filePath:string,content:any,callback:any){
  fs.writeFile(filePath,content,(err:any,data:any)=>{
    if(err){
      callback(err,null)
    }else{
      callback(null,data)
    }
  })
}