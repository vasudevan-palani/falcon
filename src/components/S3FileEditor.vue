<script setup lang="ts">
import { reactive, ref, watchEffect } from "vue";
import VueJsoneditor from "vue3-ts-jsoneditor";
import { VAceEditor } from "vue3-ace-editor";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-chrome";
import workerJsonUrl from "ace-builds/src-noconflict/worker-json?url"; // For vite
import ace from "ace-builds";
import themeChromeUrl from "ace-builds/src-noconflict/theme-chrome?url";
ace.config.setModuleUrl("ace/theme/chrome", themeChromeUrl);
ace.config.setModuleUrl("ace/mode/json_worker", workerJsonUrl);
import { UserIcon, CheckIcon } from "@vue-icons/feather";
import Credentials from "../services/aws";
import S3Client from "../services/s3client";

// Init aws
//
const AWS = require("aws-sdk");

// reactive variables
//
const message = ref("");
const isSaveDisabled = ref(true);
const errorMessage = ref("");
const filetype = ref("unknown");
const customFiletype = ref("unknown");
const customFileTypeChoice = ref("")
const expires = ref("")
const invalidFile = ref(false)

const objectUrl = ref<string>("")

// Properties
//
const props = defineProps({
  s3url: {
    type: String,
  },
  s3bucket: {
    type: String,
  },
  size : {
    type: Number
  },
  lastmodified : {
    type: String
  }
});

let updatedContent: any = undefined;

const json = ref('{ name: "value" }');

// functions
//
const getFileType = (url: string) => {
  if (url.endsWith(".json")) {
    return "json";
  }
  if (url.endsWith(".js")) {
    return "javascript";
  }
  if (url.endsWith(".py")) {
    return "python";
  }
  if (url.endsWith("xml")) {
    return "xml";
  }
  if (url.endsWith("yml") || url.endsWith("yaml")) {
    return "yaml";
  }
  if (url.endsWith("txt") || url.endsWith("text")) {
    return "txt";
  }
  if (url.endsWith("csv")) {
    return "csv";
  }
  return "unknown";
};

// handlers
//
const saveContent = () => {
  AWS.config.update({
    accessKeyId: Credentials.getAccessKey(),
    secretAccessKey: Credentials.getSecretKey(),
  });
  const s3 = new AWS.S3();

  console.log(updatedContent);
  isSaveDisabled.value = true;
  message.value = "Saving....";
  errorMessage.value = "";

  if (updatedContent == undefined || updatedContent == "") {
    console.log("Invalid content");
    message.value = "";
    errorMessage.value = "Invalid Content";
  }

  new S3Client()
    .putObject(String(props.s3bucket), String(props.s3url), updatedContent)
    .then(() => {
      message.value = "Saved successfully.";
      errorMessage.value = "";
      isSaveDisabled.value = false;
      console.log("JSON content successfully written to S3 object!");
    })
    .catch((err) => {
      console.error("Error writing content to S3 object:", err);
      errorMessage.value = "Error writing content to S3 object:" + err;
      message.value = "";
      return;
    });
};

const onJsonChange = (content: any) => {
  console.log(content.text);
  updatedContent = content.text;
};

const onChange = (content: any) => {
  console.log(content);
  updatedContent = content;
};

const customFileTypeSelected = ()=>{
  console.log(customFileTypeChoice.value)
  if (customFileTypeChoice.value == "text"){
    customFiletype.value = "txt"
  }
  else if (customFileTypeChoice.value == "json"){
    customFiletype.value = "json"
  }
}

const formatSize = (sizeInBytes:number)=>{
  
  let sizeFormatString = ""
  if (sizeInBytes >= 0 && sizeInBytes < 1024){
    sizeFormatString = `${sizeInBytes} bytes`
  }
  if (sizeInBytes >= 1024 && sizeInBytes < 1024 * 1024){
    sizeFormatString = `${(sizeInBytes/1024).toFixed(2)} KB`
  }
  if (sizeInBytes >= 1024*1024 && sizeInBytes < 1024 * 1024 * 1024){
    sizeFormatString = `${(sizeInBytes/(1024*1024)).toFixed(2)} MB`
  }

  return sizeFormatString
}

// watchers
//
watchEffect(() => {
  objectUrl.value = ""
  json.value= ""
  customFileTypeChoice.value = ""
  customFiletype.value = ""
  invalidFile.value = false
  if (props.s3bucket == undefined || props.s3url == undefined) {
    return;
  }

  filetype.value = getFileType(props.s3url);

  // if (filetype.value == "unknown") {
  //   return;
  // }

  objectUrl.value = `s3://${props.s3bucket}/${props.s3url}`
  let filesize = props.size?props.size:0
  if((filesize) > (1024*1024*1024)){
    invalidFile.value = true
    errorMessage.value = `File size too big. ${formatSize(filesize)}`
    return
  }

  new S3Client()
    .getObject(props.s3bucket, props.s3url)
    .then((result: any) => {
      let contents = result.content;
      json.value = String(contents);
      isSaveDisabled.value = false;
      errorMessage.value = ""
    })
    .catch((err) => {
      console.error("Error getting JSON object from S3:", err);
      return;
    });
});
</script>

<template>
  <div class="file-editor">
    <el-row>
      <el-col :span="20" class="file-name">
        <el-text v-if="objectUrl == ''"
          >Please select a file</el-text
        >
        <el-text v-else>{{objectUrl}}</el-text>
      </el-col>
      <el-col :span="4" class="file-actions">
        <el-button
          :disabled="isSaveDisabled"
          @click="saveContent"
          type="success"
          :icon="CheckIcon"
          >Save</el-button
        >
      </el-col>
    </el-row>
    <el-row  v-if="filetype == 'unknown' && objectUrl != '' && invalidFile == false"> 
      <el-col :span="6" class="file-name">
        <el-text
          >Please select an editor</el-text
        >
      </el-col>
      <el-col :span="6">
        <el-radio-group v-model="customFileTypeChoice" class="ml-4" @change="customFileTypeSelected">
          <el-radio label="text" size="large">Text Editor</el-radio>
          <el-radio label="json" size="large">Json Editor</el-radio>
        </el-radio-group>
      </el-col>
    </el-row>
  </div>
  <div>
    <el-text type="danger">{{ errorMessage }}</el-text>
    <el-text type="success">{{ message }}</el-text>
  </div>
  <div v-if="objectUrl != '' && invalidFile == false">
    <el-row class="file-metadata">
      <el-col :span="12">
        <span> Last Modified : {{ lastmodified }}</span>
      </el-col>
      <el-col :span="12">
        <span> Size : {{ formatSize(size?size:0) }}</span>
      </el-col>
    </el-row>
  </div>
  <div class="s3editor" v-if="objectUrl != '' && invalidFile == false">
    <v-ace-editor
      v-if="(filetype != 'unknown' && filetype != 'json') || (customFiletype == 'txt')"
      v-model:value="json"
      @update:value="onChange"
      lang="filetype"
      :options="{ useWorker: true }"
      style="height: 720px"
    />
    <vue-jsoneditor
      v-else-if="filetype == 'json' || (customFiletype == 'json')"
      height="725"
      mode="text"
      v-model:text="json"
      @change="onJsonChange"
    />
    <el-text v-else> Please select a file or unknown file type </el-text>
  </div>
</template>

<style scoped>
.file-editor {
  border: #999 1px solid;
  border-radius: 5px;
  padding: 10px;
  margin: 10px;
}
.s3editor {
  text-align: left;
  padding: 10px;
}

.file-metadata{
  text-align: left;
  padding-left: 10px;
}

.file-name {
  text-align: left;
}

.file-actions {
  text-align: right;
}
</style>
