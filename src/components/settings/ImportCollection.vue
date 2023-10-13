<script setup lang="ts">

// Imports
//
import { reactive, ref, watchEffect, onMounted } from "vue";
import { DownloadIcon,FileIcon } from "@vue-icons/feather";
import { ipcRenderer } from "electron";
import { ImportService  } from "../../services/ImportService";
import { NotificationService } from "../../services/NotificationService";

//Properties
const props = defineProps<{ directory:string }>();
const emit = defineEmits(["onImportComplete"]);

// Variables
//
const collectionType = ref("postman")
const selectedFile = ref("")

//Global variables
//

//Event Handlers
//


// Click handlers
//
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

})
</script>

<template>
    <el-row>
        <el-col>
            <el-text>Directory : {{ directory }}</el-text>
        </el-col>
    </el-row>
    <el-row class="collection-types">
        <el-col>
            <el-text>Collection Type :  </el-text>
            <el-radio-group v-model="collectionType" class="ml-4">
                <el-radio label="postman" size="large">Postman Collection</el-radio>
                <el-radio label="insomnia" size="large">Insomnia Collection</el-radio>
            </el-radio-group>
        </el-col>
    </el-row>
    <el-row class="fileselect-row">
        <el-col :span="24">
            <el-text class="importfile-name"> {{getSelectedFileName()}} </el-text>
            <el-button :icon="FileIcon" @click="chooseFile"></el-button>
        </el-col>
    </el-row>
    <el-row>
        <el-col :span="24" class="save-btn-col">
            <el-button type="success" @click="importCollection" :icon="DownloadIcon">Import</el-button>
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
