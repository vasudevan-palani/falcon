<script setup lang="ts">
import { reactive, ref, watchEffect, onMounted } from "vue";
import { SearchIcon } from "@vue-icons/feather";
import ListItems from "./ListItems.vue";

import S3Client from "../services/s3client";

const emit = defineEmits(["bucketSelected"]);
const items = ref<any[]>([]);

const selectedItem = ref({});

const error = ref<string>("");
const filter = ref<string>("");

const selectItem = (item: any) => {};

const AWS = require("aws-sdk");

const itemSelected = (item: any) => {
  selectedItem.value = item;
  emit("bucketSelected", item.Name);
};

const nextToken = ref<string>("");

const getMoreBuckets = (nextToken1: string) => {
  new S3Client()
    .getBuckets(nextToken1)
    .then((result: any) => {
      console.log(result);
      nextToken.value = result.nextToken;
      items.value.push(...result.items);
      error.value = "";
    })
    .catch((err) => {
      error.value = err;
      console.log(err);
    });
};

onMounted(() => {
  getMoreBuckets(nextToken.value);
});
</script>

<template>
  <el-row>
    <el-text v-if="error != ''" type="danger">{{ error }}</el-text>
  </el-row>
  <el-row class="searchfilter">
    <el-input
      v-model="filter"
      class="w-50 m-2"
      size="large"
      placeholder="Search"
      :suffix-icon="SearchIcon"
    />
  </el-row>
  <ListItems
    :has-more="nextToken != ''"
    :items="items"
    @item-selected="itemSelected"
    :filter="filter"
  />
</template>

<style scoped>
.files {
  border: #999 1px solid;
  border-radius: 5px;
  padding: 10px;
  margin: 10px;
  max-height: 850px;
  overflow-y: scroll;
  text-align: left;
}
.searchfilter{
  margin: 10px;
}
</style>
