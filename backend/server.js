const app = require('./app');
const env = require('./config/env');


const port = env.PORT || 5000;

app.listen(port, () => {
  console.log(` FoundIt Server is running on port ${port}`);
  console.log(` http://localhost:${port}`);
});