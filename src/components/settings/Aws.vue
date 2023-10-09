<script setup lang="ts">
import { onMounted, ref, onBeforeMount, watchEffect } from "vue";
import { UserIcon, CheckIcon } from "@vue-icons/feather";
import { useRouter, useRoute } from "vue-router";
const fs = require("fs");
const os = require("os");
import Credentials from "../../services/aws";
import { session } from "electron";
const ini = require('multi-ini');

interface AWSProfileData{
  aws_access_key_id:string
  aws_secret_access_key: string
  session_token: string
  default_region: string
}

interface AwsProfile {
  label : string
  value : string
}
let aws_profile_data : any ;

defineProps<{ msg: string }>();
const emit = defineEmits(["showMessage"]);
const router = useRouter();
const route = useRoute();
const aws_profile = ref<string>("");
const aws_access_key_id = ref<string>("");
const aws_secret_access_key = ref<string>("");
const session_token = ref<string>("");
const default_region = ref<string>("us-east-1");
const selected_profile = ref<string>("");

const aws_profiles = ref<AwsProfile[]>([]);
const activeName = ref("profile");

const saveAwsSettings = () => {
  emit("showMessage", "AWS settings saved.");
  fs.writeFile(
    os.homedir() + "/.s3browser",
    JSON.stringify({
      selected_profile: selected_profile.value,
      aws_access_key_id: aws_access_key_id.value,
      aws_secret_access_key: aws_secret_access_key.value,
      session_token: session_token.value,
      default_region: default_region.value,
    }),
    function (err: any) {
      if (err) {
        return console.log(err);
      }
      console.log("The file was saved!");
    }
  );

  Credentials.setAccessKey(aws_access_key_id.value);
  Credentials.setSecretKey(aws_secret_access_key.value);
  Credentials.setSessionToken(session_token.value);
  Credentials.setDefaultRegion(default_region.value);
  process.env.AWS_PROFILE = aws_profile.value;
  process.env.aws_access_key_id = aws_access_key_id.value;
  process.env.aws_secret_access_key = aws_secret_access_key.value;
  process.env.default_region = default_region.value;

  console.log(route.path);
  if (route.path == "/") {
    router.push("/home");
  }
};

onBeforeMount(() => {

  fs.readFile(os.homedir() + "/.aws/credentials", "utf8", (err: any, data: any) => {
      if(err){
        console.log(err)
      }
      else{
        aws_profile_data = ini.read(os.homedir() + "/.aws/credentials")
        for (const profileName in aws_profile_data){
          aws_profiles.value.push({
            "value":profileName,
            "label":profileName,
            
          })
        }
      }
  });

  fs.readFile(os.homedir() + "/.s3browser", "utf8", (err: any, data: any) => {
    if (err) {
      console.error("Error reading the file:", err);
    } else {
      
      let creds = JSON.parse(data);

      if (creds.selected_profile != undefined){
        selected_profile.value = creds.selected_profile
      }

      Credentials.setAccessKey(creds.aws_access_key_id);
      Credentials.setSecretKey(creds.aws_secret_access_key);
      Credentials.setSessionToken(creds.session_token);
      Credentials.setDefaultRegion(creds.default_region);
      if (route.path == "/") {
        router.push("/home");
      }
    }
  });

  if (Credentials.getAccessKey() != undefined) {
    aws_access_key_id.value = Credentials.getAccessKey();
  }
  if (Credentials.getSecretKey() != undefined) {
    aws_secret_access_key.value = Credentials.getSecretKey();
  }
  if (Credentials.getSessionToken() != undefined) {
    session_token.value = Credentials.getSessionToken();
  }
});

const handleTabClick = () => {
  console.log("tab clicked", activeName.value);
};

const saveAwsProfileSettings = () => {
  console.log(selected_profile.value)
  let profileContent = aws_profile_data[selected_profile.value]
  aws_access_key_id.value = profileContent?.aws_access_key_id != undefined ? String(profileContent?.aws_access_key_id) : ""
  aws_secret_access_key.value = profileContent?.aws_secret_access_key != undefined ? String(profileContent?.aws_secret_access_key) : ""
  session_token.value = profileContent?.session_token != undefined ? String(profileContent?.session_token) : ""
  default_region.value = profileContent?.default_region == undefined ? "us-east-1" : profileContent?.default_region

  saveAwsSettings()
}

const count = ref(0);
</script>

<template>
  <!-- <el-row class="form-row">
    <span class="ml-3 w-35 text-gray-600 inline-flex items-center"
      >Enter the AWS Profile Name</span
    >
    <el-input
      v-model="aws_profile"
      class="w-50 m-2"
      placeholder="Enter AWS Profile to use"
      :suffix-icon="UserIcon"
    />
  </el-row> -->

  <el-tabs v-model="activeName" class="aws-tabs" @tab-click="handleTabClick">
    <el-tab-pane label="AWS profiles" name="profile">
      <el-row class="form-row">
        <div class="ml-3 w-35 text-gray-600 inline-flex items-center"
          >Select AWS Profile</div>
      </el-row>
      <el-row class="form-row">
        <el-select v-model="selected_profile" class="m-2" placeholder="Select" size="large">
          <el-option
            v-for="item in aws_profiles"
            :key="item.label"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-row>
      <el-row class="form-row">
        <el-button @click="saveAwsProfileSettings" type="success" :icon="CheckIcon"
          >Save</el-button
        >
      </el-row>
    </el-tab-pane>
    <el-tab-pane label="AWS Key" name="key">
      <el-row class="form-row">
        <span class="ml-3 w-35 text-gray-600 inline-flex items-center"
          >Enter the AWS Access Id</span
        >
        <el-input
          v-model="aws_access_key_id"
          class="w-50 m-2"
          placeholder="Access Key"
          :suffix-icon="UserIcon"
        />
      </el-row>
      <el-row class="form-row">
        <span class="ml-3 w-35 text-gray-600 inline-flex items-center"
          >Enter the AWS Seceret Id</span
        >
        <el-input
          v-model="aws_secret_access_key"
          class="w-50 m-2"
          placeholder="Secret Access Key"
          :suffix-icon="UserIcon"
        />
      </el-row>
      <el-row class="form-row">
        <span class="ml-3 w-35 text-gray-600 inline-flex items-center"
          >Enter the Session Token</span
        >
        <el-input
          v-model="session_token"
          class="w-50 m-2"
          placeholder="Session Token"
          :suffix-icon="UserIcon"
        />
      </el-row>
      <el-row class="form-row">
        <span class="ml-3 w-35 text-gray-600 inline-flex items-center"
          >Enter default region</span
        >
        <el-input
          v-model="default_region"
          class="w-50 m-2"
          placeholder="Default region"
          :suffix-icon="UserIcon"
        />
      </el-row>
      <el-row class="form-row">
        <el-button @click="saveAwsSettings" type="success" :icon="CheckIcon"
          >Save</el-button
        >
      </el-row>
    </el-tab-pane>
  </el-tabs>
</template>
<style scoped>
.read-the-docs {
  color: #888;
}
.form-row {
  margin-bottom: 10px;
}
</style>
