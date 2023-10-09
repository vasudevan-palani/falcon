<script setup lang="ts">
import { ref } from 'vue'
import { CheckIcon, EditIcon, SearchIcon, MessageCircleIcon, StarIcon, DeleteIcon, CalendarIcon } from '@vue-icons/feather';

defineProps<{ msg: string }>()

const count = ref(0)
const input1 = ref("")
const input2 = ref("")
</script>

<template>
  <el-row :gutter="20">
      <span class="ml-3 w-35 text-gray-600 inline-flex items-center"
        >Using attributes</span
      >
      <el-input
        v-model="input1"
        class="w-50 m-2"
        placeholder="Pick a date"
        :suffix-icon="CalendarIcon"
      />
      <el-input
        v-model="input2"
        class="w-50 m-2"
        placeholder="Type something"
        :prefix-icon="SearchIcon"
      />
    </el-row>
</template>
<style scoped>
.read-the-docs {
  color: #888;
}
.form-row{
  margin-bottom: 10px;
}
</style>
