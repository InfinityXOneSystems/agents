const { exec } = require('child_process');

const action = process.argv[2];

if (!['push', 'pull'].includes(action)) {
    console.error('Invalid action. Use "push" or "pull".');
    process.exit(1);
}

const command = action === 'push' 
    ? 'rsync -avz ./dist/ infinityxai@infinityxai.com:/var/www/html/' 
    : 'rsync -avz infinityxai@infinityxai.com:/var/www/html/ ./dist/';

exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
    if (stderr) {
        console.error(`Stderr: ${stderr}`);
    }
    console.log(`Stdout: ${stdout}`);
});