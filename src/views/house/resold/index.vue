<template>
  <div class="app-container">
    <!-- Echarts 图表 -->
    <el-row :gutter="10" class="mt-3">
      <el-col :xs="24" :sm="24" :lg="24" class="mb-2" :key="chartId">
        <component
          v-if="!loading"
          :is="chartComponent(chartType)"
          :id="chartId"
          :data="chartHousedataList"
          height="400px"
          width="100%"
          class="bg-[var(--el-bg-color-overlay)]"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import type { EpPropMergeType } from "element-plus/es/utils/vue/props/types";
defineOptions({
  name: "Resold",
  inheritAttrs: false,
});

import { useUserStore } from "@/store/modules/user";
import { useTransition, TransitionPresets } from "@vueuse/core";

import HouseAPI from "@/api/house";
import { ChartHouseDataVO } from "@/api/house/model";
import { getDate } from "date-fns";

const loading = ref(true); // 加载状态
const chartHousedataList = ref<ChartHouseDataVO>();
const userStore = useUserStore();
// 图表数据
const chartType = ref("BarChart");
const chartId = ref("ResoldNumber");
const chartComponent = (item: string) => {
  return defineAsyncComponent(() => import(`../components/${item}.vue`));
};

// 输出路由
console.log("路由参数：");
console.log(useRoute());

let saleType: number = useRoute().query.type?.toString() as unknown as number;
if (!saleType) {
  saleType = 2;
}

async function handleQuery(dataType: number, dataDate: Date) {
  loading.value = true;
  await HouseAPI.getHouseData(dataType, dataDate)
    .then((data) => {
      chartHousedataList.value = data as ChartHouseDataVO;
    })
    .finally(() => {
      loading.value = false;
    });
}

onMounted(() => {
  handleQuery(saleType, new Date());
});
</script>

<style lang="scss" scoped>
.app-container {
  position: relative;
  padding: 24px;

  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }

  .github-corner {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 1;
    border: 0;
  }

  .data-box {
    display: flex;
    justify-content: space-between;
    padding: 20px;
    font-weight: bold;
    color: var(--el-text-color-regular);
    background: var(--el-bg-color-overlay);
    border-color: var(--el-border-color);
    box-shadow: var(--el-box-shadow-dark);
  }

  .svg-icon {
    fill: currentcolor !important;
  }
}
</style>
