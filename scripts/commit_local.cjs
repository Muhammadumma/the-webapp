const fs = require('fs');
const path = require('path');
const git = require('isomorphic-git');

async function main() {
  const dir = path.resolve(__dirname, '..');
  
  try {
    await git.init({ fs, dir });
    console.log('Git initialized successfully');

    // Add all files
    const files = await git.statusMatrix({ fs, dir });
    for (const [filepath, head, workdir, stage] of files) {
      if (filepath.startsWith('node_modules/') || filepath.startsWith('.git/')) continue;
      if (workdir === 0) {
        await git.remove({ fs, dir, filepath });
      } else {
        await git.add({ fs, dir, filepath });
      }
    }
    console.log('Files staged');

    // Commit
    const sha = await git.commit({
      fs,
      dir,
      author: {
        name: 'Muhammadumma',
        email: 'clearance@jigawapoly.edu.ng',
      },
      message: 'Add Firebase Firestore persistence and real-time synchronization',
    });
    console.log('Committed SHA:', sha);
  } catch (err) {
    console.error('Git error:', err);
  }
}

main();
