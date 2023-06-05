const mongoose = require('mongoose');

const dailyTasksSchema = new mongoose.Schema({
  date: Date,
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
      const defaultObject = new DailyTasks({
        date: new Date().setHours(0,0,0,0),
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
