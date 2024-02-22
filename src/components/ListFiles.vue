<script setup lang="ts">

// Imports
//
import { reactive, ref, watchEffect, onMounted } from "vue";
import { SearchIcon, RefreshCcwIcon as RefreshIcon, Trash2Icon, FolderIcon, Edit2Icon } from "@vue-icons/feather";
import { ElTreeV2, ElPopconfirm, ElPopover } from 'element-plus'
import type { TreeNodeData, FilterMethod } from 'element-plus/es/components/tree-v2/src/types'
import {collectionContainerHeight} from '../../config/main'
import {StorageService} from '../services/StorageService'
import { FileIcon } from "@vue-icons/feather";
//Properties
const props = defineProps<{ items: any, workspaceDir: string }>();
const emit = defineEmits(["onFileSelect", "onFolderSelect", "onCreateRequest", "onCreateFolder", "onDeleteFileOrDirectory","onRename","onRefresh"]);

//Interfaces
//
interface Tree {
  id: string
  label: string
  children?: Tree[]
}

// Variables
//
const filter = ref("");
const fileList = ref([])
const selectedFile = ref<any>()
const selectedFolder = ref<any>()
const newRequestVisible = ref(false)
const newRequestName = ref("")
const newFolderVisible = ref(false)
const newFolderName = ref("")
const renameFormVisible = ref(false)
const renameValue = ref("")

//Global variables
//
const treeprops = {
  value: 'id',
  label: 'label',
  children: 'children',
}

//Event Handlers
//
const itemSelected = (item: any, node: any, event: any) => {
  console.log(item)

  if (item?.children == undefined) {
    console.log("onFileSelect", item)
    emit("onFileSelect", item);
    selectedFile.value = item
    selectedFolder.value = undefined
  }
  if (item?.children != undefined) {
    console.log("onFolderSelect", item)
    emit("onFolderSelect", item);
    selectedFolder.value = item
    selectedFile.value = undefined
  }

};
const treeRef = ref<InstanceType<typeof ElTreeV2>>()
const onQueryChanged = (query: string) => {
  // TODO: fix typing when refactor tree-v2
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  treeRef.value!.filter(query)
}

const filterMethod: FilterMethod = (query: string, node: TreeNodeData) => {
  return node.label!.includes(query)
}

const getFilterMethod = () => {
  return filterMethod
}

const checkChange = (event: any) => {
  console.log("checkchange", event)
}


// Click handlers
//

const renameFileFolder = () => {
  let selectedFileFolder = getSelectedFileOrDir()
  if (selectedFileFolder == undefined){
    return
  }
  StorageService.renameFileFolder(String(selectedFileFolder),renameValue.value)
  renameFormVisible.value = false
  emit('onRename')
}


const deleteSelectedFileFolder = () => {
  console.log("Deleting", treeRef.value?.getCurrentKey())
  emit("onDeleteFileOrDirectory", treeRef.value?.getCurrentKey())
}

const createFolder = () => {

  console.log("Creating folder in ", getCurrentFileOrDir())
  emit("onCreateFolder", getCurrentFileOrDir(), newFolderName.value)
  newFolderVisible.value = !newFolderVisible.value;
}

const emitRefresh = () => {
  emit("onRefresh")
}

const createRequest = () => {

  console.log("Creating request in ", getCurrentFileOrDir())
  emit("onCreateRequest", getCurrentFileOrDir(), newRequestName.value)
  newRequestVisible.value = false
}

const getCurrentFileOrDir = () => {
  let currentDirectory = treeRef.value?.getCurrentKey()
  if (currentDirectory == undefined || ! StorageService.isDirectory(String(currentDirectory))) {
    currentDirectory = props.workspaceDir
  }
  
  return currentDirectory
}


const showNewFolderPopover = () => {
  newFolderVisible.value = !newFolderVisible.value;
}

const showRenameFormPopover = () => {
  renameFormVisible.value = true
}



//Utility function
//

const getSelectedFileOrDir = () => {
  let currentDirectory = treeRef.value?.getCurrentKey()

  if (currentDirectory == undefined || String(currentDirectory) == "" ) {
    return undefined
  }
  
  return String(currentDirectory)
}

const getDeleteConfirmTitle = () => {
  console.log(treeRef.value?.getCurrentKey())
  let file = treeRef.value?.getCurrentKey()
  return `Are you sure to delete ${file} ?`;
}

onMounted(() => {
  fileList.value = props.items
})


watchEffect(() => {
  fileList.value = props.items
  console.log(props.items)
})
</script>

<template>
  <el-row class="searchfilter">
    <el-input v-model="filter" @input="onQueryChanged" class="w-50 m-2" size="large" placeholder="Search"
      :suffix-icon="SearchIcon" />
    <el-row class="file-actions-row">
      <el-col :span="5">
        <el-popover :visible="newFolderVisible" placement="right" :width="500">
          <el-row class="margin-bottom-10">
            <el-col :span="24">
              <el-text class="left-justify">Directory : {{ getCurrentFileOrDir() }}</el-text>
            </el-col>
          </el-row>
          <el-row class="margin-bottom-10">
            <el-col :span="24">
              <el-text class="left-justify">Please enter the folder name</el-text>
            </el-col>
          </el-row>

          <el-row class="margin-bottom-10">
            <el-col :span="24">
              <el-input v-model="newFolderName"></el-input>
            </el-col>
          </el-row>

          <el-row class="margin-bottom-10">
            <el-col :span="12">
              <el-button type="danger" @click="newFolderVisible = false" plain>Cancel</el-button>
              <el-button type="primary" @click="createFolder" plain>Submit</el-button>
            </el-col>
          </el-row>
          <template #reference>
              <el-button title="Create Folder" type="primary" @click="showNewFolderPopover" plain :icon="FolderIcon" circle></el-button>
          </template>
        </el-popover>

      </el-col>
      <el-col :span="5">
        <el-popover :visible="newRequestVisible" placement="right" :width="500">
          <el-row class="margin-bottom-10">
            <el-col :span="24">
              <el-text class="left-justify">Directory : {{ getCurrentFileOrDir() }}</el-text>
            </el-col>
          </el-row>
          <el-row class="margin-bottom-10">
            <el-col :span="24">
              <el-text class="left-justify">Please enter the request name</el-text>
            </el-col>
          </el-row>

          <el-row class="margin-bottom-10">
            <el-col :span="24">
              <el-input v-model="newRequestName"></el-input>
            </el-col>
          </el-row>

          <el-row class="margin-bottom-10">
            <el-col :span="12">
              <el-button type="danger" @click="newRequestVisible = false" plain>Cancel</el-button>
              <el-button type="primary" @click="createRequest" plain>Submit</el-button>
            </el-col>
          </el-row>
          <template #reference>
            <el-button title="Create File" type="primary" @click="newRequestVisible = !newRequestVisible" plain
              :icon="FileIcon" circle></el-button>
          </template>
        </el-popover>

      </el-col>
      <el-col :span="5">
        <el-button title="Refresh" type="primary" @click="emitRefresh()" plain
              :icon="RefreshIcon" circle></el-button>
      </el-col>
      <el-col :span="5">
        <el-popover :visible="renameFormVisible" placement="right" :width="500">
          <el-row class="margin-bottom-10">
            <el-col :span="24">
              <el-text class="left-justify">Directory/File : {{ getSelectedFileOrDir() }}</el-text>
            </el-col>
          </el-row>
          <el-row class="margin-bottom-10">
            <el-col :span="24">
              <el-text class="left-justify">Please enter new name</el-text>
            </el-col>
          </el-row>

          <el-row class="margin-bottom-10">
            <el-col :span="24">
              <el-input v-model="renameValue"></el-input>
            </el-col>
          </el-row>

          <el-row class="margin-bottom-10">
            <el-col :span="12">
              <el-button type="danger" @click="renameFormVisible = false" plain>Cancel</el-button>
              <el-button type="primary" @click="renameFileFolder" plain>Submit</el-button>
            </el-col>
          </el-row>
          <template #reference>
              <el-button title="Rename File/Folder" :disabled="selectedFolder == undefined && selectedFile == undefined" type="primary" @click="showRenameFormPopover" plain :icon="Edit2Icon" circle></el-button>
          </template>
        </el-popover>
      </el-col>
      <el-col :span="4">
        <el-popconfirm width="400" confirm-button-text="OK" cancel-button-text="No, Thanks" icon-color="#626AEF"
          :title="getDeleteConfirmTitle()" @confirm="deleteSelectedFileFolder">
          <template #reference>
            <el-button title="Delete File/Folder" type="danger" :disabled="selectedFolder == undefined && selectedFile == undefined" plain
              :icon="Trash2Icon" circle></el-button>
          </template>
        </el-popconfirm>
      </el-col>

    </el-row>
  </el-row>
  <el-col :span="24" v-if="fileList.length > 0">
    <el-tree-v2 :filter-method="filterMethod" ref="treeRef" @node-click="itemSelected"
      @current-change="checkChange" :data="fileList" :props="treeprops" :height="900"/>
  </el-col>
</template>

<style scoped>
.collection-list {
  text-align: left;
  border: #EEE 1px solid;
  border-radius: 5px;
  margin: 10px;
}

.margin-bottom-10 {
  margin-bottom: 10px;
}

.searchfilter {
  margin: 10px;
}

.left-justify {
  justify-content: left;
}

.file-actions-row {
  width: 100%;
  margin-top: 10px;
}</style>
