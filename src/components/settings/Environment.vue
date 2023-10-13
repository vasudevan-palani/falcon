<script setup lang="ts">

// Imports
//
import { reactive, ref, watchEffect, onMounted, onUpdated } from "vue";
import { SaveIcon, Trash2Icon, PlusIcon } from "@vue-icons/feather";
import { EnvironmentService } from '../../services/EnvironmentService';
import { NotificationService } from '../../services/NotificationService';

import { Environment } from '../../models/Environment';

//Properties
const props = defineProps<{ refresh: any }>();
const emit = defineEmits(["onSave"]);

// Variables
//
const environments = ref<Environment[]>([])
const activeName = ref("default")
const newEnv = ref<string>("")

//Global variables
//

//Event Handlers
//
const handleTabClick = () => {

}

// Click handlers
//
const addEnvironmentParam = (env: Environment) => {
    env.params.push({
        "name": "",
        "value": "",
        enabled: true
    })
}

const saveEnvironments = () => {
    console.log(environments.value)
    try {
        EnvironmentService.updateAll(environments.value);
        emit('onSave')
        NotificationService.showMessage("Environments Saved.");
    } catch (err) {
        NotificationService.showMessage("Unable to save." + err);
    }

}

const addEnvironment = () => {
    if (newEnv.value) {
        environments.value.push({
            "name": newEnv.value,
            "label": newEnv.value,
            "params": []
        })
    }
}

//Utility function
//

try {
    environments.value = EnvironmentService.getAll()
}
catch (err) {
    console.log(err)
    NotificationService.showMessage("Unable to load environments")
}

onUpdated(() => {
    console.log("onUpdated")
    try {
        environments.value = EnvironmentService.getAll()
    }
    catch (err) {
        console.log(err)
        NotificationService.showMessage("Unable to load environments")
    }
})


onMounted(() => {
    console.log("onMounted")
    try {
        environments.value = EnvironmentService.getAll()
    }
    catch (err) {
        console.log(err)
        NotificationService.showMessage("Unable to load environments")
    }
})

watchEffect(() => {
    console.log(props.refresh)
    try {
        environments.value = EnvironmentService.getAll()
    }
    catch (err) {
        console.log(err)
        NotificationService.showMessage("Unable to load environments")
    }


})
</script>

<template>
    <el-row>
        <el-col :span="7"></el-col>
        <el-col :span="5">
            <el-input v-model="newEnv" placeholder="Name"></el-input>
        </el-col>
        <el-col :span="5">
            <el-button type="primary" :icon="PlusIcon" @click="addEnvironment" :enabled="newEnv != undefined">New
                Environment</el-button>
        </el-col>
        <el-col :span="7"></el-col>
    </el-row>
    <el-row>
        <el-col :span="24">
            <el-tabs v-model="activeName" class="tabs" @tab-click="handleTabClick">
                <template v-for="environment in environments">
                    <el-tab-pane :label="environment.label" :name="environment.name">
                        <el-row class="actions-row">
                            <el-button :icon="PlusIcon" @click="addEnvironmentParam(environment)">Add</el-button>
                        </el-row>

                        <el-row class="form-row" v-for="param in environment.params">
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
                                <el-button type="default" :icon="Trash2Icon" />
                            </el-col>
                        </el-row>
                    </el-tab-pane>
                </template>
            </el-tabs>
        </el-col>
    </el-row>
    <el-row>
        <el-col :span="24" class="save-btn-col">
            <el-button type="success" @click="saveEnvironments" :icon="SaveIcon">Save</el-button>
        </el-col>
    </el-row>
</template>

<style scoped>
.margin-right-10px {
    margin-right: 10px;
}

.actions-row {
    margin-bottom: 10px;
}

.save-btn-col {
    margin-top: 40px;
    text-align: start;
}
</style>
