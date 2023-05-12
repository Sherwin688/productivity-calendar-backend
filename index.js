const express = require("express")
const mongoose = require("mongoose")
const url = "mongodb://127.0.0.1/productivityCalendar"
const app = express()
const DateTasks = require("./models/DateTask")

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
app.get("/find/:id",async(req,res)=>{
    try {
        const datetask = await DateTasks.findById(req.params.id)
        res.send(datetask)
    } catch (error) {
        console.log(error);
    }
})
app.delete("/delete/:id",async(req,res)=>{
    try {
        const datetask = await DateTasks.findByIdAndDelete(req.params.id)
        res.send("Deleted Successfully")
    } catch (error) {
        console.log(error);
    }
})
app.post("/datetask",async(req,res)=>{
    // const date = "12/05/2023"
  
        const datetask =   new DateTasks({
            date:req.body.date,
            tasks:req.body.tasks
        })
        try {
            const data = await datetask.save()
            res.json(data)
    } catch (error) {
        console.log("error");  
    }
})

app.listen(8000,()=>{
    console.log("Server Running")
})