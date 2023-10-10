<script setup lang="ts">
// Imports
//
import { reactive, ref, watchEffect, onMounted } from "vue";
import { SearchIcon, FolderIcon } from "@vue-icons/feather";
import ListFiles from "./ListFiles.vue";
import { ipcRenderer } from "electron";
import {truncateText} from "../services/utils";
const path = require('path');
const fs = require('fs');



//interfaces
//


//Properties
const props = defineProps<{msg:boolean}>();
const emit = defineEmits(["onRequestClicked"]);

// Variables
//

const error = ref("");
const items = ref<any[]>([]);
const workspaceDirectory = ref("")

//Global variables
//


//Event Handlers
//
const onFileSelect = (item:any)=>{
  emit('onRequestClicked',item)
}

// Click handlers
//
const chooseWorkspace = ()=>{
  ipcRenderer.send('open-file-dialog')
}

ipcRenderer.on('selected-folder', function (event, path) {
  //do what you want with the path/file selected, for example:
  console.log(path)
  workspaceDirectory.value = path[0];
});

//Utility function
//

function readDirectoryRecursive(dirPath:string) : any {
    const stat = fs.statSync(dirPath);
    
    if (!stat.isDirectory()) {
      return { id: dirPath,label: path.basename(dirPath) };
    }

    const files = fs.readdirSync(dirPath);
    const children = [];

    for (const file of files) {
      const childPath = path.join(dirPath, file);
      const child = readDirectoryRecursive(childPath);
      children.push(child);
    }

    return { label:path.basename(dirPath), id:dirPath, children };
  }

const scanWorkspace = (dir:string) => {
  let data  = readDirectoryRecursive(dir);

  items.value = data.children.sort((a:any, b:any) => a.children?.length ? -1 : 1);

  console.log(items.value)
}

onMounted(()=>{

})

watchEffect(() => {
  if (workspaceDirectory.value != ''){
    scanWorkspace(workspaceDirectory.value)
  }
});
</script>

<template>
  <el-row>
    <el-text v-if="error != ''" type="danger">{{ error }}</el-text>
  </el-row>
  <el-row v-if="workspaceDirectory == ''">
    <el-col :span="24">
    <div><el-text>Please select a workspace directory</el-text></div>
    <el-button @click="chooseWorkspace">Choose</el-button>
  </el-col>
  </el-row>
  <el-row v-if="workspaceDirectory != ''" class="workspace-folder-row">
    <el-col>
      <el-text :title="workspaceDirectory">{{ truncateText(workspaceDirectory,38) }} &nbsp;&nbsp;</el-text>
      <el-button :icon="FolderIcon" @click="chooseWorkspace"></el-button>
    </el-col>
  </el-row>
  <ListFiles :items="items" @on-file-select="onFileSelect"></ListFiles>
</template>

<style scoped>
.workspace-folder-row{
  margin-top:10px;
}
</style>
