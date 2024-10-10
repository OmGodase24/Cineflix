// const fs = require('fs');
// let movies = JSON.parse(fs.readFileSync('./data/movies.json'));
const { Error } = require('mongoose');
const Movie = require('./../Models/movieModel')
const ApiFeatures = require('./../utils/ApiFeatures')
const asyncErrorHandler = require('./../utils/asyncErrorHandler');
const CustomError = require('./../utils/CustomError');


exports.getHighestRated = (req, res, next) => {
    if (!req.query.limit) {
        req.query.limit = '5'; // Set default limit to 5 if not provided
    }
    if (!req.query.sort) {
        req.query.sort = '-ratings'; // Set default sort to descending ratings if not provided
    }
    
    next();
}


exports.getAllMovies = asyncErrorHandler(async(req,res,next)=>{
    

        const features = new ApiFeatures(Movie.find(),req.query).filter().sort().limitFields().paginate();
        let movies =await features.query;
        /******************************** */
        // Mongoose 6.0 or less
        // const excludeFields = ['sort','page','limit','fields'];

        // const queryObj = {...req.query}

        // excludeFields.forEach((el)=>{
        //     delete queryObj[el]
        // })
        // console.log(queryObj);
        // const movies = await Movie.find(queryObj);
        /****************************************** */
        //console.log(req.query);

        // let query = Movie.find();

        // // Filtering logic
        // let queryStr = JSON.stringify(req.query);
        // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        // const queryObj = JSON.parse(queryStr);
        
        // Remove sort from queryObj
        // delete queryObj.sort;
        // delete queryObj.fields;
        // delete queryObj.page;
        // delete queryObj.limit;
    

        // query = query.find(queryObj);

        // // Sorting logic
        // if (req.query.sort) {
        //     const sortBy = req.query.sort.split(',').join(' ');
        //     query = query.sort(sortBy);
        // } else {
        //     query = query.sort('createdAt');
        // }

        // Limiting Fields
        // if(req.query.fields){
        //     //query.select('name duration price ratings)
        //     const fields = req.query.fields.split(',').join(' ');
        //     console.log(fields);
        //    query = query.select(fields);
        // }else{
        //     query = query.select('-__v');
        // }

        //PAGINATION
        // const page = req.query.page*1 || 1;
        // const limit = req.query.limit*1 || 10;
        // //PAGE 1:1-10;PAGE 2:11-20;PAGE  3:21-30
        // const skip = (page-1)*limit;
        // //here suppose we want go to second page (2-1)10 = 10 for 2nd page the skip value will be 10
        // query = query.skip(skip).limit(limit);

        // if (req.query.page) {
        //     const moviesCount = await Movie.countDocuments();
        //     if(skip>=moviesCount){
        //         throw new Error("This page is not found");
        //     }
        // }

        // const movies = await query;
    
        
        //find({duration:{$gte:90},ratings:{$gte:5},price:{$lte:100}})

        // Alternate Method
        // const movies = await Movie.find().where('duration').gte(req.query.duration).where('ratings').equals(req.query.ratings);

        res.status(200).json({
            status : 'success',
            length : movies.length,
            data : {
                movies
            }//envelope or wrapper around data
        });

    // catch(err){
    //     res.status(404).json({
    //         status : 'fail',
    //         message : err.message
    //     })
    // }
});

exports.getMovie = asyncErrorHandler(async(req,res,next)=>{
    //const movie = await Movie.find({_id : req.params.id});


        const movie = await Movie.findById(req.params.id);

        //console.log(x);

        if(!movie){
            const error = new CustomError('Movie with that ID is not Found!',404);
            return next(error);
        }
        

        res.status(200).json({
            status : 'success',
            data : {
                movie
            }//envelope or wrapper around data
        });



});

exports.createMovie = asyncErrorHandler(async(req,res,next)=>{
    //const testMovie = new Movie({})
    //testMovie.save();
        const movie = await Movie.create(req.body);

        res.status(201).json({
            status:'success',
            data:{
                movie
            }
        })
    }
);

exports.updateMovie = asyncErrorHandler(async(req,res,next)=>{
        const updateMovie = await Movie.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});

        if(!updateMovie){
            const error = new CustomError('Movie with that ID is not Found!',404);
            return next(error);
        }
        

        res.status(200).json({
            status : 'success',
            Movie  :updateMovie
        })

})

exports.deleteMovie = asyncErrorHandler(async(req,res,next)=>{

        const deletedMovie=await Movie.findByIdAndDelete(req.params.id)

        if(!deletedMovie){
            const error = new CustomError('Movie with that ID is not Found!',404);
            return next(error);
        }
        

        res.status(204).json({
            status : 'success',
            data : null
        })
})

//aggregation 
exports.getMovieStats = asyncErrorHandler(async(req,res,next)=>{

        const stats = await Movie.aggregate([
            {$match : {releaseDate: {$lte : new Date()}}},
            { $match : {ratings : {$gte: 4.5}}},
            { $group: {
                _id: '$releaseYear',
                avgRating : {$avg: '$ratings'},
                avgPrice : {$avg: '$price'},
                minPrice:{$min:'$price'},
                maxPrice:{$max:'$price'},
                priceTotal: {$sum :'$price'},
                movieCount: {$sum:1}

            }},
            {$sort:{minPrice : 1}},
            //{ $match : {maxPrice : {$gte: 60}}}
        ]);

        res.status(200).json({
            status:'success',
            count : stats.length,
            data:{
                stats
            }
        })
});


exports.getMovieByGenre = asyncErrorHandler(async(req,res,next)=>{
        const genre = req.params.genre
        const movies = await Movie.aggregate([
            //{$match : {releaseDate: {$lte : new Date()}}},
            {$unwind : '$genres'},
            {$group : {
                _id : '$genres',
                movieCount : {$sum : 1},
                movies :{$push : '$name'}
            }},
            {$addFields: {genre : '$_id'}},
            {$project : {_id:0}},
            {$sort : {movieCount : -1}},
            {$match : {genre:genre}}
        ])

        res.status(200).json({
            status:'success',
            count : movies.length,
            data:{
                movies
            }
        })

})






































































































































































































//GET - api/v1/movies/id

// exports.CheckId = (req,res,next,value)=>{
//     console.log("Mocie ID is "+ value);

//     let movie = movies.find(el => el.id === value * 1);

//     if(!movie){
//         return res.status(404).json({
//             status : "fail",
//             message : 'Movie with ID ' +value+ ' is not found'
//         })
//     }

//     next();
// }

// exports.validateBody = (req,res,next)=>{
//     if (!req.body.name || !req.body.releaseYear) {
//         return res.status(400).json({
//             status : "fail",
//             message : 'Not a Valid Movie Data'
//         })
        
//     }
//     next()
// }

// exports.getAllMovies = (req,res)=>{
//     res.status(200).json({
//         status : "success",
//         requsetedAt : req.requsetedAt,
//         count : movies.length,
//         data:{
//             movies : movies
//         }
//     })

// }

// exports.getMovie = (req,res)=>{
//     // console.log(req.params);
//     //convert ID to Number Type
//     const id = +req.params.id;//req.params.id*1;

//     //Find Movie based on ID parameter
//     let Movie = movies.find(el => el.id == id)

//     // if(!Movie){
//     //     return res.status(404).json({
//     //         status:"fail",
//     //         message : 'Movie with ID ' +id+ ' is not found'
//     //     })
//     // }

//     //Send Movie in response
//     res.status(200).json({
//         status:'success',
//         data : {
//             movie : Movie
//         }
//     })
// }

// exports.createMovie = (req,res)=>{
//     // console.log(req.body);
//                      //index for last movie object                                   
//     const newId = movies[movies.length - 1].id + 1;


//     const newMovie = Object.assign({id:newId},req.body)

//     movies.push(newMovie);
    
//     //movies is javascipt array into the json data 
//     fs.writeFile('./data/movies.json',
//     JSON.stringify(movies),(err)=>{
//         res.status(201).json({
//             status : "success",
//             data: {
//                 movie : newMovie
//             }
//         })
//     })
//     // res.send('created');
// }

// exports.updateMovie = (req,res)=>{
//     let id = req.params.id * 1; 

//     let MovieToUpdate = movies.find(el => el.id === id);

//     // if(!MovieToUpdate){
//     //     return res.status(404).json({
//     //         status:"fail",
//     //         message:'No Movie Object '+id+'is found '
//     //     })
//     // }
//     let index = movies.indexOf(MovieToUpdate)//e.g id = 4,index = 3

//     Object.assign(MovieToUpdate,req.body);

//     movies[index] = MovieToUpdate;

//     fs.writeFile('./data/movies.json',JSON.stringify(movies),(err)=>{
//         res.status(200).json({
//             status:"success",
//             data:{
//                 movie : MovieToUpdate
//             }
//         })
//     })

// }

// //POST - /api/v1/movies



// exports.deleteMovie = (req,res)=>{
//     const id = req.params.id * 1;
//     const movieToDelete = movies.find(el => el.id === id);
//     // if (!movieToDelete) {
//     //     res.status(404).json({
//     //         status:"failure",
//     //         message:'No Movie Object with ID '+id+' is found to delete'
//     //     })
//     // }


//     const index = movies.indexOf(movieToDelete);

//     movies.splice(index,1);

//     fs.writeFile('./data/movies.json',JSON.stringify(movies),(err)=>{
//         res.status(204).json({
//             status:"success",
//             data:{
//                 movie : null
//             }
//         })
//     })



// } 