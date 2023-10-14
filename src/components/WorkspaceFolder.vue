<script setup lang="ts">
// Imports
//
import { reactive, ref, watchEffect, onMounted } from "vue";
import { SearchIcon, FolderIcon } from "@vue-icons/feather";
import ListFiles from "./ListFiles.vue";
import { ipcRenderer } from "electron";
import { truncateText } from "../services/utils";
import { RequestService } from "../services/RequestService";
import { NotificationService } from "../services/NotificationService";
import { WorkspaceService } from "../services/WorkspaceService";
const path = require('path');
const fs = require('fs');

//interfaces
//


//Properties
const props = defineProps<{ msg: boolean, workspaceDir: string }>();
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
const onFileSelect = (item: any) => {
  emit('onRequestClicked', item)
}

const onCreateRequest = (dirPath: string, requestName: string) => {
  let directoryPath = dirPath == undefined ? workspaceDirectory.value : dirPath
  console.log("onCreateRequest", dirPath, requestName)
  try {
    RequestService.add(directoryPath, requestName)
    NotificationService.showMessage("Request added.")
    scanWorkspace(workspaceDirectory.value)
  } catch (err: any) {
    NotificationService.showMessage("Failed to add request. " + err)
  }
}

const onCreateFolder = (dirPath: string, newDirectoryName: string) => {
  let directoryPath = dirPath == undefined ? workspaceDirectory.value : dirPath
  console.log("onCreateFolder", dirPath, newDirectoryName)
  WorkspaceService.createFolder(directoryPath, newDirectoryName).then((data: any) => {
    NotificationService.showMessage("Folder added.")
    scanWorkspace(workspaceDirectory.value)
  }).catch((err: any) => {
    NotificationService.showMessage("Failed to add folder. " + err)
  })
}

const onDeleteFileOrDirectory = (targetPath: string) => {
  console.log("onDeleteFileOrDirectory", targetPath)
  WorkspaceService.deleteFileOrDirectory(targetPath).then((data: any) => {
    NotificationService.showMessage(`${targetPath} deleted.`)
    scanWorkspace(workspaceDirectory.value)
  }).catch((err: any) => {
    NotificationService.showMessage("Failed to delete. " + err)
  })
}

const onRename = () => {
  scanWorkspace(workspaceDirectory.value)
}

// Click handlers
//
const chooseWorkspace = () => {
  ipcRenderer.send('open-file-dialog')
}

ipcRenderer.on('selected-folder', function (event, path) {
  //do what you want with the path/file selected, for example:
  console.log(path)
  workspaceDirectory.value = path[0];
});


//Utility function
//

function readDirectoryRecursive(dirPath: string): any {
  const stat = fs.statSync(dirPath);

  if (!stat.isDirectory()) {
    return { id: dirPath, label: path.basename(dirPath) };
  }

  const files = fs.readdirSync(dirPath);
  const children = [];

  for (const file of files) {
    const childPath = path.join(dirPath, file);
    const child = readDirectoryRecursive(childPath);
    children.push(child);
  }

  return { label: path.basename(dirPath), id: dirPath, children };
}

const scanWorkspace = (dir: string) => {
  let data = readDirectoryRecursive(dir);

  items.value = data.children.sort((a: any, b: any) => a.children?.length ? -1 : 1);

  console.log(items.value)
}

onMounted(() => {
  workspaceDirectory.value = props.workspaceDir
  scanWorkspace(props.workspaceDir)
})

watchEffect(() => {
  if (workspaceDirectory.value != '') {
    scanWorkspace(workspaceDirectory.value)
  }
});
</script>

<template>
  <el-row>
    <el-text v-if="error != ''" type="danger">{{ error }}</el-text>
  </el-row>
  <el-row v-if="workspaceDirectory != ''" class="workspace-folder-row">

  </el-row>
  <ListFiles :workspace-dir="workspaceDirectory" :items="items" @on-file-select="onFileSelect" @on-create-request="onCreateRequest"
    @on-create-folder="onCreateFolder" @on-delete-file-or-directory="onDeleteFileOrDirectory" @on-rename="onRename"></ListFiles>
</template>

<style scoped>
.workspace-folder-row {
  margin-top: 10px;
}
</style>
