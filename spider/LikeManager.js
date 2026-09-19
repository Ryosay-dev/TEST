class LikeManager {
  info = {};
  eventList = {
    alert: [],
  };
  alertUnit = 500;
  constructor(alertUnit) {
    this.alertUnit = alertUnit;
  }

  addData (data) {
    const {
      likeCount,
      userId,
    } = data.data;
    let beforeCnt = 0;
    if (Object.keys(this.info).includes(userId)) {
      beforeCnt = this.info[userId];
    }
    const sumCnt = beforeCnt + likeCount;
    console.log(sumCnt);
    this.info[userId] = sumCnt;
    if ((Math.floor(beforeCnt / this.alertUnit)) !== (Math.floor(sumCnt / this.alertUnit))) {
      for (const callback of this.eventList.alert) {
        callback(data, Math.floor(sumCnt / this.alertUnit) * this.alertUnit);
      }
    }
  }
  addEventListener(event, callback) {
    this.eventList[event].push(callback);
  }
}

export default LikeManager;
