<script setup lang="ts">
// Imports
//
import { reactive, ref, watchEffect, onMounted } from "vue";
import { ChevronsRightIcon, SaveIcon, Trash2Icon, PlusIcon } from "@vue-icons/feather";

// Ace editor
import { VAceEditor } from "vue3-ace-editor";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/mode-javascript";
// import "ace-builds/src-noconflict/theme-chrome";
import "ace-builds/src-noconflict/mode-graphqlschema";
import "ace-builds/src-noconflict/mode-graphql";
// import workerJsonUrl from "ace-builds/src-noconflict/worker-json?url"; // For vite
// import ace from "ace-builds";
// import themeChromeUrl from "ace-builds/src-noconflict/theme-chrome?url";
// ace.config.setModuleUrl("ace/theme/chrome", themeChromeUrl);
// ace.config.setModuleUrl("ace/mode/json_worker", workerJsonUrl);

import { NameValueEnabled } from '../common/model'

//Properties
const props = defineProps<{ item: any, sendloading: boolean }>();
const emit = defineEmits(['onSendRequest', 'onSaveRequest']);

// Variables
//
const activeName = ref("body")
const httpmethod = ref("")
const requestName = ref("")
const httpurl = ref("")
const requestBody = ref("")
const params = ref<NameValueEnabled[]>([])
const headers = ref<NameValueEnabled[]>([])
const requestScript = ref("")
const contentTypes = ref<any[]>([])
const selectedContentType = ref("none")
const gqlQueryBody = ref("")
const gqlVariable = ref("")
const urlEncodedParams = ref<NameValueEnabled[]>([])

//Global variables
//
const httpmethods = [
  {
    "value": "GET",
    "label": "GET"
  },
  {
    "value": "POST",
    "label": "POST"
  },
  {
    "value": "PUT",
    "label": "PUT"
  },
  {
    "value": "OPTIONS",
    "label": "OPTIONS"
  },
  {
    "value": "PATCH",
    "label": "PATCH"
  },
  {
    "value": "DELETE",
    "label": "DELETE"
  }
]

contentTypes.value = [
  {
    "label": "none",
    "value": "none"
  },
  {
    "label": "json",
    "value": "application/json"
  },
  {
    "label": "xml",
    "value": "application/xml"
  },
  {
    "label": "graphql",
    "value": "application/graphql"
  },
  {
    "label": "x-www-form-urlencoded",
    "value": "application/x-www-form-urlencoded"
  },
  {
    "label": "text",
    "value": "text/plain"
  },
  {
    "label": "html",
    "value": "text/html"
  }
]

//Event Handlers
//

const onRequestBodyChange = (content: any) => {
  console.log(content)
}

const onRequestScriptChange = (script: any) => {
  console.log(script)
}

const onGqlQueryBodyChange = (content: any) => {

}

const onGqlVariableChange = (content: any) => {

}

const onChangeSelectedContentType = () => {
  let contentType = selectedContentType.value

  if (contentType == "application/graphql"){
    contentType = "application/json"
  }
  crudateHeader("content-type",contentType)
}

// Click handlers
//
const handleTabClick = () => {

}

const addParam = () => {
  params.value.push({
    "name": "",
    "value": "",
    "enabled": true
  })
}

const addHeader = () => {
  headers.value.push({
    "name": "",
    "value": "",
    "enabled": true
  })
}

const deleteParam = (paramIndex: number) => {
  params.value.splice(paramIndex, 1)
}

const deleteHeader = (paramIndex: number) => {
  headers.value.splice(paramIndex, 1)
}

const sendRequest = () => {
  console.log("request", headers.value, params.value, requestBody.value, httpurl.value, httpmethod.value)
  emit('onSendRequest', {
    body: requestBody.value,
    headers: headers.value,
    params: params.value,
    httpurl: httpurl.value,
    httpmethod: httpmethod.value,
    script: requestScript.value,
    selectedContentType: selectedContentType.value,
    gqlQueryBody: gqlQueryBody.value,
    gqlVariable: gqlVariable.value,
    urlEncodedParams : urlEncodedParams.value
  })
}

const saveRequest = () => {
  emit('onSaveRequest', {
    requestName: requestName.value,
    body: requestBody.value,
    headers: headers.value,
    params: params.value,
    url: httpurl.value,
    httpmethod: httpmethod.value,
    script: requestScript.value,
    selectedContentType: selectedContentType.value,
    gqlQueryBody: gqlQueryBody.value,
    gqlVariable: gqlVariable.value,
    urlEncodedParams : urlEncodedParams.value
  })
}

const addUrlEncodedParam = () => {
  urlEncodedParams.value.push({
    "name": "",
    "value": "",
    "enabled": true
  })
}

const deleteUrlEncodedParam = (index:number) => {
  urlEncodedParams.value.splice(index,1)
}

//Utility function
//

const crudateHeader = (headerName:string,headerValue:string) => {
  const lowercaseHeaderName = headerName.toLowerCase();
  const index = headers.value.findIndex((header:any) => header.name.toLowerCase() === lowercaseHeaderName);

  if (index !== -1) {
    headers.value[index].value = headerValue;
  } else {
    // If the header doesn't exist, you can add it to the array
    headers.value.push({ name: headerName, value: headerValue,enabled:true });
  }
}

watchEffect(() => {
  console.log("in req container", props.item)
  if (props.item == undefined) {
    return
  }
  httpurl.value = props.item.url;
  httpmethod.value = props.item.httpmethod;
  requestName.value = props.item.requestName;
  params.value = props.item.params;
  headers.value = props.item.headers;
  requestBody.value = ""
  selectedContentType.value = props.item.selectedContentType,
  gqlQueryBody.value = props.item.gqlQueryBody,
  gqlVariable.value = props.item.gqlVariable

  urlEncodedParams.value = props.item.urlEncodedParams

  if (urlEncodedParams.value == undefined){
    urlEncodedParams.value = []
  }

  if (props.item.body != undefined && props.item.body != '') {
    requestBody.value = JSON.stringify(JSON.parse(props.item.body), null, 4);
  }
  requestScript.value = ""
  if (props.item.script != undefined && props.item.script != '') {
    requestScript.value = props.item.script
  }

});
</script>

<template>
  <el-row class="request">
    <el-col>
      <el-row class="name-row">
        <el-col :span="2">
          <el-button title="save" class="save-button" @click="saveRequest" type="primary" plain :icon="SaveIcon">Save</el-button>
        </el-col>
        <el-col :span="22">
          <el-input v-model="requestName" class="w-50 m-2" placeholder="Name" />
        </el-col>
      </el-row>
      <el-row class="url-row">
        <el-col :span="2">
          <el-select v-model="httpmethod" class="m-2" placeholder="Method" size="default">
            <el-option v-for="item in httpmethods" :key="item.label" :label="item.label" :value="item.value" />
          </el-select>
        </el-col>
        <el-col :span="20" class="url-col">
          <el-input v-model="httpurl" class="w-50 m-2" placeholder="Url" />
        </el-col>
        <el-col :span="2" class="send-button-col">
          <el-button class="send-button" @click="sendRequest" type="primary" :disabled="sendloading">Send
            <el-icon>
              <ChevronsRightIcon></ChevronsRightIcon>
            </el-icon></el-button>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-tabs v-model="activeName" class="aws-tabs" @tab-click="handleTabClick">
            <el-tab-pane label="Params" name="params">
              <el-row class="actions-row">
                <el-button :icon="PlusIcon" @click="addParam">Add</el-button>
              </el-row>

              <el-row class="form-row" v-for="(param, paramIndex) in params">
                <el-col :span="11">
                  <div class="margin-right-10px">
                    <el-input v-model="param.name" placeholder="param name" />
                  </div>
                </el-col>
                <el-col :span="11">
                  <div>
                    <el-input v-model="param.value" placeholder="param value" />
                  </div>

                </el-col>
                <el-col :span="1" class="check-box-col">
                  <el-switch v-model="param.enabled" size="small" />
                </el-col>
                <el-col :span="1">
                  <el-button type="default" @click="deleteParam(paramIndex)" :icon="Trash2Icon" />
                </el-col>
              </el-row>
            </el-tab-pane>
            <el-tab-pane label="Headers" name="headers">
              <el-row class="actions-row">
                <el-button :icon="PlusIcon" @click="addHeader">Add</el-button>
              </el-row>
              <el-row class="form-row" v-for="(header, paramIndex) in headers">
                <el-col :span="11">
                  <div class="margin-right-10px">
                    <el-input v-model="header.name" placeholder="header name" />
                  </div>
                </el-col>
                <el-col :span="11">
                  <div>
                    <el-input v-model="header.value" placeholder="header value" />
                  </div>

                </el-col>
                <el-col :span="1" class="check-box-col">
                  <el-switch v-model="header.enabled" size="small" />
                </el-col>
                <el-col :span="1">
                  <el-button type="default" @click="deleteHeader(paramIndex)" :icon="Trash2Icon" />
                </el-col>
              </el-row>
            </el-tab-pane>
            <el-tab-pane label="Body" name="body">
              <el-row class="content-type-row">
                <el-col>
                  <el-radio-group v-model="selectedContentType" class="ml-4" @change="onChangeSelectedContentType">
                    <el-radio v-for="contentType in contentTypes" :label="contentType.value">{{ contentType.label
                    }}</el-radio>
                  </el-radio-group>
                </el-col>
              </el-row>
              <el-row v-if="selectedContentType == 'application/graphql'" class="form-row">
                <el-col :span="16">
                  <el-text>query</el-text>
                  <v-ace-editor v-model:value="gqlQueryBody" @update:value="onGqlQueryBodyChange" lang="graphql"
                    :options="{ useWorker: false, showGutter: false, highlightActiveLine: false, showPrintMargin: false }"
                    style="height: 300px" />
                </el-col>
                <el-col :span="8">
                  <el-text>variables</el-text>
                  <v-ace-editor v-model:value="gqlVariable" @update:value="onGqlVariableChange" lang="json"
                    :options="{ useWorker: false, showGutter: false, highlightActiveLine: false, showPrintMargin: false }"
                    style="height: 300px" />
                </el-col>
              </el-row>
              <el-row v-if="selectedContentType == 'application/x-www-form-urlencoded'">
                <el-col>
                  <el-row class="actions-row">
                    <el-button :icon="PlusIcon" @click="addUrlEncodedParam">Add</el-button>
                  </el-row>

                  <el-row class="form-row" v-for="(param, paramIndex) in urlEncodedParams">
                    <el-col :span="11">
                      <div class="margin-right-10px">
                        <el-input v-model="param.name" placeholder="param name" />
                      </div>
                    </el-col>
                    <el-col :span="11">
                      <div>
                        <el-input v-model="param.value" placeholder="param value" />
                      </div>

                    </el-col>
                    <el-col :span="1" class="check-box-col">
                      <el-switch v-model="param.enabled" size="small" />
                    </el-col>
                    <el-col :span="1">
                      <el-button type="default" @click="deleteUrlEncodedParam(paramIndex)" :icon="Trash2Icon" />
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
              <el-row v-else class="form-row">
                <el-col>
                  <v-ace-editor v-model:value="requestBody" @update:value="onRequestBodyChange" lang="json"
                    :options="{ useWorker: false, showGutter: false, highlightActiveLine: false, showPrintMargin: false }"
                    style="height: 300px" />
                </el-col>
              </el-row>
            </el-tab-pane>
            <el-tab-pane label="Script" name="script">
              <el-row class="form-row">
                <el-col>
                  <v-ace-editor v-model:value="requestScript" @update:value="onRequestScriptChange" lang="javascript"
                    :options="{ useWorker: false, showGutter: false, highlightActiveLine: false, showPrintMargin: false }"
                    style="height: 300px" />
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
.environment {
  text-align: end;
}

.margin-right-10px {
  margin-right: 10px;
}

.check-box-col {
  text-align: center;
}

.send-button {
  width: 100%;
}

.url-col {
  text-align: center;
  padding-left: 5px;
  padding-right: 5px;
}

.send-button-col {
  align-items: right;
  text-align: right;
}

.actions-row {
  margin-bottom: 10px;
}

.content-type-row {
  margin-bottom: 10px;
}

.url-row {
  margin-top: 10px;
}

.request {
  border: #EEE 1px solid;
  border-radius: 5px;
  padding: 10px;

  margin-right: 10px;
  height: 98%;
  overflow-y: scroll;
  text-align: left;
}
</style>
