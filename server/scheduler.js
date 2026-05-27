const cron = require('node-cron');
const Task = require('./models/Task');

// Runs every day at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running task automation...');

  try {
    const now = new Date();

    // Find all overdue tasks that are NOT done
    const overdueTasks = await Task.find({
      dueDate: { $lt: now },
      status: { $nin: ['done'] },
    });

    console.log(`Found ${overdueTasks.length} overdue tasks`);

    // Move each overdue task to 'review' and add overdue tag
    for (const task of overdueTasks) {
      await Task.findByIdAndUpdate(task._id, {
        $set: { status: 'review' },
        $addToSet: { tags: 'Overdue' },
      });
      console.log(`Moved overdue task to review: ${task.title}`);
    }

  } catch (err) {
    console.error('Scheduler error:', err.message);
  }
});

console.log('Task scheduler started');