<script setup lang="ts">
// Imports
//
import { reactive, ref, watchEffect, onMounted } from "vue";
import { SearchIcon } from "@vue-icons/feather";
import ListItems from "./ListItems.vue";

//Properties
const props = defineProps<{msg:boolean}>();
const emit = defineEmits(["onRequestClicked"]);

// Variables
//
const filter = ref("");
const error = ref("");

//Global variables
//
const items = [
  {
    Name: "tokens",
    isLeaf: false,
  },
  {
    Name: "Sat prod",
    isLeaf: true,
    data : {
        "requestName" : "Sat prod",
        "httpmethod" : "get",
        "url" : "https://sat-prod.codebig2.net/v2/getSAT/2788530798843639022",
        "params" : [
            {
                "name" : "partners",
                "value" : "xglobal",
                "enabled" : true
            },
            {
                "name" : "capabilities",
                "value" : "xcp:salescontext:create",
                "enabled" : true
            }
            
        ],
        "headers" : [
            {
                "name" : "X-Client-Id",
                "value" : "xcp_sales_gw_prod",
                "enabled" : true
            },
            {
                "name" : "X-Client-Secret",
                "value" : "5f2e363f57974a5e0b7a38a357cf3c9c",
                "enabled" : true
            }
        ],
        "body" : '',
        "authorization" : {
            "type" : ""
        }
    }
  },
];

//Event Handlers
//
const itemSelected = (item: any) => {
    console.log(item)
    emit("onRequestClicked",item);
};

// Click handlers
//

//Utility function
//

watchEffect(() => {});
</script>

<template>
  <el-row>
    <el-text v-if="error != ''" type="danger">{{ error }}</el-text>
  </el-row>
  <el-row class="searchfilter">
    <el-input
      v-model="filter"
      class="w-50 m-2"
      size="large"
      placeholder="Search"
      :suffix-icon="SearchIcon"
    />
  </el-row>
  <ListItems class="collection-list"
    :has-more="false"
    :items="items"
    @item-selected="itemSelected"
    :filter="filter"
  />
</template>

<style scoped>
.collection-list {
  text-align: left;
}
.searchfilter {
  margin: 10px;
}
</style>
