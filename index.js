const express = require("express")
const mongoose = require("mongoose")
const url = "mongodb://127.0.0.1/productivityCalendar"
const app = express()
const DateTasks = require("./models/DateTask")
const cors = require('cors');
const DateTask = require("./models/DateTask")
const DailyTasks = require("./models/DailyTasks")

app.use(cors({
    origin: 'http://localhost:3000'
}));
mongoose.connect(url)
const conn = mongoose.connection

conn.on("open",()=>{
    console.log("Database Connection Successful");
})


app.use(express.json())

app.get("/",async(req,res)=>{
    try {
        const datetasks = await DateTasks.find()
        res.send(datetasks)
    } catch (error) {
        console.log(error);
    }
})
app.post("/find",async(req,res)=>{
    const datetask = await DateTasks.findOne({"date":req.body.date})

    if(datetask==null){
        const dailytasks = await DailyTasks.findOne().sort({ field: 'asc', _id: -1 }).limit(1)
        console.log(dailytasks.tasks)
        const datetask = new DateTasks({
            date:req.body.date,
            tasks:[...dailytasks.tasks]
        })
        try {
            const data = await datetask.save()
            res.json({message:"success",data:data})
    } catch (error) {
        console.log("error");  
    }
    }
    else{
    try {     
        console.log(datetask)
        if(datetask!=null){

            res.json({"message":"success","data":datetask})
        }
        else{
            res.json({"message":"fail"})
        }
    } catch (error) {
        console.log(error);
       
    }
}
    }
)
app.delete("/delete",async(req,res)=>{
    try {
        console.log(req.body.id)
        const datetask = await DateTasks.findOne({"date":req.body.date})
        const newDateTasks = datetask.tasks.filter((task) => task.id !== req.body.id);
        await newDateTasks.save()
        // console.log(newDateTasks)
        res.send({message:"success",data:newDateTasks})

    

        // const newDateTasks = datetask.filter((task)=>task.id!==req.body.id)

    } catch (error) {
        console.log(error);
        res.send("error")
    }
})
app.post("/add",async(req,res)=>{
    // const date = "12/05/2023"
  
        const datetask = new DateTasks({
            date:req.body.date,
            tasks:req.body.tasks
        })
        try {
            const data = await datetask.save()
            res.json({message:"success",data:data})
    } catch (error) {
        console.log(error);  
    }
})

app.post("/addDailyTask",async(req,res)=>{
  
        const dailytask = new DailyTasks({
            tasks:req.body.tasks
        })
        try {
            const data = await dailytask.save()
            res.json({message:"success",data:data})
    } catch (error) {
        console.log(error);  
    }
})

app.post('/getLineChart', async (req, res) => {
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];
      var months2 = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];
      var monthNames = {
  "January": 1,
  "February": 2,
  "March": 3,
  "April": 4,
  "May": 5,
  "June": 6,
  "July": 7,
  "August": 8,
  "September": 9,
  "October": 10,
  "November": 11,
  "December": 12
};


    try {
      const results = await DateTasks.aggregate([
        {
          $project: {
            month: { $month: { $dateFromString: { dateString: { $concat: [{ $substr: ['$date', 6, 4] }, '-', { $substr: ['$date', 3, 2] }, '-', { $substr: ['$date', 0, 2] }] } } } },
            tasks: '$tasks.status'
          }
        },
        {
          $unwind: '$tasks'
        },
        {
          $group: {
            _id: { month: '$month', status: '$tasks' },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: '$_id.month',
            counts: {
              $push: {
                k: '$_id.status',
                v: '$count'
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            month: '$_id',
            counts: { $arrayToObject: '$counts' }
          }
        },
        {
          $sort: {
            month: 1
          }
        }
      ]
      
      
      ).exec().then(async(results)=>{
        var data = [];
        // console.log(results[0].month)
          
                
            results.map((res)=>{
                data.push({
                    "month":res.month,
                    "complete":res.counts.complete===undefined?0:res.counts.complete,
                    "incomplete":res.counts.incomplete,
                })
                months2.indexOf(months[res.month-1]);
                if ( months2.indexOf(months[res.month-1]) !== -1) {
                    months2.splice( months2.indexOf(months[res.month-1]), 1);
                  }
            })   

            months2.map((month)=>{
                data.push({
                    "month":monthNames[month],
                    "complete":0,
                    "incomplete":0
                })
            })
            data.sort((a, b) => a.month - b.month);
            var dataset =[];
            var incompleteTasks=[]
            
            data.map((val)=>{
                dataset.push(val.complete)
                incompleteTasks.push(val.incomplete)
            })
            console.log(req.params.date);
            const sum = dataset.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
            const incompleteTasksSum = incompleteTasks.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
            const datetask = await DateTasks.findOne({"date":req.body.date})
            var todayComplete = 0
            var todayInComplete = 0
            datetask.tasks.map((task)=>{
                if(task.status==="complete"){
                    todayComplete++
                }
                else{
                    todayInComplete++

                }
            })
            res.json({"dataset":dataset,"totalTasks":sum,"incompleteTasks":incompleteTasksSum,"totalTasks":incompleteTasksSum+sum,"pieChart":[todayComplete,todayInComplete]});
      });
  
   
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred' });
    }
  });
app.put("/update",async(req,res)=>{ 
    const datetask = await DateTask.findOne({"date":req.body.date})
        datetask.date=req.body.date
        datetask.tasks=req.body.tasks
        try {
            const data = await datetask.save()
            res.json({message:"success",data:data})
    } catch (error) {
        console.log("error");  
    }
})

app.get("/dashboarddata",async(req,res)=>{
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
})
app.listen(8000,()=>{
    console.log("Server Running")
})