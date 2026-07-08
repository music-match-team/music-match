const http = require('http');

http.get('http://localhost:3000/api/dashboard?idUtente=1', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});
