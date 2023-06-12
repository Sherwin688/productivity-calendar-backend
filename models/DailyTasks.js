const mongoose = require('mongoose');

const dailyTasksSchema = new mongoose.Schema({
  date: {
    type:Date,
  
  },
  tasks: [
    {
      id: String,
      task: String,
      status: String,
      taskType: String
    }
  ]
});

const DailyTasks = mongoose.model('DailyTasks', dailyTasksSchema);

const createDefaultObject = async () => {
  try {
    const existingDefaultObject = await DailyTasks.findOne();
    if (!existingDefaultObject) {
      var currentDate = new Date();
      var findalDate =   new Date( currentDate.getTime() + Math.abs(currentDate.getTimezoneOffset()*60000) );
      const defaultObject = new DailyTasks({
        date: findalDate,
        tasks: [
          {
            id: '1',
            task: 'default task',
            status: 'incomplete',
            taskType: 'daily'
          }
        ]
      });
      await defaultObject.save();
      console.log('Default object created successfully');
    }
  } catch (err) {
    console.error('Error creating default object:');
  }
};

createDefaultObject();

module.exports = DailyTasks;
