// 单个任务项： Item类
class Item {
    // constructor
    constructor(taskCount, userInput, year, month, day) {
        this.count = taskCount;
        this.content = userInput;
        this.isCompleted = false;
        if(lessThanToday(year, month, day)) {
            this.isOutDDL = true;
        } else {
            this.isOutDDL = false;
        }
        this.markDate = new Date();
        this.ddlYear = year;
        this.ddlMonth = month;
        this.ddlDay = day;
    }
}