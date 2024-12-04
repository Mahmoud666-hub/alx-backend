import { print, createClient } from 'redis';
import { promisify } from 'util';

const redisClient = createClient();

redisClient.on('error', (erro) => {
  console.log(`Redis client not connected to server: ${erro.message}`);
  redisClient.quit();
});

const getAsync = promisify(redisClient.get).bind(redisClient);

function setNewSchool(schoolName, value) {
  redisClient.set(schoolName, value, print);
}

async function displaySchoolValue(schoolName) {
  const val = await getAsync(schoolName);
  if (val) console.log(val);
}

async function main() {
  await displaySchoolValue('Holberton');
  setNewSchool('HolbertonSanFrancisco', '100');
  await displaySchoolValue('HolbertonSanFrancisco');
}

redisClient.on('connect', function () {
  console.log('Redis client connected to the server');
  main();
});
