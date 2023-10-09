<script setup lang="ts">
// Imports
//
import { reactive, ref, watchEffect, onMounted } from "vue";
import { FolderIcon, FileIcon } from "@vue-icons/feather";

// Ace editor
import { VAceEditor } from "vue3-ace-editor";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-chrome";
import workerJsonUrl from "ace-builds/src-noconflict/worker-json?url"; // For vite
import ace from "ace-builds";
import themeChromeUrl from "ace-builds/src-noconflict/theme-chrome?url";
ace.config.setModuleUrl("ace/theme/chrome", themeChromeUrl);
ace.config.setModuleUrl("ace/mode/json_worker", workerJsonUrl);

import {NameValueEnabled} from '../common/model';

//Properties
const props = defineProps<{item:any}>();
const emit = defineEmits([]);

// Variables
//
const activeName = ref("body");
const responseBody = ref('{"name":"vsdff"}');
const responseHeaders = ref<NameValueEnabled[]>()
const responseStatus = ref<number>()
const responseStatusText = ref<string>()

//Global variables
//

//Event Handlers
//
const handleTabClick = () => {};

const onResponseBodyChange = () => {};

// Click handlers
//

//Utility function
//

onMounted(()=>{
    if (props.item?.response != undefined){
        responseBody.value = "";
        responseHeaders.value = props.item.response.headers
        responseStatus.value = props.item.response.status
        responseStatusText.value = props.item.response.statusText
    }
})

watchEffect(() => {
    console.log(props.item)
    if (props.item?.response != undefined){
        responseBody.value = "";
        responseHeaders.value = props.item.response.headers
        responseStatus.value = props.item.response.status
        responseStatusText.value = props.item.response.statusText
        responseBody.value = JSON.stringify(props.item.response?.responseJson,null,4)
    }
});
</script>

<template>
  <el-row class="response">
    <el-col :span="24">
      <el-row>
        <el-col :span="18">
          <el-text> Response </el-text>
        </el-col>
        <el-col :span="6" class="status-col">
          <el-text> Status : {{ responseStatus }} ({{ responseStatusText }}) </el-text>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-tabs
            v-model="activeName"
            class="aws-tabs"
            @tab-click="handleTabClick"
          >
            <el-tab-pane name="headers">
                <template #label>
                    
                        <el-text>Headers <el-text v-if="responseHeaders != undefined && responseHeaders.length >0? true:false" type="primary">({{ responseHeaders?.length }})</el-text></el-text>
                    
                </template>
              <el-row class="form-row" v-for="header in responseHeaders">
                <el-col :span="11">
                    <el-text>{{ header.name }}</el-text>
                </el-col>
                <el-col :span="11">
                    <el-text>{{ header.value }}</el-text>
                </el-col>
                <el-col :span="12"></el-col>
                
              </el-row>
            </el-tab-pane>
            <el-tab-pane label="Body" name="body">
              <el-row class="form-row">
                <el-col>
                  <v-ace-editor
                    v-model:value="responseBody"
                    @update:value="onResponseBodyChange"
                    lang="json"
                    :options="{
                      useWorker: true,
                      showGutter: false,
                      highlightActiveLine: false,
                      showPrintMargin: false,
                      readOnly: true,
                      wrap:true
                    }"
                    style="height: 300px"
                  />
                </el-col>
              </el-row>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </el-col>
  </el-row>
</template>

<style scoped>
.status-col{
    text-align: right;
}
.response {
  border: #EEE 1px solid;
  border-radius: 5px;
  padding: 10px;
  margin-top: 10px;
  margin-right: 10px;
  height: 440px;
  overflow-y: scroll;
  text-align: left;
}
</style>
