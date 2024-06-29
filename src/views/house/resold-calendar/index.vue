<template>
  <div class="app-container">
    <!-- Echarts 图表 -->
    <el-row :gutter="10">
      <el-col :span="8" :xs="24" :sm="24" :lg="24" :key="chartId">
        <div class="elcol">
          <div>
            <VueMonthCalendar
              v-if="isMounted"
              @get-date="getDate"
              @change-year="changeYear"
              @change-month="changeMonth"
              @decrement-year="decrementYear"
              @increment-year="incrementYear"
              @next-month="nextMonth"
              @prev-month="prevMonth"
              @reset-month="resetMonth"
              @change-first-week-day="changeFirstWeekDay"
              :setEvents="setEvents"
            />
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { VueMonthCalendar } from "@howbizarre/vue-month-calendar";
import "@howbizarre/vue-month-calendar/dist/style.css";
import { ref, onMounted } from "vue";

const chartId = ref("resold-month-calendar");
const isMounted = ref(false);

const setEvents = [
  {
    date: 29,
    month: 6,
    year: 2024,
  },
];

function getDate(activeDate: { month: number; year: number; date: number }) {
  console.group("The returned data is:");
  console.log("Day: ", activeDate.date);
  console.log("Month: ", activeDate.month);
  console.log("Year: ", activeDate.year);
  console.groupEnd();
}

function changeYear(yearValue: number): void {
  console.log("Change Year to: ", yearValue);
}

function changeMonth(monthValue: number): void {
  console.log("Change Month to: ", monthValue);
}

function decrementYear(decYear: number): void {
  console.log("Decrement Year: ", decYear);
}

function incrementYear(incYear: number): void {
  console.log("Increment Year: ", incYear);
}

function nextMonth(nextMonth: number): void {
  console.log("Next Month: ", nextMonth);
}

function prevMonth(prevMonth: number): void {
  console.log("Previous Month: ", prevMonth);
}

function resetMonth(resetMonth: number): void {
  console.log("Reset Month: ", resetMonth);
}

function changeFirstWeekDay(firstWeekDay: number): void {
  console.log("Change First Week Day: ", firstWeekDay);
}

onMounted(() => (isMounted.value = true));
</script>

<style lang="scss" scope>
.item {
  display: flex;

  /* 水平居中对齐, flex-end右对齐 */
  flex-wrap: wrap;
  justify-content: center;
  width: 100px;
  height: 98px;
  border: 1px solid #ccc;
}

.dian {
  width: 30px;
  height: 30px;
  border: 1px solid #000;
  border-radius: 50px;
}

.elcol {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.flex-item {
  align-self: flex-end;
  width: 100px;
  height: 100px;
  margin: 10px;
  background-color: #ccc;
}
</style>
