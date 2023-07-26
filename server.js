const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION!!!!! SHUTTING DOWN.....');
  console.log(err);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app.js');

//BRINGING THE DB CONNECTION STRING
const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);
//CONNECTING TO OUR DATABASE ON ATLAS
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((con) => {
    // console.log(con.connections);
    console.log('DB connection succesful!!!!!!');
  })
  .catch((err) => {
    console.log(err.name, err.message);
  });

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
// console.log(app.get('env'));
// console.log(process.env);

//HANDLING UNHANDLED REJECTIONS
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION!!!! SHUTTING DOWN.....');
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});
