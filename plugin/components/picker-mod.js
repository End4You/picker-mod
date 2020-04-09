// component/picker-mod.js
import {getRegion} from '../static/json/region'

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
const nowTime = (() => {
  const d = new Date()
  const year = d.getFullYear()
  const month = formatNumber(d.getMonth() + 1)
  const day = formatNumber(d.getDate())
  const hour = '00', minutes = '00', seconds = '00'
  return year + '-' + month + '-' + day + ' ' + hour + ':' + minutes + ':' + seconds
})()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    mode: {
      type: String,
      value: 'region'
    },
    placeholder: {
      type: String,
      value: ''
    },
    placeholderStyle: {
      type: String,
      value: ''
    },
    placeholderClass: {
      type: String,
      value: ''
    },
    level: {
      type: Number,
      value: 6
    },
    region: {
      type: Array,
      value: ['广东省', '深圳市', '南山区', '粤海街道']
    },
    time: {
      type: String,
      value: nowTime
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    regionData: getRegion(),
    regionList: [],
    regionIndex: [],
    timeList: [],
    timeIndex: [],
    timeStrArr: [],
    firstInit: true
  },

  /**
   * 组件的方法列表
   */
  methods: {
    bindMultiPickerChange(e) {
      if (this.data.mode === 'region') {
        let regionDataIndex = e.detail.value, regionStr = []
        for (let i = 0; i < this.data.regionList.length; i++) regionStr.push(this.data.regionList[i][regionDataIndex[i]])
        this.triggerEvent('PickerValue', regionStr)
        console.log(regionStr)
      } else if (this.data.mode === 'time') {
        let timeDataIndex = e.detail.value, timeArr = [], timeStr = ''
        for (let i = 0; i < this.data.timeList.length; i++) timeArr.push(this.data.timeList[i][timeDataIndex[i]])
        for (let i = 0; i < timeArr.length; i++) timeStr += timeArr[i] + (timeArr.length - 1 === i ? '' : i === 0 || i === 1 ? '-' : i === 2 ? ' ' : i === 3 || i === 4 ? ':' : '')
        this.triggerEvent('PickerValue', timeStr)
        console.log(timeStr)
      } else {
        console.error(`不支持mode为 ${this.data.mode} 的模式`)
      }
    },
    bindMultiPickerColumnChange(e) {
      let column = e.detail.column, index = e.detail.value
      if (this.data.mode === 'region') {
        switch (column) {
          case 0 :
            let regionIndex = []
            for (let i = 0; i < this.data.level; i++) i === 0 ? regionIndex.push(index) : regionIndex.push(0)
            this.setData({regionIndex: regionIndex})
            this.data.level >= 2 ? this.getCityData() : null
            break
          case 1 :
            this.data.level === 4 ? this.setData({'regionIndex[1]': index, 'regionIndex[2]': 0, 'regionIndex[3]': 0}) :
              this.data.level === 3 ? this.setData({'regionIndex[1]': index, 'regionIndex[2]': 0}) :
                this.data.level === 2 ? this.setData({'regionIndex[1]': index}) : null
            this.data.level >= 3 ? this.getDistrictData() : null
            break
          case 2 :
            this.data.level === 4 ? this.setData({'regionIndex[2]': index, 'regionIndex[3]': 0}) :
              this.data.level === 3 ? this.setData({'regionIndex[2]': index}) : null
            this.data.level >= 4 ? this.getStreetData() : null
            break
          case 3 :
            this.setData({'regionIndex[3]': index})
            // this.getStreetData()
            break
        }
      } else if (this.data.mode === 'time') {
        switch (column) {
          case 0 :
            this.setData({'timeIndex[0]': index})
            this.data.level >= 3 && this.data.timeIndex[1] === 1 ? this.getDayIndex('02') : null
            break
          case 1 :
            this.setData({'timeIndex[1]': index})
            let monthIndex = this.data.timeIndex[1], monthNo = this.data.timeList[1][monthIndex]
            this.data.level >= 3 ? this.getDayIndex(monthNo) : null
            break
          case 2 :
            this.setData({'timeIndex[2]': index})
            break
          case 3 :
            this.setData({'timeIndex[3]': index})
            break
          case 4 :
            this.setData({'timeIndex[4]': index})
            break
          case 5 :
            this.setData({'timeIndex[5]': index})
            break
        }
      }
    },
    setPickerLevel() {
      if (this.data.mode === 'region') {
        let regionIndex = []
        for (let i = 0; i < this.data.level; i++) regionIndex.push(0)
        this.setData({regionIndex: regionIndex})
        this.data.level >= 1 ? this.getProvinceData() : console.error('级别不能低于1')
      } else if (this.data.mode === 'time') {
        this.data.time = this.data.time.length <= 4 ? nowTime : this.data.time
        let reCat = /(\d{1,4})/gm
        this.setData({timeStrArr: this.data.time.match(reCat)})
        let timeIndex = []
        for (let i = 0; i < this.data.level; i++) timeIndex.push(0)
        this.setData({timeIndex: timeIndex})
        this.data.level >= 1 ? this.getYearData() : console.error('级别不能低于1')
      } else {
        console.error(`不支持mode为 ${this.data.mode} 的模式`)
      }
    },
    getProvinceData() {
      let province = []
      for (let name in this.data.regionData) province.push(name)
      this.setData({'regionList[0]': province})
      if (this.data.region.length >= 1) {
        let defaultProvince = this.data.region[0], defaultProvinceIndex = province.indexOf(defaultProvince)
        defaultProvinceIndex > -1 ? this.setData({'regionIndex[0]': defaultProvinceIndex}) : this.setData({'regionIndex[0]': 0})
      }
      this.data.level >= 2 ? this.getCityData() : null
    },
    getCityData() {
      let provinceNo = this.data.regionIndex[0], provinceName = this.data.regionList[0][provinceNo], city = []
      for (let name in this.data.regionData[provinceName]) city.push(name)
      this.setData({'regionList[1]': city})
      if (this.data.region.length >= 2) {
        let defaultCity= this.data.region[1], defaultCityIndex = city.indexOf(defaultCity)
        defaultCityIndex > -1 ? this.setData({'regionIndex[1]': defaultCityIndex}) : this.setData({'regionIndex[1]': 0})
      }
      this.data.level >= 3 ? this.getDistrictData() : null
    },
    getDistrictData() {
      let provinceNo = this.data.regionIndex[0], cityNo = this.data.regionIndex[1],
        provinceName = this.data.regionList[0][provinceNo], cityName = this.data.regionList[1][cityNo], district = []
      for (let name in this.data.regionData[provinceName][cityName]) district.push(name)
      this.setData({'regionList[2]': district})
      if (this.data.region.length >= 3) {
        let defaultDistrict= this.data.region[2], defaultDistrictIndex = district.indexOf(defaultDistrict)
        defaultDistrictIndex > -1 ? this.setData({'regionIndex[2]': defaultDistrictIndex}) : this.setData({'regionIndex[2]': 0})
      }
      this.data.level >= 4 ? this.getStreetData() : null
    },
    getStreetData() {
      let provinceNo = this.data.regionIndex[0], cityNo = this.data.regionIndex[1], districtNo = this.data.regionIndex[2],
        provinceName = this.data.regionList[0][provinceNo], cityName = this.data.regionList[1][cityNo], districtName = this.data.regionList[2][districtNo],
        street = this.data.regionData[provinceName][cityName][districtName]
      this.setData({'regionList[3]': street})
      if (this.data.region.length >= 4) {
        let defaultStreet= this.data.region[3], defaultStreetIndex = street.indexOf(defaultStreet)
        defaultStreetIndex > -1 ? this.setData({'regionIndex[3]': defaultStreetIndex}) : this.setData({'regionIndex[3]': 0})
      }
    },
    getDayIndex(monthNo) {
      this.data.firstInit = false
      let yearIndex = this.data.timeIndex[0], yearNo = this.data.timeList[0][yearIndex]
      this.getTotalMonthDay(yearNo, monthNo)
      let totalDay = this.data.timeList[2].length, dayIndex = this.data.timeIndex[2], index = dayIndex + 1 > totalDay ? totalDay - 1 : dayIndex
      this.setData({'timeIndex[2]': index})
    },
    getYearData() {
      let year = [], start = 1900, end = 2100
      for (let i = 0; i <= end - start ; i++) year.push(start + i)
      this.setData({'timeList[0]': year})
      console.log(this.data.timeList)

      if (this.data.timeStrArr.length >= 1) {
        let defaultYear = parseInt(this.data.timeStrArr[0]), defaultYearIndex = year.indexOf(defaultYear)
        defaultYearIndex > -1 ? this.setData({'timeIndex[0]': defaultYearIndex}) : this.setData({'timeIndex[0]': 0})
      }
      this.data.level >= 2 ? this.getMonthData() : null
    },
    getMonthData() {
      let month = [], start = 1, end = 12
      for (let i = 0; i <= end - start ; i++) month.push(formatNumber(start + i))
      this.setData({'timeList[1]': month})
      if (this.data.timeStrArr.length >= 2) {
        let defaultMonth = this.data.timeStrArr[1], defaultMonthIndex = month.indexOf(defaultMonth)
        defaultMonthIndex > -1 ? this.setData({'timeIndex[1]': defaultMonthIndex}) : this.setData({'timeIndex[1]': 0})
      }
      let yearIndex = this.data.timeIndex[0], yearNo = this.data.timeList[0][yearIndex], monthIndex = this.data.timeIndex[1], monthNo = this.data.timeList[1][monthIndex]
      this.data.level >= 3 ? this.getTotalMonthDay(yearNo, monthNo) : null
    },
    getTotalMonthDay(year, month) {
      let flag = year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0)
      switch (month) {
        case '01':
        case '03':
        case '05':
        case '07':
        case '08':
        case '10':
        case '12':
          this.getDayData(1, 31)
          break
        case '04':
        case '06':
        case '09':
        case '11':
          this.getDayData(1, 30)
          break
        case '02':
          flag ? this.getDayData(1, 29) : this.getDayData(1, 28)
          break
      }
    },
    getDayData(start, end) {
      let day = []
      for (let i = 0; i <= end - start ; i++) day.push(formatNumber(start + i))
      this.setData({'timeList[2]': day})
      if (this.data.timeStrArr.length >= 3 && this.data.firstInit) {
        let defaultDay = this.data.timeStrArr[2], defaultDayIndex = day.indexOf(defaultDay)
        defaultDayIndex > -1 ? this.setData({'timeIndex[2]': defaultDayIndex}) : this.setData({'timeIndex[2]': 0})
      }
      this.data.level >= 4 ? this.getHourData() : null
    },
    getHourData() {
      let hour = [], start = 0, end = 23
      for (let i = 0; i <= end - start ; i++) hour.push(formatNumber(start + i))
      this.setData({'timeList[3]': hour})
      if (this.data.timeStrArr.length >= 4) {
        let defaultHour = this.data.timeStrArr[3], defaultHourIndex = hour.indexOf(defaultHour)
        defaultHourIndex > -1 ? this.setData({'timeIndex[3]': defaultHourIndex}) : this.setData({'timeIndex[3]': 0})
      }
      this.data.level >= 5 ? this.getMinutesData() : null
    },
    getMinutesData() {
      let minutes = [], start = 0, end = 59
      for (let i = 0; i <= end - start ; i++) minutes.push(formatNumber(start + i))
      this.setData({'timeList[4]': minutes})
      if (this.data.timeStrArr.length >= 5) {
        let defaultMinutes = this.data.timeStrArr[4], defaultMinutesIndex = minutes.indexOf(defaultMinutes)
        defaultMinutesIndex > -1 ? this.setData({'timeIndex[4]': defaultMinutesIndex}) : this.setData({'timeIndex[4]': 0})
      }
      this.data.level >= 6 ? this.getSecondsData() : null
    },
    getSecondsData() {
      let seconds = [], start = 0, end = 59
      for (let i = 0; i <= end - start ; i++) seconds.push(formatNumber(start + i))
      this.setData({'timeList[5]': seconds})
      if (this.data.timeStrArr.length >= 6) {
        let defaultSeconds = this.data.timeStrArr[5], defaultSecondsIndex = seconds.indexOf(defaultSeconds)
        defaultSecondsIndex > -1 ? this.setData({'timeIndex[5]': defaultSecondsIndex}) : this.setData({'timeIndex[5]': 0})
      }
    }
  },

  /**
   * 组件生命周期声明对象
   * created、attached、ready、moved、detached
   */
  lifetimes: {
    created() {

    },
    attached() {
      this.setPickerLevel()
    },
    ready() {

    },
    moved() {

    },
    detached() {

    }
  },
  /**
   * 组件所在页面的生命周期声明对象，目前仅支持页面的show和hide两个生命周期
   */
  pageLifetimes: {
    show() {

    },
    hide() {

    }
  }

})
