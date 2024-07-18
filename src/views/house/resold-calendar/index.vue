<script setup lang="ts">
import { format } from "date-fns";
import { defineComponent, onMounted, reactive, ref, onBeforeMount } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import bootstrapPlugin from "@fullcalendar/bootstrap";

import HouseAPI from "@/api/house";
import { ChartHouseDataVO } from "@/api/house/model";
import { log } from "console";

import "bootstrap/dist/css/bootstrap.css";
import "@fortawesome/fontawesome-free/css/all.css"; // needs additional webpack config!

defineOptions({
  name: "",
});

interface eventItem {
  id: String;
  title: String;
  start: String;
  end?: String;
  allDay?: boolean;
  // other properties...
}

const loading = ref(true); // 加载状态
const chartHousedataList = ref<ChartHouseDataVO>();
// const monthCalendar = ref() as Ref<InstanceType<typeof FullCalendar>>
const currentMonthData = ref(0);

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
      chartHousedataList.value.xaxis.forEach((val, idx) => {
        currentMonthData.value += chartHousedataList.value?.series[0].chatData[
          idx
        ] as number;
        let event: eventItem = {
          id: createEventId(val),
          title: String(
            chartHousedataList.value?.series[0].chatData[idx].toString()
          ),
          start: val,
        };
        // 检查该数据是否已经存在
        if (
          initialEventsData.findIndex((val) => {
            return val.id === event.id;
          }) === -1
        ) {
          initialEventsData.push(event);
        }
      });
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
  plugins: [
    dayGridPlugin,
    interactionPlugin, // needed for dateClick
    bootstrapPlugin,
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
    right: "myCustomButton",
  },
  buttonText: {
    today: "今日",
  },
  views: {
    dayGridMonth: {
      // name of view
      //titleFormat: { year: 'numeric', month: '2-digit', day: '2-digit' }
      // other view-specific options here
    },
  },
  initialDate: new Date(),
  themeSystem: "bootstrap",
  showNonCurrentDates: false,
  eventColor: "#52bb0c",
  height: "auto",
  // contentHeight: 350,
  // eventDisplay: 'none',
  firstDay: 1, // The day that each week begins. Sunday=0, Monday=1, Tuesday=2,
  fixedWeekCount: false,
  titleRangeSeparator: "-",
  initialView: "dayGridMonth",
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
          <div style="text-align: center">
            <b>{{ arg.timeText }}</b>
            <i>{{ arg.event.title }}</i>
          </div>
        </template>
      </FullCalendar>
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

.demo-app {
  display: flex;
  min-height: 100%;
  font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
  font-size: 14px;
}

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
