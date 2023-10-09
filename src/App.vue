<script lang="ts">
import { ref, defineComponent } from 'vue';
import { SettingsIcon, FileIcon, MinusIcon, PlusIcon,XIcon } from '@vue-icons/feather';
import { useRouter, useRoute } from 'vue-router';
const { ipcRenderer } = require('electron');


export default defineComponent({
    props : {
    },
    setup(){
        const router = useRouter()
        router.push('/');
        const error_message = ref("")
        const message = ref("Message")
        const gotoAwsSettings = () => {
            router.push('/settings/aws'); // Replace '/about' with the path you want to navigate to      
        }

        const gotoFolder = () => {
            router.push('/home'); // Replace '/about' with the path you want to navigate to      
        }

        const showMessage=(msg:string) =>{
          console.log(msg)
          message.value = msg
        }

        const showErrorMessage=(msg:string) =>{
          error_message.value = msg
        }

        const  dblclickNavBar = () => {
          console.log("dblclickNavBar")
          ipcRenderer.send('dblclick-navbar');
        }

        const isWindows = () => {
          console.log(process.platform)
          return process.platform == "win32"
        }

        const minimizeApp = ()=>{
          console.log("minimizeApp")
          ipcRenderer.send('minimizeApp');
        }

        const closeApp = () => {
          ipcRenderer.send('closeApp');
        }
        

        return {
            showMessage : showMessage,
            showErrorMessage : showErrorMessage,
            error_message : error_message,
            message : message,
            dblclickNavBar: dblclickNavBar,
            gotoFolder : gotoFolder,
            gotoAwsSettings : gotoAwsSettings,
            SettingsIcon: SettingsIcon,
            FileIcon : FileIcon,
            MinusIcon : MinusIcon,
            PlusIcon : PlusIcon,
            XIcon : XIcon,
            isWindows:isWindows,
            minimizeApp : minimizeApp,
            closeApp : closeApp
        }
    }
})

</script>

<template>
  <div id="titlebar">
      <div id="drag-region">

        <div id="window-title">
          <span>Post Box</span>
        </div>
      </div>
      <div v-if="isWindows()" class="window-button-container">
            <el-button @click="minimizeApp" class="window-buttons" :icon="MinusIcon"/>
            <el-button @click="dblclickNavBar" class="window-buttons" :icon="PlusIcon"/>
            <el-button @click="closeApp" class="window-buttons" :icon="XIcon"/>
      </div>     
    </div>

  <el-row class="body-container">
    <el-col :span="24">
      <div  class="home-area">
        <router-view @showErrorMessage="showErrorMessage" @showMessage="showMessage"></router-view>
      </div>
    </el-col>
  </el-row>
  
</template>

<style>
.window-button-container{
  position:absolute;
  -webkit-app-region: no-drag;
  right:0px;
  top:0px;
  z-index: 100;
}
.menu-button-label {
  margin-bottom: 20px;
}
.body-container{
  padding: 1rem;
}
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo.electron:hover {
  filter: drop-shadow(0 0 2em #9FEAF9);
}


.left-menu-buttons{
  padding:20px!important;
  height: 65px;
  font-size: 1.5em;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

.window-buttons{
  margin-left:0px!important;
  background-color: #409eff;
  color: white;
  z-index: -10;
  border: none;
  padding: 8px;
}
</style>
