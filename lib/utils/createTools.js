const spawn = require('child_process').spawn;

exports.execNpmInstall = (cwd, callback) => {
  console.log(`\nPreparing modules in ${cwd} ... `);

  const npm = spawn('npm', ['install'], {
    cwd: cwd,
    env: process.env,
    detached: true
  });

  npm.stdout.on('data', (data) => {
    console.log(`npm info: ${data}`);
  });

  npm.stderr.on('data', (error) => {
    console.log(`npm log: ${error}`);
  });


  npm.on('close', function (code) {
    if (code !== 0) {
      console.log(`FAIL: npm with code ${code}`);
    } else {
      callback();
      npm.unref();
    }
  });
};
