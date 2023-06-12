const mongoose = require('mongoose');

const dateTaskSchema = new mongoose.Schema({
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

const DateTask = mongoose.model('DateTask', dateTaskSchema);

const createDefaultObject = async () => {
  try {
    const existingDefaultObject = await DateTask.findOne();
    if (!existingDefaultObject) {
      var currentDate = new Date();
      var findalDate =   new Date( currentDate.getTime() + Math.abs(currentDate.getTimezoneOffset()*60000) );
      const defaultObject = new DateTask({
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

module.exports = DateTask;
//f