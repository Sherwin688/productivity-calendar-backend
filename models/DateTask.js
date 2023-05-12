const mongoose = require("mongoose")

const dateTaskSchema = new mongoose.Schema({
    date:{
        type:String,
        required:true
    },
    tasks:[
        {
            id:String,
            task:String,
            status:String
        }
    ]
})

module.exports = mongoose.model("DateTasks",dateTaskSchema)