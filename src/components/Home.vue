<script setup lang="ts">
import { ref, watchEffect } from "vue";
import RequestContainer from './request/RequestContainer.vue';
import ResponseContainer from './response/ResponseContainer.vue';
import WorkspaceFolder from './WorkspaceFolder.vue';
import fetch from 'node-fetch';
import { NameValueEnabled } from "./common/model";

//Properties
const props = defineProps<{  }>();
const emit = defineEmits([]);

// Variables
//
const item = ref<any>()

//Global variables
//

//Event Handlers
//

const onRequestSelected = (itemSelected:any) => {
  console.log("Home::requestSelected",itemSelected.data)
  item.value = itemSelected
}

const onSendRequest = (request:any)=>{
  let headers:any = {}

  for(let headerIndex in request.headers){
    let headerEnabled = request.headers[headerIndex].enabled;
    let headerName:string = request.headers[headerIndex].name;
    let headerValue = request.headers[headerIndex].value;
    if (headerEnabled == true){
      headers[headerName] = headerValue
    }
    
  }
  let url = request.httpurl

  if (request.params.length > 0){
    url = url + "?"
    for (let paramIndex in request.params){
      let paramName = request.params[paramIndex].name
      let paramValue = request.params[paramIndex].value
      url = url + `${paramName}=${paramValue}&`
    }
  }
  console.log(url)
  //return;

  let options:any = {
    method:request.httpmethod,
    headers:headers
  }

  if (request.httpmethod == "post"){
    options.body= request.body;
  }

  console.log(headers)
  fetch(url,options).then((response:any)=>{
    console.log(response,response.status,response.statusText)


    response.json().then((data:any)=>{

      let responseHeaders : NameValueEnabled[] = []
      response.headers.forEach((value:any, key:any)=>{
        responseHeaders.push({
          "name" : key,
          "value" : value,
          "enabled" : true
        })
      })

      item.value.response = {
        "status" : response.status,
        "statusText" : response.statusText,
        "headers" : responseHeaders,
        "responseJson" : data
      }

    })

  }).catch((err:any)=>{
    console.log(err)
  })

}

// Click handlers
//



//Utility function
//


</script>

<template>
  <div class="home-view">
    <el-row>
      <el-col :span="5">
        <WorkspaceFolder @on-request-clicked="onRequestSelected" :msg="true"></WorkspaceFolder>
      </el-col>
      <el-col :span="19">
        <RequestContainer @on-send-request="onSendRequest" :item="item"></RequestContainer>
        <ResponseContainer :item="item"></ResponseContainer>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.home-view {
  border: #EEE 1px solid;
  border-radius: 5px;
  padding-bottom: 10px;
}

</style>
