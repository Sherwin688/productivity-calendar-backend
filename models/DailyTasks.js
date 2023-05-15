const mongoose = require("mongoose")

const dailyTasksSchema = new mongoose.Schema({
    tasks:[
        {
            id:String,
            task:String,
            status:String,
            taskType:String
        }
    ],
})

module.exports = mongoose.model("DailyTasks",dailyTasksSchema)