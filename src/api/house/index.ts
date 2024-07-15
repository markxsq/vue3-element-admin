import request from "@/utils/request";
import { ChartHouseDataVO, ChartHouseDataList } from "./model";
import { format } from "date-fns";

class HouseAPI {
  /**
   * 获取房源数据
   *
   * @param dataType
   */
  static getHouseData(dataType: number, dataDate: Date) {
    return request<any, ChartHouseDataVO>({
      url: "/house/" + format(dataDate, "yyyy-MM-dd") + "/" + dataType,
      method: "get",
    });
  }
}

export default HouseAPI;
