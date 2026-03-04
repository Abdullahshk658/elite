import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { MongoMemoryServer } from 'mongodb-memory-server';

const runCommand = (command, args, env) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      stdout += text;
      process.stdout.write(text);
    });

    child.stderr.on('data', (chunk) => {
      const text = chunk.toString();
      stderr += text;
      process.stderr.write(text);
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`${command} ${args.join(' ')} failed with code ${code}`));
      }
    });
  });

const waitForHealth = async (baseUrl) => {
  for (let i = 0; i < 40; i += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) {
        return true;
      }
    } catch (_error) {
      // wait and retry
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return false;
};

const getJson = async (url, options) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed ${response.status}: ${url}`);
  }
  return response.json();
};

const main = async () => {
  const mongo = await MongoMemoryServer.create({
    instance: {
      dbName: 'elitekicks',
      launchTimeout: 120000
    }
  });

  const port = 5050;
  const baseUrl = `http://localhost:${port}`;
  const env = {
    ...process.env,
    MONGO_URI: mongo.getUri(),
    PORT: String(port)
  };

  let server;

  try {
    console.log(`Memory Mongo URI: ${env.MONGO_URI}`);
    console.log('Running seed...');
    await runCommand('node', ['src/scripts/seed.js'], env);

    console.log('Starting server...');
    server = spawn('node', ['server.js'], {
      env,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    server.stdout.on('data', (chunk) => process.stdout.write(chunk.toString()));
    server.stderr.on('data', (chunk) => process.stderr.write(chunk.toString()));

    const ready = await waitForHealth(baseUrl);
    if (!ready) {
      throw new Error('Server did not become healthy in time');
    }

    const products = await getJson(`${baseUrl}/api/products?limit=3&sort=newest`);
    const tree = await getJson(`${baseUrl}/api/categories/tree`);
    const search = await getJson(`${baseUrl}/api/products/search?q=jordan`);

    const login = await getJson(`${baseUrl}/api/users/login`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@elitekicks.pk',
        password: 'Admin@123456'
      })
    });

    console.log('Smoke check summary:');
    console.log(`health: ok`);
    console.log(`products total: ${products.total}`);
    console.log(`first product: ${products.products[0]?.name || 'n/a'}`);
    console.log(`category roots: ${tree.length}`);
    console.log(`search results for "jordan": ${search.length}`);
    console.log(`admin token length: ${login.token?.length || 0}`);
  } finally {
    if (server && !server.killed) {
      server.kill('SIGINT');
      await Promise.race([
        once(server, 'exit'),
        new Promise((resolve) => setTimeout(resolve, 4000))
      ]);
    }

    await mongo.stop();
  }
};

main().catch((error) => {
  console.error('Smoke test failed:', error.message);
  process.exit(1);
});
