<script setup lang="ts">

// Imports
//
import { reactive, ref, watchEffect, onMounted } from "vue";
import { DownloadIcon,FileIcon } from "@vue-icons/feather";
import { ipcRenderer } from "electron";
import { ImportService  } from "../../services/ImportService";
import { NotificationService } from "../../services/NotificationService";
import {CurlGenerator} from "curl-generator";

// Ace editor
import { VAceEditor } from "vue3-ace-editor";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-chrome";
import workerJsonUrl from "ace-builds/src-noconflict/worker-json?url"; // For vite
import ace from "ace-builds";
import themeChromeUrl from "ace-builds/src-noconflict/theme-chrome?url";
ace.config.setModuleUrl("ace/theme/chrome", themeChromeUrl);
ace.config.setModuleUrl("ace/mode/json_worker", workerJsonUrl);


//Properties
const props = defineProps<{ directory:string, request: any }>();
const emit = defineEmits(["onImportComplete"]);

// Variables
//
const collectionType = ref("postman")
const selectedFile = ref("")
const activeName = ref("curl")
const curlRequest = ref("")

//Global variables
//

//Event Handlers
//


// Click handlers
//

const handleTabClick = () => {

}
const chooseFile = () => {
    ipcRenderer.send('open-import-dialog')
}

ipcRenderer.on('selected-import-file', function (event, path) {
  //do what you want with the path/file selected, for example:
  console.log(path)
  selectedFile.value = path
});

const importCollection = () => {
    ImportService.import(props.directory, selectedFile.value).then((data) => {
    NotificationService.showMessage("Succesfully imported")
    emit("onImportComplete")
  }).catch((err: any) => {
    NotificationService.showMessage("Error while importing , " + err)
  })
}

//Utility function
//

const getSelectedFileName = ()=>{
    if (selectedFile.value == ""){
        return "Choose File"
    }
    return selectedFile.value
}


watchEffect(()=>{
    console.log(props)
    if (props.request != undefined){

        let requestBody = props.request.body
        if (props.request.gqlQueryBody != undefined){
            requestBody = {"query":props.request.gqlQueryBody,"variables":JSON.parse(props.request.gqlVariable)}
        }
        let headers:any = {}
        if(props.request.headers.length > 0){
            props.request.headers.map((headerItem:any)=>{
                headers[headerItem["name"]] = headerItem["value"]
            })
        }

        console.log(headers)

        curlRequest.value = CurlGenerator({
            url : props.request.url,
            method : props.request.httpmethod,
            headers : headers,
            body : requestBody
        })
        console.log(curlRequest.value)
    }
})
</script>

<template>
    <el-row>
        <el-col :span="24">
            <el-tabs v-model="activeName" class="tabs" @tab-click="handleTabClick">
                    <el-tab-pane label="Curl" name="curl">
                        <v-ace-editor v-model:value="curlRequest" lang="json" :options="{
                    useWorker: true,
                    showGutter: true,
                    highlightActiveLine: false,
                    showPrintMargin: false,
                    readOnly: true,
                    wrap: true
                  }" style="height: 500px" />
                  </el-tab-pane>
                    <el-tab-pane label="Python" name="py">
                    </el-tab-pane>
                    <el-tab-pane label="JavaScript" name="js">
                    </el-tab-pane>
                    
            </el-tabs>
        </el-col>
    </el-row>
</template>

<style scoped>
.margin-right-10px {
    margin-right: 10px;
}

.actions-row {
    margin-bottom: 10px;
}

.save-btn-col {
    margin-top: 40px;
    text-align: start;
}
.collection-types{
    margin-top: 10px;
    text-align: start;
}
.fileselect-row{
    margin-top: 10px;
    text-align: start;
}
.importfile-name{
    margin-right: 10px;
}
</style>
