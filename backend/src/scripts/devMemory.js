import { spawn } from 'node:child_process';
import { MongoMemoryServer } from 'mongodb-memory-server';

const run = (command, args, env) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      env
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(' ')} failed with code ${code}`));
      }
    });
  });

const main = async () => {
  const mongo = await MongoMemoryServer.create({
    instance: {
      dbName: 'elitekicks',
      launchTimeout: 120000
    }
  });

  const uri = mongo.getUri();

  const env = {
    ...process.env,
    MONGO_URI: uri,
    PORT: process.env.PORT || '5001'
  };

  console.log(`Memory Mongo started: ${uri}`);
  console.log('Seeding sample data...');

  await run('node', ['src/scripts/seed.js'], env);

  console.log('Starting backend server on memory Mongo...');
  const server = spawn('node', ['server.js'], {
    stdio: 'inherit',
    env
  });

  const shutdown = async () => {
    server.kill('SIGINT');
    await mongo.stop();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  server.on('exit', async (code) => {
    await mongo.stop();
    process.exit(code || 0);
  });
};

main().catch((error) => {
  console.error('dev:memory failed:', error.message);
  process.exit(1);
});
