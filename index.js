require('dotenv').config()

const express = require("express")
const mongoose = require("mongoose")
const app = express()
const DateTasks = require("./models/DateTask")
const cors = require('cors');
const DailyTasks = require("./models/DailyTasks")
const PORT = process.env.PORT || 8000
const mongodb_url = process.env.MongoDB_URL

app.use(cors({
    origin: 'https://main--fluffy-malabi-dcabee.netlify.app'
}));
mongoose.connect(mongodb_url)
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
      
    }
})
app.post("/find", async (req, res) => {
  
 const currentDate = new Date(req.body.date).setHours(0,0,0,0)
 

  try {

    const datetask = await DateTasks.findOne({ date: currentDate });

    if (datetask) {
      res.json({ message: "success", data: datetask });
    } else 
    {
      const dailytasks = await DailyTasks.findOne().sort({ field: 'asc', _id: -1 }).limit(1);
      if (dailytasks) {
        const datetask = new DateTasks({
          date: currentDate,
          tasks: [...dailytasks.tasks]
        });
        const savedDateTask = await datetask.save();
        res.json({ message: "success", data: savedDateTask });
      } else {
        const datetask = new DateTasks({
          date: currentDate,
          tasks: []
        });

        const savedDateTask = await datetask.save();
        res.json({ message: "success", data: savedDateTask });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "error" });
  }
});
app.delete("/delete",async(req,res)=>{
    try {
        const datetask = await DateTasks.findOne({"date":req.body.date})
        const newDateTasks = datetask.tasks.filter((task) => task.id !== req.body.id);
        await newDateTasks.save()
        res.send({message:"success",data:newDateTasks})

    

    } catch (error) {
        res.send("error")
    }
})
app.post("/add",async(req,res)=>{
    const frontendDate = new Date(req.body.date);
const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
const currentDate = frontendDate.toLocaleDateString('en-US', options);
        const datetask = new DateTasks({
            date:currentDate,
            tasks:req.body.tasks
        })
        try {
            const data = await datetask.save()
            res.json({message:"success",data:data})
    } catch (error) {
        res.send("error")
    }
})

app.post("/addDailyTask",async(req,res)=>{
  const currentDate = new Date().setHours(0,0,0,0)
  
  const dailytasks = await DailyTasks.findOneAndUpdate({})

  if(dailytasks===null){
    const dailytask = new DailyTasks({
      date:currentDate,
      tasks:{...req.body.task,id:1}
  })
  await dailytask.save()
  }
  else{
    const newTask = req.body.task;
    var newId = 0;
    if(dailytasks.tasks.length>0){

      newId = parseInt(dailytasks.tasks[dailytasks.tasks.length-1].id)+1
    }
    else{
      newId = 1
    }

    dailytasks.tasks=[...dailytasks.tasks,{...newTask,id:newId}]
        try {
            const data = await dailytasks.save()
            DateTasks.find({ date: { $gte: currentDate } })
            .then(datetasks => {
              datetasks.forEach(async(datetask)=>{
                datetask.tasks = [...datetask.tasks,newTask]
                await datetask.save()
              })
              
              res.json({message:"success",data:newTask})
            })
            .catch(err => {
              console.error(err);
              res.json({message:"Error"})

            });
    } catch (error) {
        res.json("error adding task")

    }

  }



})

app.put("/removeDailyTask",async(req,res)=>{
  const currentDate = new Date().setHours(0,0,0,0)

  const dailytasks = await DailyTasks.findOneAndUpdate({})

  if(req.body.tasks.length<=0){
    dailytasks.tasks=[]
    await dailytasks.save()


    DateTasks.find({ date: { $gte: currentDate } })
    .then(datetasks => {
      datetasks.forEach(async(datetask)=>{
        var additionalTasks = datetask.tasks.filter((task)=>task.taskType==="additional")

        datetask.tasks=[...additionalTasks]
        await datetask.save()
      })
      
      
    })
    .catch(err => {
      console.error(err);
      res.json({message:"Error"})

    });
    res.json({"message":"success"})
  }
  else{

    dailytasks.tasks = req.body.tasks.map((task)=>{
      task.status="incomplete"
      return task;
    })
    await dailytasks.save()



    DateTasks.find({ date: { $gte: currentDate } })
    .then(datetasks => {
      datetasks.forEach(async(datetask)=>{
        var additionalTasks = datetask.tasks.filter((task)=>task.taskType==="additional")

        if(datetask.date.toLocaleDateString()===new Date().toLocaleDateString()){
          datetask.tasks=[...additionalTasks,...req.body.tasks.map((task)=>{
            task.status="complete"
            return task;
          })]
          await datetask.save()
        }
        else{
          datetask.tasks=[...additionalTasks,...req.body.tasks.map((task)=>{
            task.status="incomplete"
            return task;
          })]
          await datetask.save()

        }
      })
      
      
    })
    .catch(err => {
      res.json({message:"Error"})

    });
    res.json({messasge:"success"})
  }
})

app.put("/updateDailyTask",async(req,res)=>{
  const currentDate = new Date().setHours(0,0,0,0)

  const dailytasks = await DailyTasks.findOneAndUpdate({})

  if(req.body.tasks.length<=0){
    dailytasks.tasks=[]
    await dailytasks.save()


    DateTasks.find({ date: { $gte: currentDate } })
    .then(datetasks => {
      datetasks.forEach(async(datetask)=>{
        var additionalTasks = datetask.tasks.filter((task)=>task.taskType==="additional")

        datetask.tasks=[...additionalTasks]
        await datetask.save()
      })
      
      
    })
    .catch(err => {
      console.error(err);
      res.json({message:"Error"})

    });
    res.json({"message":"success"})
  }
  else{

    dailytasks.tasks = req.body.tasks
    await dailytasks.save()



    DateTasks.find({ date: { $gte: currentDate } })
    .then(datetasks => {
      datetasks.forEach(async(datetask)=>{
        var additionalTasks = datetask.tasks.filter((task)=>task.taskType==="additional")

        if(datetask.date.toLocaleDateString()===new Date().toLocaleDateString()){
          datetask.tasks=[...additionalTasks,...req.body.tasks]
          await datetask.save()
        }
        else{
          datetask.tasks=[...additionalTasks,...req.body.tasks]
          await datetask.save()

        }
      })
      
      
    })
    .catch(err => {
      console.error(err);
      res.json({message:"Error"})

    });
    res.json({messasge:"success"})
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

var monthlyResults = await DateTasks.aggregate([ { $project: { month: { $month: { $dateFromString: { dateString: { $substr: ['$date', 0, 10] } } } }, tasks: '$tasks.status' } }, { $unwind: '$tasks' }, { $match: { month: 6 } }, { $group: { _id: { month: '$month', status: '$tasks' }, count: { $sum: 1 } } }, { $group: { _id: '$_id.month', counts: { $push: { k: '$_id.status', v: '$count' } } } }, { $project: { _id: 0, month: '$_id', counts: { $arrayToObject: '$counts' } } }, { $sort: { month: 1 } } ]);

var tComplete = monthlyResults[0].counts.complete===undefined?0:monthlyResults[0].counts.complete
var tIncomplete = monthlyResults[0].counts.incomplete===undefined?0:monthlyResults[0].counts.incomplete
var monthlyResultsData = {
  "month": months[monthlyResults[0].month-1],
  "tasksComplete":tComplete,
  "tasksInomplete":tIncomplete,
  "percentage": Math.floor(tComplete/(tIncomplete+tComplete)*100)
}


    try {
       await DateTasks.aggregate([
        {
          $project: {
            month: { $month: { $dateFromString: { dateString: { $substr: ['$date', 0, 10] } } } },
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
          
            results.map((res)=>{
                data.push({
                    "month":res.month,
                    "complete":res.counts.complete===undefined?0:res.counts.complete,
                    "incomplete":res.counts.incomplete===undefined?0:res.counts.incomplete,
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
            const sum = dataset.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
            const incompleteTasksSum = incompleteTasks.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
            const datetask = await DateTasks.findOne({"date":new Date(req.body.date).setHours(0,0,0,0)})
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

            res.json({"monthlyResult":monthlyResultsData,"dataset":dataset,"totalCompletedTasks":sum,"incompleteTasks":incompleteTasksSum,"totalTasks":incompleteTasksSum+sum,"pieChart":[todayComplete,todayInComplete]});
      });
  
   
    } catch (err) {
      res.status(500).json({ error: 'An error occurred' });
    }
  });
app.put("/update",async(req,res)=>{ 
  const currentDate = new Date(req.body.date).setHours(0,0,0,0);

    const datetask = await DateTasks.findOne({"date":currentDate})

        datetask.tasks=req.body.tasks
        try {
            const data = await datetask.save()
            res.json({message:"success",data:data})
    } catch (error) {
        console.log("error",error);  
    }
})

app.listen(PORT,()=>{
    console.log("Server Running")
})