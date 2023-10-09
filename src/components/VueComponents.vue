<script lang="ts">
import { ref, defineComponent } from 'vue';
import { CheckIcon, EditIcon, SearchIcon, MessageCircleIcon, StarIcon, DeleteIcon, CalendarIcon } from '@vue-icons/feather';
import { useRouter, useRoute } from 'vue-router';
export default defineComponent({
    props : {
        input1 : String,
        input2 : String
    },
    setup(){
        const router = useRouter()
        const gotoInputs = () => {
            console.log("dsfsdf")
            router.push('/input'); // Replace '/about' with the path you want to navigate to      
        }

        return {
            EditIcon : EditIcon,
            SearchIcon : SearchIcon,
            CheckIcon: CheckIcon,
            MessageCircleIcon : MessageCircleIcon,
            StarIcon :StarIcon,
            DeleteIcon : DeleteIcon,
            input1 : ref(""),
            input2 : ref(""),
            gotoInputs : gotoInputs
        }
    }
})

</script>

<template>
  <el-row class="mb-4">
    <el-col :span="24">
      <el-button>Default</el-button>
      <el-button type="primary" @click="gotoInputs">Inputs</el-button>
      <el-button type="success">Success</el-button>
      <el-button type="info">Info</el-button>
      <el-button type="warning">Warning</el-button>
      <el-button type="danger">Danger</el-button>
  </el-col>
  </el-row>
  <el-row >
    <el-button type="primary" :icon="EditIcon" circle />
    <el-button :icon="SearchIcon" circle />
    <el-button type="primary" :icon="EditIcon" circle />
    <el-button type="success" :icon="CheckIcon" circle />
    <el-button type="info" :icon="MessageCircleIcon" circle />
    <el-button type="warning" :icon="StarIcon" circle />
    <el-button type="danger" :icon="DeleteIcon" circle />
  </el-row>
</template>
<style scoped>
.read-the-docs {
  color: #888;
}
</style>
