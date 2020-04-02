Page({
  data: {
    regionValue: '',
    timeValue: ''
  },
  onLoad: function() {},
  getRegionPickerValue(e) {
    this.setData({regionValue: e.detail})
  },
  getTimePickerValue(e) {
    this.setData({timeValue: e.detail})
  }
})
