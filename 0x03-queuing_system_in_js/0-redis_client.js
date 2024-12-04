import { createClient } from 'redis';

const redisClient = createClient();

redisClient.on('connect', function () {
    console.log('Redis client connected to the server');
});

redisClient.on('error', (erro) => {
  console.log(`Redis client not connected to server: ${erro.message}`);
  redisClient.quit();
});
