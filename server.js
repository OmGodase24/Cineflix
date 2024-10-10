//Create A Server
const mongoose = require('mongoose')
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

process.on('uncaughtException',(err)=>{
  console.log(err.name,err.message);
  console.log('UnCaught Exception occured! shutting down...');
    process.exit(1);
})

const app = require('./app')

console.log(process.env)


mongoose.connect(process.env.CONN_STR)
  .then((conn) => {
    //console.log(conn);
    console.log("Connection Successful")
  })
  
const port = process.env.PORT || 3001;

const server = app.listen(port, () => {
    console.log('Server has Started...')
});


process.on('unhandledRejection',(err)=>{
  console.log(err.name,err.message);
  console.log('Unhandled rejection occured! shutting down...');
  server.close(()=>{
    process.exit(1);
  })
})




//npm install --save bcrypt-nodejs && npm uninstall --save bcrypt