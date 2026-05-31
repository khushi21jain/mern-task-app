const cron = require('node-cron');
const Task = require('./models/Task');

// Runs every day at 8am
cron.schedule('0 8 * * *', async () => {
  console.log('Running task automation...');

  try {
    const now = new Date();

    const overdueTasks = await Task.find({
      dueDate: { $lt: now },
      status: { $nin: ['done'] },
    });

    console.log(`Found ${overdueTasks.length} overdue tasks`);

    for (const task of overdueTasks) {
      await Task.findByIdAndUpdate(task._id, {
        $set: { status: 'review' },
        $addToSet: { tags: 'Overdue' },
      });
    }

    console.log('Task automation complete');
  } catch (err) {
    console.error('Scheduler error:', err.message);
  }
});

console.log('Task scheduler started');