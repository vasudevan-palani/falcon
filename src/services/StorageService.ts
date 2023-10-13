const os = require('os')
const fs = require('fs')

export class StorageService {
    static writeSync(url: string, data: string) {
        fs.writeFileSync(url, data, 'utf8');
    }
    static getSync(url: string) {
        return fs.readFileSync(url, 'utf8');
    }

    static isExists(filePath: string) {
        try {
            // Check if the file exists using fs.accessSync
            fs.accessSync(filePath, fs.constants.F_OK);
            return true; // The file exists
        } catch (err) {
            return false; // The file does not exist or there was an error
        }
    }
}