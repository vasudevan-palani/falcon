<script setup lang="ts">
import { onMounted, ref, watchEffect } from "vue";
import RequestContainer from './request/RequestContainer.vue';
import ResponseContainer from './response/ResponseContainer.vue';
import WorkspaceFolder from './WorkspaceFolder.vue';

import { FolderIcon, SettingsIcon, ExternalLinkIcon, DownloadIcon, RefreshCwIcon } from "@vue-icons/feather";
import fetch from 'node-fetch';
import { NameValueEnabled } from "./common/model";
import { ipcRenderer } from "electron";

import { truncateText, readFileContent } from '../services/utils'
import Environment from './settings/Environment.vue'

// @ts-ignore
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'

import { ProfileService } from '../services/ProfileService'
import { NotificationService } from '../services/NotificationService'
import { EnvironmentService } from '../services/EnvironmentService'
import ImportCollection from './settings/ImportCollection.vue'
import ExportCollection from './settings/ExportCollection.vue'
import { RequestService } from "../services/RequestService";
import { ImportService } from "../services/ImportService";
import { FalconService } from "../services/FalconService";
import { StorageService } from "../services/StorageService";

import { FalconProfile } from "../models/FalconProfile";
import { Environment as EnvironmentModel, EnvironmentParam } from "../models/Environment";

import { Request } from '../models/Request';


const mustache = require('mustache');
const vm = require('node:vm');

const fs = require('fs')
//Properties
const props = defineProps<{}>();
const emit = defineEmits([]);

// Variables
//
const item = ref<any>({})
const requestFilePath = ref("")
const workspace = ref("")
const environ = ref("default")
const environmentsFormVisible = ref(false)
const environments = ref<any>()
const importFormVisible = ref(false)
const exportFormVisible = ref(false)
const sendloading = ref(false)

//Global variables
//
let environmentVariables: any = []

//Event Handlers
//
ipcRenderer.on('selected-folder', function (event, path) {
  //do what you want with the path/file selected, for example:
  if (!StorageService.isDirectory(path[0])) {
    return
  }
  workspace.value = path[0];
  try {
    ProfileService.update(new FalconProfile(workspace.value))
    EnvironmentService.init()
    NotificationService.showMessage("Profile Saved.")
  } catch (err) {
    NotificationService.showMessage("UNable to save Profile.")
  }
});

const onresizeLineStartMove = () => {
  console.log("onresizeLineStartMove");
}
const onResizeLineMove = (e: any) => {
  console.log("onResizeLineMove :>> ", e);
}

const onresizeLineEndMove = () => {
  console.log("onresizeLineEndMove");
}


const onRequestSelected = (itemSelected: any) => {
  console.log("Home::requestSelected", itemSelected)
  try {
    let request: Request = RequestService.get(itemSelected?.id)
    requestFilePath.value = itemSelected?.id;
    item.value = request
  } catch (err) {
    NotificationService.showMessage(String(err))
  }

}

const onSaveRequest = (request: Request) => {
  try {
    RequestService.save(requestFilePath.value, request)
    NotificationService.showMessage("Request saved.")
  } catch (err) {
    NotificationService.showMessage("Failed to save request. " + err)
  }
}

const isRequestSelected = () => {
  let isRequestSelectionAvail = false;
  if (StorageService.isExists(requestFilePath.value)){
    isRequestSelectionAvail = true
  }
  return isRequestSelectionAvail
}

const envSelectChange = (item: any) => {
  console.log(item)
}

const onEnvChange = () => {
  environmentsFormVisible.value = false
  let env_val = environ.value

  try {
    let data = EnvironmentService.getAll()
    environmentVariables = data
    let envs = environmentVariables.map((env: EnvironmentModel) => {
      return {
        "value": env.name,
        "label": env.label
      }
    })
    console.log("environments", envs)
    environments.value = envs
    environ.value = env_val
  } catch (err) {
    NotificationService.showMessage("Unable to load env" + err)
  }

}

const exportCollection = () => {
  NotificationService.showMessage("Will be implemented in near future.")
}

const onImportComplete = () => {
  importFormVisible.value = false;
  refreshWorkspace();
}

const onExportComplete = () => {
  exportFormVisible.value = false;
}

function encodeFormData(data: any) {
  return data
    .map((item: any) => `${encodeURIComponent(item.name)}=${encodeURIComponent(item.value)}`)
    .join('&');
}


const onSendRequest = (requestTemplate: any) => {

  try {
    console.log(environ.value)
    let env: EnvironmentModel | undefined = EnvironmentService.get(environ.value)

    if (env == undefined) {
      NotificationService.showMessage("Unable to find the environment")
    }

    let envdata: EnvironmentParam[] | undefined = env?.params

    console.log("onSendRequest", requestTemplate, envdata)
    let envFormattedData: any = {}
    envdata?.map((envItem: any) => {
      if (envItem.enabled == true) {
        envFormattedData[envItem.name] = envItem.value
      }
    })
    const requestString = mustache.render(JSON.stringify(requestTemplate), envFormattedData);
    console.log(requestString)

    let request = JSON.parse(requestString)

    let headers: any = {}

    for (let headerIndex in request.headers) {
      let headerEnabled = request.headers[headerIndex].enabled;
      let headerName: string = request.headers[headerIndex].name;
      let headerValue = request.headers[headerIndex].value;
      if (headerEnabled == true) {
        headers[headerName] = headerValue
      }

    }
    let url = request.httpurl

    if (request.params && request.params.length > 0) {
      url = url + "?"
      for (let paramIndex in request.params) {
        let paramName = request.params[paramIndex].name
        let paramValue = request.params[paramIndex].value
        url = url + `${paramName}=${paramValue}&`
      }
    }
    console.log(url)
    //return;

    let options: any = {
      method: request.httpmethod,
      headers: headers
    }
    console.log(request.selectedContentType)
    if (request.selectedContentType == 'application/graphql') {
      request.body = JSON.stringify({
        "query": request.gqlQueryBody,
        "variables": request.gqlVariable
      })
      console.log(request.body)
    }

    if (request.selectedContentType == 'application/x-www-form-urlencoded') {
      request.body = encodeFormData(request.urlEncodedParams);
      console.log(request.body)
    }


    if (["POST", "PUT", "PATCH", "DELETE", "OPTIONS"].includes(request.httpmethod)) {
      options.body = request.body;
    }

    console.log(headers)
    let starttime = Date.now()
    sendloading.value = true
    console.log(options)
    fetch(url, options).then((response: any) => {
      console.log(response, response.status, response.statusText)



      response.text().then((data: any) => {
        let endtime = Date.now()
        let responseHeaders: NameValueEnabled[] = []
        response.headers.forEach((value: any, key: any) => {
          responseHeaders.push({
            "name": key,
            "value": value,
            "enabled": true
          })
        })

        item.value.response = {
          "status": response.status,
          "statusText": response.statusText,
          "headers": responseHeaders,
          "responseText": data,
          "latency": endtime - starttime
        }

        let context: any = {
          "JSON": JSON,
          "envdata": envdata,
          "request": item.value.request,
          "response": item.value.response,
          "falcon": new FalconService(environ.value, envdata)
        }

        vm.createContext(context);
        console.log(request.script)
        try {
          vm.runInContext(request.script, context);
        }
        catch (err) {
          console.log(err)
          NotificationService.showMessage(String(err))
        }


        console.log(context.envdata)
        environmentVariables = EnvironmentService.getAll()
        let envs = environmentVariables.map((env: EnvironmentModel) => {
          return {
            "value": env.name,
            "label": env.label
          }
        })
        environments.value = envs
        sendloading.value = false

      })

    }).catch((err: any) => {
      console.log(err)
      NotificationService.showMessage("Error: " + String(err))
      sendloading.value = false
    })
  } catch (err) {
    NotificationService.showMessage("Error: " + String(err))
  }


}

// Click handlers
//

const refreshWorkspace = () => {
  let workspace_val = workspace.value
  workspace.value = ""
  setTimeout(() => {
    workspace.value = workspace_val
  })

}

const importCollection = () => {
  ipcRenderer.send('open-import-dialog')
}

const chooseWorkspace = () => {
  ipcRenderer.send('open-file-dialog')
}

onMounted(() => {

  try {
    let data: FalconProfile = ProfileService.get()
    console.log(data)
    if (StorageService.isDirectory(data.workspace)) {
      workspace.value = data.workspace;
    }

    EnvironmentService.init()
  } catch (err) {
    NotificationService.showMessage("Unable to load env " + err)
  }

  onEnvChange()
})



</script>

<template>
  <div class="home-view">
    <el-row v-if="workspace == ''" class="empty-workspace-row">
      <el-col :span="24">
        <div class="empty-workspace-message"><el-text>Please select a workspace directory</el-text></div>
        <el-button @click="chooseWorkspace">Choose</el-button>
      </el-col>
    </el-row>
    <el-row class="settings-row" v-if="workspace != ''">
      <el-col :span="5">
        <el-button class="import-button" @click="importFormVisible = true" :icon="DownloadIcon">Import</el-button>
        <el-button class="export-button" @click="exportFormVisible = true" :icon="ExternalLinkIcon">Export</el-button>
      </el-col>

      <el-col :span="13" class="middle-menu">
        <el-text :title="workspace">Workspace : {{ truncateText(workspace, 100) }} &nbsp;&nbsp;</el-text>
        <!-- <el-button :icon="RefreshCwIcon" @click="refreshWorkspace">Refresh</el-button> -->
        <el-button :icon="FolderIcon" @click="chooseWorkspace">Change</el-button>
      </el-col>

      <el-col :span="6" class="environment-col">
        <el-link @click="environmentsFormVisible = true" type="primary">Environment:&nbsp;</el-link>
        <el-select class="settings-button" v-model="environ" placeholder="Select" @change="envSelectChange">
          <el-option v-for="item in environments" :key="item.label" :label="item.label" :value="item.value" />
        </el-select>
        <!--el-button class="settings-button" :icon="SettingsIcon">Settings</el-button-->
      </el-col>

    </el-row>
    <el-row v-if="workspace != ''" style="height:100%">
      <el-col :span="5">
        <WorkspaceFolder :workspace-dir="workspace" @on-request-clicked="onRequestSelected" :msg="true"></WorkspaceFolder>
      </el-col>
      <el-col :span="19" >
        <div ><el-text  v-if="!isRequestSelected()">Please select or create a request</el-text></div> 
        <splitpanes v-if="isRequestSelected()" horizontal>
          <pane>
            <RequestContainer :sendloading="sendloading" @on-save-request="onSaveRequest" @on-send-request="onSendRequest"
              :item="item">
            </RequestContainer>
          </pane>
          <pane>
            <ResponseContainer :sendloading="sendloading" :item="item"></ResponseContainer>
          </pane>
        </splitpanes>
      </el-col>
    </el-row>

    <el-dialog v-model="environmentsFormVisible" title="Environments" width="80%" draggable>
      <Environment :refresh="environments" @on-save="onEnvChange"></Environment>
    </el-dialog>

    <el-dialog v-model="importFormVisible" title="Import Collection" width="50%" draggable>
      <ImportCollection :directory="workspace" @on-import-complete="onImportComplete"></ImportCollection>
    </el-dialog>

    <el-dialog v-model="exportFormVisible" title="Export request" width="50%" draggable>
      <ExportCollection :directory="workspace" :request="item" @on-export-complete="onExportComplete"></ExportCollection>
    </el-dialog>

  </div>
</template>

<style scoped>
.home-view {
  
  border-radius: 5px;
  padding-bottom: 10px;
  height: 100%;
}

.middle-menu {
  text-align: left;
}

.empty-workspace-row {
  height: 100%;
  align-items: center;
}

.settings-button {
  margin-left: 10px;
  margin-right: 10px;
}

.empty-workspace-message {
  margin-bottom: 15px;
}

.environment-col {
  text-align: end;
}

.settings-row {
  text-align: left;
  margin-top: 7px;
  margin-left: 10px;
  margin-bottom: 10px;
}
.request-response-col{
  height: 100%;
  align-items: center;
}
.splitpanes__pane {
  border-top:solid #EEE 1px;
  border-bottom:solid #EEE 1px;
  height:3px;
}
</style>
