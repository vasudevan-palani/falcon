<script setup lang="ts">

// Imports
//
import { reactive, ref, watchEffect, onMounted } from "vue";
import { FolderIcon,FileIcon } from "@vue-icons/feather";

import {truncateText} from "../services/utils";
import { ElTreeV2 } from 'element-plus'
import type { TreeNode } from 'element-plus/es/components/tree-v2/src/types'

interface Tree {
  id: string
  label: string
  children?: Tree[]
}

//Properties
const props = defineProps<{ items: any[],hasMore:boolean,filter:string }>();
const emit = defineEmits(["itemSelected","clickedMore"]);

// Variables
//
const viewItems  = ref<any[]>([]);

//Global variables
//
let selectedItem:any = undefined
let selectedIndex:number|undefined = undefined

const treeprops = {
  value: 'id',
  label: 'label',
  children: 'children',
}

//Event Handlers
//

// Click handler for selected item
//
const selectItem = (item:any,index:number) => {
  if (item == undefined){
    return
  }
    if (selectedIndex != undefined){
      if (selectedIndex < props.items.length){
        props.items[selectedIndex].selected = false
      }
      
    }
    item.selected = true;
    selectedItem = item;
    emit('itemSelected',item);
    selectedIndex = index
}

//OnClick handler of More...
//
const onClickedMore = ()=>{
  console.log("ListItems::onClickedMore")
  emit('clickedMore');
}


watchEffect(()=>{

  viewItems.value = props.items

  // filter change
  let filterItems = []
  if (props.filter != ''){
    for(let index in props.items){
      if (props.items[index].Name.includes(props.filter)){
        filterItems.push(props.items[index])
      }
    }
    viewItems.value = filterItems
  }
})
const query = ref('')
const treeRef = ref<InstanceType<typeof ElTreeV2>>()
const onQueryChanged = (query: string) => {
  treeRef.value!.filter(query)
}
const filterMethod = (query: string, node: TreeNode) => {
  return node.label!.includes(query)
}
</script>

<template>
  <div class="files">
    <el-input
    v-model="query"
    placeholder="Please enter keyword"
    @input="onQueryChanged"
  />
  <el-tree-v2
    ref="treeRef"
    :data="viewItems"
    :props="treeprops"
    :filter-method="filterMethod"
    :height="208"
  />
    <!--div v-for="(item, index) in viewItems">
      <el-link v-if="item.isLeaf == false" :icon="FolderIcon" :type="item.selected ? 'primary' : 'default'" @click="() => selectItem(item,index)" :underline="false"
        :title="item.Name">&nbsp;&nbsp;{{ truncateText(item.Name,30) }}</el-link>
        <el-link v-if="item.isLeaf == true" :icon="FileIcon" :type="item.selected ? 'primary' : 'default'" @click="() => selectItem(item,index)" :underline="false"
        :title="item.Name">&nbsp;&nbsp;{{ truncateText(item.Name,30) }}</el-link>
    </div>
    <div>
      <el-link v-if="hasMore" type="primary" @click="onClickedMore">More..</el-link>
    </div-->
  </div>
</template>

<style scoped>
.files {
  border: #DDD 1px solid;
  border-radius: 5px;
  padding: 10px;
  margin: 10px;
  max-height: 900px;
  height:795px;
  overflow-y: scroll;
}
</style>
