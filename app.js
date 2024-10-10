//Importing Packages
const express = require('express');
const morgan = require('morgan');
const moviesRouter = require('./Routes/moviesRoute')
const authRouter = require('./Routes/authRouter')
const CustomError = require('./utils/CustomError');
const globalErrorHandler = require('./controllers/errorController');
const userRoute = require('./Routes/userRoute')

let app = express();

// console.log(movies.length)
const logger = function(req,res,next){

    console.log("Custom MiddleWare Called");
    next();
}

app.use(express.json());

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}
app.use(express.static('./public'))
app.use(logger);
app.use((req,res,next)=>{
    req.requsetedAt = new Date().toISOString();
    next();
})

//Using Routes
app.use('/api/v1/movies',moviesRouter);
app.use('/api/v1/auth',authRouter);
app.use('/api/v1/user',userRoute);
app.all('*',(req,res,next)=>{
    // res.status(404).json({
    //     status:'fail',
    //     message:`can't find ${req.originalUrl}on the server!`
    // })
    // const err = new Error(`can't find ${req.originalUrl}on the server!`);
    // err.status = 'fail';
    // err.statusCode = 404;
    const err = new CustomError(`can't find ${req.originalUrl}on the server!`,404);
    next(err);

})


app.use(globalErrorHandler);

module.exports = app;































//Route Handler Functions




//GET - /api/v1/movies
// app.get('/api/v1/movies',getAllMovies)
// app.get('/api/v1/movies/:id',getMovie)
// app.post('/api/v1/movies',createMovie)
// app.patch('/api/v1/movies/:id',updateMovie)
// app.delete('/api/v1/movies/:id',deleteMovie)
