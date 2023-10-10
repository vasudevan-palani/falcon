<script setup lang="ts">

// Imports
//
import { reactive, ref, watchEffect, onMounted } from "vue";
import { SearchIcon } from "@vue-icons/feather";
import { ElTreeV2 } from 'element-plus'
import type { TreeNode } from 'element-plus/es/components/tree-v2/src/types'
//Properties
const props = defineProps<{ items:any }>();
const emit = defineEmits(["onFileSelect"]);

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
      emit("onFileSelect",item);
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



//Utility function
//

onMounted(()=>{
  fileList.value = props.items
})


watchEffect(()=>{
  fileList.value = props.items
  console.log(props.items)
})
</script>

<template>
      
  <el-row class="searchfilter">
    <el-input
      v-model="filter"
      @input = "onQueryChanged"
      class="w-50 m-2"
      size="large"
      placeholder="Search"
      :suffix-icon="SearchIcon"
    />
  </el-row>
    <el-col :span="24" v-if="fileList.length > 0">
    <el-tree-v2 class="collection-list"
    ref="treeRef"
    :filter-method="filterMethod"
    @node-click = "itemSelected"
    :data="fileList"
    :props = "treeprops"
    :height="208"
  />
  </el-col>
</template>

<style scoped>
.collection-list {
  text-align: left;
  border: #EEE 1px solid;
  border-radius: 5px;
  margin: 10px;
  height:836px;
}
.searchfilter {
  margin: 10px;
}
</style>
