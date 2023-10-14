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

import { ProfileService } from '../services/ProfileService'
import { NotificationService } from '../services/NotificationService'
import { EnvironmentService } from '../services/EnvironmentService'
import ImportCollection from './settings/ImportCollection.vue'
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
const item = ref<any>()
const requestFilePath = ref("")
const workspace = ref("")
const environment = ref("default")
const environmentsFormVisible = ref(false)
const environments = ref<any>()
const importFormVisible = ref(false)
const sendloading = ref(false)

//Global variables
//
let environmentVariables: any = []

//Event Handlers
//
ipcRenderer.on('selected-folder', function (event, path) {
  //do what you want with the path/file selected, for example:
  if (!StorageService.isDirectory(path[0])){
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

const onEnvChange = () => {
  environmentsFormVisible.value = false

  try {
    let data = EnvironmentService.getAll()
    environmentVariables = data
    let envs = environmentVariables.map((env: EnvironmentModel) => {
      return {
        "value": env.name,
        "label": env.label
      }
    })
    environments.value = envs
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


const onSendRequest = (requestTemplate: any) => {

  let env: EnvironmentModel | undefined = EnvironmentService.get(environment.value)

  if (env == undefined) {
    NotificationService.showMessage("Unable to find the environment")
  }

  let envdata: EnvironmentParam[] | undefined = env?.params

  console.log(requestTemplate, envdata)
  const requestString = mustache.render(JSON.stringify(requestTemplate), envdata);
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

  if (request.params.length > 0) {
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

  if (["POST", "PUT", "PATCH", "DELETE", "OPTIONS"].includes(request.httpmethod)) {
    options.body = request.body;
  }

  console.log(headers)
  let starttime = Date.now()
  sendloading.value = true
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
        "falcon": new FalconService(environment.value, envdata)
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
      environments.value = EnvironmentService.getAll()
      sendloading.value = false

    })

  }).catch((err: any) => {
    console.log(err)
    sendloading.value = false
  })

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
    workspace.value = data.workspace;
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
        <el-button class="export-button" @click="exportCollection" :icon="ExternalLinkIcon">Export</el-button>
      </el-col>

      <el-col :span="13" class="middle-menu">
        <el-text :title="workspace">Workspace : {{ truncateText(workspace, 100) }} &nbsp;&nbsp;</el-text>
        <el-button :icon="RefreshCwIcon" @click="refreshWorkspace">Refresh</el-button>
        <el-button :icon="FolderIcon" @click="chooseWorkspace">Change</el-button>
      </el-col>

      <el-col :span="6" class="environment-col">
        <el-link @click="environmentsFormVisible = true" type="primary">Environment:&nbsp;</el-link>
        <el-select class="settings-button" v-model="environment" placeholder="Select" size="default">
          <el-option v-for="item in environments" :key="item.label" :label="item.label" :value="item.value" />
        </el-select>
        <!--el-button class="settings-button" :icon="SettingsIcon">Settings</el-button-->
      </el-col>

    </el-row>
    <el-row v-if="workspace != ''">
      <el-col :span="5">
        <WorkspaceFolder :workspace-dir="workspace" @on-request-clicked="onRequestSelected" :msg="true"></WorkspaceFolder>
      </el-col>
      <el-col :span="19">
        <RequestContainer :sendloading="sendloading" @on-save-request="onSaveRequest" @on-send-request="onSendRequest" :item="item">
        </RequestContainer>
        <ResponseContainer :sendloading="sendloading" :item="item"></ResponseContainer>
      </el-col>
    </el-row>

    <el-dialog v-model="environmentsFormVisible" title="Environments" width="80%" draggable>
      <Environment :refresh="environments" @on-save="onEnvChange"></Environment>
    </el-dialog>

    <el-dialog v-model="importFormVisible" title="Import Collection" width="50%" draggable>
      <ImportCollection :directory="workspace" @on-import-complete="onImportComplete"></ImportCollection>
    </el-dialog>

  </div>
</template>

<style scoped>
.home-view {
  border: #EEE 1px solid;
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
}
</style>
