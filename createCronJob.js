const fs = require('fs');
const { execSync } = require('child_process');

// Define the command or script you want to run in the cron job
const command = 'echo "Hello, World!" >> /path/to/output.txt';

// Add the cron job entry to the user's crontab file
function addCronJob() {
  const cronEntry = `* * * * * ${command}\n`;

  // Get the user's crontab file path
  const crontabPath = execSync('crontab -l').toString().trim().split('\n')[0].split(' ')[2];

  // Read the current crontab content
  fs.readFile(crontabPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading crontab file:', err);
      return;
    }

    // Append the new cron entry to the existing content
    const updatedCrontab = data.trim() + '\n' + cronEntry;

    // Write the updated crontab content back to the file
    fs.writeFile(crontabPath, updatedCrontab, 'utf8', (err) => {
      if (err) {
        console.error('Error writing crontab file:', err);
        return;
      }
      console.log('Cron job added successfully.');
    });
  });
}

// Execute the function to add the cron job
addCronJob();

