import { print, createClient } from 'redis';

const redisClient = createClient();

redisClient.on('error', (erro) => {
  console.log(`Redis client not connected to server: ${erro.message}`);
  redisClient.quit();
});
redisClient.on('connect', function () {
    console.log('Redis client connected to the server')
});

console.log(redisClient.connected);

function setNewSchool(schoolName, value) {
  redisClient.set(schoolName, value, print);
}

function displaySchoolValue(schoolName) {
  redisClient.get(schoolName, (_erro, val) => {
    if (val) console.log(val);
  });
}

displaySchoolValue('Holberton');
setNewSchool('HolbertonSanFrancisco', '100');
displaySchoolValue('HolbertonSanFrancisco');
