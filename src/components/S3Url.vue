<script setup lang="ts">
import { reactive, ref, watchEffect } from "vue";
const emit = defineEmits(["prefixClicked","bucketClicked","onResetAll"]);
const props = defineProps({
    s3bucket :{
        type : String
    },
    prefixes : {
        type: Array
    }
});

const full_url = ref("s3://");

const resetAll = () => {
    emit('onResetAll');
}

const prefixClicked = (prefixIndex:number,prefix:string)=>{
    emit('prefixClicked',prefixIndex,prefix)
}

const bucketClicked = (s3bucket:string)=>{
    emit('bucketClicked',s3bucket)
}

watchEffect(async () => {
    console.log(props.s3bucket)
    full_url.value = "s3://"

    if (props.s3bucket != undefined){
        full_url.value = "s3://" + props.s3bucket
    }

    if(props.prefixes != undefined && props.prefixes.length > 0){
        full_url.value = full_url.value + "/" + props.prefixes.join("/")
    }
})

</script>

<template>
    <div class="filepath">
        <el-text>File : </el-text>
        <el-link type="primary" @click="resetAll()">s3://</el-link>
        <el-link type="primary" v-if="s3bucket" @click="bucketClicked(s3bucket)">{{s3bucket}}/</el-link>
        <span v-if="prefixes" v-for="(prefix,prefixIndex) in prefixes"><el-link type="primary" @click="prefixClicked(prefixIndex,String(prefix))">{{prefix}}/</el-link></span>
    </div>
</template>

<style scoped>

.filepath {
  border: #999 1px solid;
  border-radius: 5px;
  padding: 10px;
  margin: 10px;
  width: 100%;
}

</style>
