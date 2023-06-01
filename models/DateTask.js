const mongoose = require('mongoose');

const dateTaskSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
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
      const defaultObject = new DateTask({
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

module.exports = DateTask;
//f