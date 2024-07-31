<script setup lang="ts">
import { format, addDays, compareAsc } from "date-fns";
import { defineComponent, onMounted, reactive, ref, onBeforeMount } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import bootstrapPlugin from "@fullcalendar/bootstrap";
import listPlugin from "@fullcalendar/list";

import HouseAPI from "@/api/house";
import { ChartHouseDataVO } from "@/api/house/model";

// install bootstrap@4 @fortawesome/fontawesome-free
// import "bootstrap/dist/css/bootstrap.css";
// import "bootstrap-icons/font/bootstrap-icons.css"; // needs additional webpack config!
// import "@fortawesome/fontawesome-free/css/all.css"; // needs additional webpack config!
import { aN } from "@fullcalendar/core/internal-common";

defineOptions({
  name: "ResoldCalendar",
  inheritAttrs: false,
});

interface eventItem {
  id: String;
  groupId?: String;
  title: String;
  start: String;
  end?: String;
  allDay?: boolean;
  textColor?: String;
  borderColor?: String;
  backgroundColor?: String;
  classNames?: Array<String>;
  display?: String;
  extendedProps?: {};
  // other properties...
}

interface iconDisplay {
  type: string;
  color: string;
  display: boolean;
}

const loading = ref(true); // 加载状态
const chartHousedataList = ref<ChartHouseDataVO>();
// const monthCalendar = ref() as Ref<InstanceType<typeof FullCalendar>>
const currentMonthData = ref(0);
const currentMonthNewData = ref(0);
const createEventId = (date: any): String => {
  return format(date, "yyyy-MM-dd");
  // return String(eventGuid++)
};
// 默认初始化 Events
const initialEventsData: eventItem[] = reactive<eventItem[]>([]);

// 日历数据有变化时触发（prev/next），重新获取当月数据
function handleDateSet(info: any) {
  if (
    calendarOptions.initialDate.getMonth() !==
    info.view.calendar.currentData.currentDate.getMonth()
  ) {
    initialEventsFromRemote(info.view.calendar.currentData.currentDate);
  }
}

function getLastDayOfMonth(year: number, month: number): Date {
  return new Date(year, month + 1, 0);
}

const handleDateClick = (info: any) => {
  // alert('Clicked on: ' + info.dateStr);
  // alert('Coordinates: ' + info.jsEvent.pageX + ',' + info.jsEvent.pageY);
  // alert('Current view: ' + info.view.type);
  // change the day's background color just for fun
  // info.dayEl.style.backgroundColor = 'red';
  let calendarApi = info.view.calendar;
  // console.log(info);
  // console.log(calendarApi);
  //calendarApi.gotoDate(info.dateStr);
  // 当选择的日期不在当月，切换到选择日期的月份
  let selectMonth = info.date.getMonth();
  let currentMonty = calendarApi.currentData.currentDate.getMonth();
  let currentEvents = calendarApi.getEvents(); // 获取当前所有events

  if (selectMonth !== currentMonty) {
    // 加载选择日期月份数据
    initialEventsFromRemote(info.date);
    //calendarApi.next();
    //console.log("next");
    // selectMonth > currentMonty ? calendarApi.next() : calendarApi.prev();
    //calendarApi.changeView('dayGridMonth', info.date);
    // 重新添加数据到calendar
    // initialEventsData.forEach(
    //   (val) => {
    //     // console.log("val => ", val)
    //     if (!calendarApi.getEventById(val.start)) {
    //       calendarApi.addEvent(val)
    //     }
    //   }
    // )
  }
};

async function initialEventsFromRemote(date: Date) {
  // 模拟从远程获取当月数据
  loading.value = true;
  await HouseAPI.getHouseData(8, date)
    .then((data) => {
      chartHousedataList.value = data as ChartHouseDataVO;
      //initialEventsData.length = 0
      currentMonthData.value = 0;
      currentMonthNewData.value = 0;
      let currentLastDay: Date | null = null;
      chartHousedataList.value.xaxis.forEach((val, idx) => {
        currentLastDay = new Date(val);
        // 当日数据
        let currentDayData = chartHousedataList.value?.series[0].chatData[
          idx
        ] as number;
        // 前一天数据
        let lastDayData = chartHousedataList.value?.series[1].chatData[
          idx
        ] as number;
        // 当日数据为0则不显示
        if (currentDayData != 0) {
          // 当月二手总销量
          currentMonthData.value += currentDayData;
          // 当月新房总销量
          currentMonthNewData.value += chartHousedataList.value?.series[1]
            .chatData[idx] as number;
          // 当月二手房销量明细
          let event: eventItem = {
            id: createEventId(val),
            title: String(
              chartHousedataList.value?.series[0].chatData[idx].toString()
            ),
            start: val, //.toString().replace(/T.*$/, '') + ' 00:00:00',
            // extendedProps: icon,
            textColor: "black",
            //allDay: false,
            //backgroundColor: "red",
            // other properties...
          };
          //console.log(event);
          // 检查该数据是否已经存在
          if (
            initialEventsData.findIndex((val) => {
              return val.id === event.id;
            }) === -1
          ) {
            initialEventsData.push(event);
          }
          // 当月新房销量明细
          let icon: iconDisplay = {
            type: "Bottom",
            color: "icon-green",
            display: true,
          };
          if (currentDayData >= lastDayData) {
            icon.type = "Top";
            icon.color = "icon-red";
          }
          let newHouseEvent: eventItem = {
            id: createEventId(val) + "new",
            title: String(Math.abs(currentDayData - lastDayData)),
            start: val,
            textColor: "#ff666688",
            borderColor: "#ffffff00",
            backgroundColor: "#ffffff00",
            extendedProps: icon,
            // borderColor: "#ff666600",
            // backgroundColor: "#ff666688",
            //backgroundColor: "#ffffff",
            //display: "none",
          };
          // 检查该数据是否已经存在
          if (
            initialEventsData.findIndex((val) => {
              return val.id === newHouseEvent.id;
            }) === -1
          ) {
            initialEventsData.push(newHouseEvent);
          }
        }
      });

      // 当月二手房总计
      if (currentMonthData.value == -1) {
        let lastDayofMonth = getLastDayOfMonth(
          date.getFullYear(),
          date.getMonth()
        );
        // 当月有数据的最后一天+1
        if (
          currentLastDay &&
          compareAsc(addDays(currentLastDay, 1), lastDayofMonth) == -1
        ) {
          lastDayofMonth = addDays(currentLastDay, 1);
        }
        let monthTotalNumberEvent: eventItem = {
          id: createEventId(lastDayofMonth) + "total",
          title: "月总：" + currentMonthData.value.toString(),
          start: createEventId(lastDayofMonth),
          borderColor: "#00aa6600",
          //classNames: ['total-data'],
          // other properties...
          backgroundColor: "#00aa66",
          // other properties...
        };
        // 检查该数据是否已经存在
        if (
          initialEventsData.findIndex((val) => {
            return val.id === monthTotalNumberEvent.id;
          }) === -1
        ) {
          initialEventsData.push(monthTotalNumberEvent);
        }
      }
      // 当月新房总计
      if (currentMonthNewData.value == -1) {
        let lastDayofMonth = getLastDayOfMonth(
          date.getFullYear(),
          date.getMonth()
        );
        // 当月有数据的最后一天+1
        if (
          currentLastDay &&
          compareAsc(addDays(currentLastDay, 1), lastDayofMonth) == -1
        ) {
          lastDayofMonth = addDays(currentLastDay, 1);
        }
        let monthTotalNumberEvent: eventItem = {
          id: createEventId(lastDayofMonth) + "newTotal",
          title:
            "月总：" +
            currentMonthNewData.value
              .toString()
              .padStart(5, String.fromCharCode(32)),
          start: createEventId(lastDayofMonth),
          borderColor: "#ff666600",
          backgroundColor: "#ff6666",
          //classNames: ['total-data'],
          // other properties...
        };
        // 检查该数据是否已经存在
        if (
          initialEventsData.findIndex((val) => {
            return val.id === monthTotalNumberEvent.id;
          }) === -1
        ) {
          initialEventsData.push(monthTotalNumberEvent);
        }
      }

      calendarOptions.initialEvents = initialEventsData;
      calendarOptions.initialDate = date;
      calendarOptions.customButtons.myCustomButton.text =
        "当月总成交：" + String(currentMonthData.value) + " 套";
    })
    .finally(() => {
      loading.value = false;
    });
}

const handleViewDidMount = (info: any) => {
  // console.log(monthCalendar.value?.calendar)
  // calendarApi.on("render", function (i: any) {
  //   console.log("handleNext")
  //   console.log(i)
  // })
  // console.log("viewDidMount => info: ", calendarApi)
};
const handleViewWillUnmount = (info: any) => {
  // console.log("viewWillUnmount => info: ", info)
};

const calendarOptions: any = reactive({
  locale: "zh-cn",
  timeZone: "Asia/Shanghai",
  plugins: [
    dayGridPlugin,
    interactionPlugin, // needed for dateClick
    bootstrapPlugin,
    listPlugin,
  ],
  customButtons: {
    myCustomButton: {
      text: "",
      class: "",
    },
  },
  headerToolbar: {
    left: "title",
    center: "",
    right: "today prev next",
  },
  footerToolbar: {
    //right: "myCustomButton",
  },
  buttonText: {
    today: "当月",
  },
  views: {
    dayGridMonth: {
      // name of view
      //titleFormat: { year: 'numeric', month: '2-digit', day: '2-digit' }
      // other view-specific options here
    },
    timeGridFourDay: {
      type: "timeGrid",
      duration: { days: 4 },
      buttonText: "4 day",
    },
  },
  //initialView: "listMonth",
  initialView: "dayGridMonth",
  initialDate: new Date(),
  //themeSystem: "bootstrap4",
  showNonCurrentDates: false,
  eventTextColor: "#00aa66",
  eventBorderColor: "#00000000",
  eventColor: "#00000000",
  //eventBorderColor: "#00000000",
  //eventColor: "#00aa6699",
  eventOrder: "start",
  height: "auto",
  // contentHeight: 350,
  // eventDisplay: 'none',
  firstDay: 1, // The day that each week begins. Sunday=0, Monday=1, Tuesday=2,
  fixedWeekCount: false,
  titleRangeSeparator: "-",
  initialEvents: initialEventsData, // alternatively, use the `events` setting to fetch from a feed
  editable: false,
  selectable: false,
  selectMirror: true,
  dayMaxEvents: true,
  weekends: true,
  dateClick: handleDateClick,
  viewDidMount: handleViewDidMount,
  viewWillUnmount: handleViewWillUnmount,
  datesSet: handleDateSet,
  //select: handleDateSelect,
  // eventClick: this.handleEventClick,
  // eventsSet: this.handleEvents
  /* you can update a remote database when these fire:
    eventAdd:
    eventChange:
    eventRemove:
    */
});

onBeforeMount(() => {
  // 异步读取当前显示日历对应的数据
  initialEventsFromRemote(new Date());
  // $(".fc-center").append('<input type="text" id="datepicker"></input>');
  // let event: eventItem = {
  //   id: createEventId("2024-07-12"),
  //   title: "test",
  //   start: "2024-07-12"
  // }
  // initialEventsData.push(event);
  console.log("onBeforeMount");
  //initialEventsData0.value = initialEventsData;
});

onMounted(() => {
  console.log(currentMonthData);
});
</script>

<template>
  <div class="demo-app">
    <div class="demo-app-main">
      <FullCalendar
        v-if="!loading"
        class="demo-app-calendar"
        :options="calendarOptions"
      >
        <template #eventContent="arg">
          <div style="font-weight: 900; text-align: center">
            <!-- <b>{{ arg.timeText }}</b> -->
            <i
              v-if="arg.event.extendedProps.display"
              :class="arg.event.extendedProps.color"
            >
              <el-icon>
                <component :is="arg.event.extendedProps.type" />
                <!-- <Bottom /> -->
              </el-icon>
              {{ arg.event.title }}
            </i>
            <i v-else>{{ arg.event.title }}</i>
          </div>
        </template>
      </FullCalendar>
      <!-- <div class="fc-dayGridMonth-view fc-view fc-daygrid">
        <div class="fc-daygrid-day-frame fc-scrollgrid-sync-inner">
          sss
        </div>
      </div> -->
    </div>
  </div>
</template>

<style scoped>
:root {
  --fc-daygrid-event-dot-width: 80px;
  --fc-scrollgrid-section-stick: "";
}

/* .fc .fc-toolbar.fc-header-toolbar {
  margin-bottom: 1.5em;
  position: sticky;
  top: 0;
  background: #ffffff;
  z-index: 100;
}

.fc .fc-scrollgrid-section-header.fc-scrollgrid-section-sticky>* {
  top: 34px;
} */

h2 {
  margin: 0;
  font-size: 16px;
}

ul {
  padding: 0 0 0 1.5em;
  margin: 0;
}

li {
  padding: 0;
  margin: 1.5em 0;
}

b {
  /* used for event dates/times */
  margin-right: 3px;
}

.icon-red {
  font-weight: 100;
  color: rgb(255 0 0 / 50%);
}

.icon-green {
  font-weight: 100;
  color: rgb(0 128 0 / 60%);
}

.demo-app {
  display: flex;
  min-height: 100%;
  font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
  font-size: 14px;
}

/* .fc-event-main {
  text-align: center;
  color: red;
}

.total-data {
  text-align: center;
  color: red;
}

a.fc-h-event a.fc-event-main {
  color: blue;
  text-align: center;
} */

.demo-app-sidebar {
  width: 300px;
  line-height: 1.5;
  background: #eaf9ff;
  border-right: 1px solid #d3e2e8;
}

.demo-app-sidebar-section {
  padding: 2em;
}

.demo-app-main {
  flex-grow: 1;
  padding: 3em;
}

.fc {
  /* the calendar root */
  max-width: 1100px;
  margin: 0 auto;
}
</style>
