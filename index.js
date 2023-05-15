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
app.delete("/delete/:id",async(req,res)=>{
    try {
        const datetask = await DateTasks.findByIdAndDelete(req.params.id)
        res.send("Deleted Successfully")
    } catch (error) {
        console.log(error);
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

// app.get("/test",async(req,res)=>{
   
//     const dailytasks = await DailyTasks.findOne().sort({ field: 'asc', _id: -1 }).limit(1)

//     res.json(dailytasks.tasks)

// })
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

app.listen(8000,()=>{
    console.log("Server Running")
})