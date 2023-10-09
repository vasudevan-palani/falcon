<script setup lang="ts">
// Imports
//
import { reactive, ref, watchEffect, onMounted } from "vue";
import { SearchIcon, FolderIcon } from "@vue-icons/feather";
import ListItems from "./ListItems.vue";
import { ipcRenderer } from "electron";
import {truncateText} from "../services/utils";
const path = require('path');
const fs = require('fs');
import { ElTreeV2 } from 'element-plus'
import type { TreeNode } from 'element-plus/es/components/tree-v2/src/types'


//interfaces
//
interface Tree {
  id: string
  label: string
  children?: Tree[]
}

//Properties
const props = defineProps<{msg:boolean}>();
const emit = defineEmits(["onRequestClicked"]);

// Variables
//
const filter = ref("");
const error = ref("");
const items = ref<any[]>([]);
const workspaceDirectory = ref("")

//Global variables
//
const treeprops = {
  value: 'id',
  label: 'label',
  children: 'children',
}

//Event Handlers
//
const itemSelected = (item: any,node:any,event:any) => {
    console.log(item)

    if(item.value?.children == undefined){
      emit("onRequestClicked",item);
    }
    // if(item.isLeaf == false){
    //   workspaceDirectory.value = workspaceDirectory.value + "/" + item.Name
    //   return
    // }
    // emit("onRequestClicked",item);
};
const treeRef = ref<InstanceType<typeof ElTreeV2>>()
const onQueryChanged = (query: string) => {
  // TODO: fix typing when refactor tree-v2
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  treeRef.value!.filter(query)
}

const filterMethod = (query: string, node: TreeNode) => {
  return node.label!.includes(query)
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
  
  <el-row class="searchfilter" v-if="workspaceDirectory != ''">
    <el-input
      v-model="filter"
      @input = "onQueryChanged"
      class="w-50 m-2"
      size="large"
      placeholder="Search"
      :suffix-icon="SearchIcon"
    />
  </el-row>
  <el-row v-if="workspaceDirectory != ''">
    <el-col>
      <el-text :title="workspaceDirectory">{{ truncateText(workspaceDirectory,38) }} &nbsp;&nbsp;</el-text>
      <el-button :icon="FolderIcon" @click="chooseWorkspace"></el-button>
    </el-col>
  </el-row>
  <!--ListItems class="collection-list" v-if="workspaceDirectory != ''"
    :has-more="false"
    :items="items"
    @item-selected="itemSelected"
    :filter="filter"
  /-->
  <el-tree-v2 class="collection-list"
    ref="treeRef"
    :filter-method="filterMethod"
    @node-click = "itemSelected"
    :data="items"
    :props = "treeprops"
    :height="208"
  />
</template>

<style scoped>
.collection-list {
  text-align: left;
  border: #EEE 1px solid;
  border-radius: 5px;
  margin: 10px;
  height:815px;
}
.searchfilter {
  margin: 10px;
}
</style>
