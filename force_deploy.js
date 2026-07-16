const { execSync } = require('child_process');
try {
  console.log('Adding files...');
  execSync('git add .');
  
  console.log('Committing changes...');
  execSync('git commit -m "Split FI module into 5 separate layout pages"');
  
  console.log('Pushing to GitHub (Vercel will rebuild)...');
  execSync('git push');
  
  console.log('SUCCESS! The code is successfully pushed to Vercel.');
} catch (e) {
  console.error('Error during deployment:', e.stdout ? e.stdout.toString() : e.toString());
}
