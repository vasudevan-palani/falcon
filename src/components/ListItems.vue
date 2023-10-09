<script setup lang="ts">

// Imports
//
import { reactive, ref, watchEffect, onMounted } from "vue";
import { FolderIcon,FileIcon } from "@vue-icons/feather";

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


//Utility function
//
const truncateText = (text:string, maxLength:number) => {
      if (text.length <= maxLength) {
        return text; // Return the original text if it's shorter than or equal to maxLength
      } else {
        return text.slice(0, maxLength) + '...'; // Truncate and add ellipsis
      }
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
</script>

<template>
  <div class="files">
    <div v-for="(item, index) in viewItems">
      <el-link v-if="item.isLeaf == false" :icon="FolderIcon" :type="item.selected ? 'primary' : 'default'" @click="() => selectItem(item,index)" :underline="false"
        :title="item.Name">&nbsp;&nbsp;{{ truncateText(item.Name,30) }}</el-link>
        <el-link v-if="item.isLeaf == true" :icon="FileIcon" :type="item.selected ? 'primary' : 'default'" @click="() => selectItem(item,index)" :underline="false"
        :title="item.Name">&nbsp;&nbsp;{{ truncateText(item.Name,30) }}</el-link>
    </div>
    <div>
      <el-link v-if="hasMore" type="primary" @click="onClickedMore">More..</el-link>
    </div>
  </div>
</template>

<style scoped>
.files {
  border: #DDD 1px solid;
  border-radius: 5px;
  padding: 10px;
  margin: 10px;
  max-height: 900px;
  height:840px;
  overflow-y: scroll;
}
</style>
