const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
    title:{
      type : String,
      required : true,
      trim : true,
    },
    description:{
      type : String,
      trim : true,
    },
    status:{
      type: String,
      enum: ['todo', 'inprog','review', 'done'],
      default:'todo',
    },
    priority:{
      type: String,
      enum: ['low', 'med', 'high'],
      default:'med',
    },
    dueDate: {
      type: Date,
    },
    assignee: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {timestamps: true}
);

module.exports = mongoose.model('Task', TaskSchema);