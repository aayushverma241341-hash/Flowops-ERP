const { execSync } = require('child_process');
try {
  const status = execSync('git status').toString();
  const log = execSync('git log -1').toString();
  console.log('STATUS:\n', status);
  console.log('LOG:\n', log);
} catch (e) {
  console.error(e.toString());
}
