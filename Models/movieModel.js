const mongoose = require('mongoose')
const fs = require('fs');
const validator = require('validator');

const movieSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is reauired field!'],//for required fields we can specify validation message
        maxlength:[100,"Movie name must not have more than 100 characters"],
        minlength : [4,"Movie name must have atleast 4 characters"],
        unique: true,
        trim: true,
        //validate : [validator.isAlpha,"Name SHould only consist Alphabets"]
    },
    description: {
        type: String,
        required: [true, 'Description is required field!'],
        trim: true
    },
    duration: {
        type: Number,
        required: [true, 'Duration is required field!']
    },
    ratings: {
        type: Number,
        //default: 1.0 //We can set default value to our fields
        // min : [1,"Ratings must be 1.0 or above"],
        // max : [10,"Ratings must be 10.0 or below"]
        validate:{
            validator: function(value){
                return value >=1 && value<=10;
            },
            message:"Ratings ({VALUE}) should be above 1 & below 10"
        }
    },//the ratings is going to be of type double but since in JS we have datatype for integer and double but in mongodb it will be saved as double
    totalRating: {
        type : Number
    },
    releaseYear:{
        type : Number,
        required : [true,'Release Year is required field!']
    },
    releaseDate:{
        type : Date
    },
    createdAt : {
        type : Date,
        default : Date.now()
    },
    genres : {
        type : [String],
        required : [true,'Genres is required field'],
        // enum : {
        //     values:['Action', 'Drama', 'Comedy', 'Horror', 'Sci-Fi', 'Romance', 'Documentary', 'Fantasy', 'Adventure'],
        //     message :'Genre does not exist',
        // },
    },
    directors : {
        type : [String],
        required : [true,'Directors is required field']
    },
    coverImage:{
        type : String,
        required : [true,'Cover image is required field']
    },
    actors : {
        type : [String],
        required : [true,'Actors is required field']
    },
    price:{
        type : Number,
        required : [true,'price is required field']
    },
    createdBy: String

},{
    toJSON : {virtuals : true},
    toObject : {virtuals : true}
});

//Virtual Properties
movieSchema.virtual('durationInHours').get(function(){
    return this.duration / 60;
})

//EXECUTED BEFORE THE DOCUMENT IS SAVED IN DB
//.save() or .create() 
//Document Middleware
movieSchema.pre('save',function(next){
    this.createdBy = 'Om Godase';
    next();
})

movieSchema.post('save',function(doc,next){
    const content = `A new movie document with name ${doc.name} has been created by ${doc.createdBy}\n`;
    fs.writeFileSync('./Log/log.txt',content,{flag: 'a'},(err)=>{
       console.log(err.message); 
    })
    next();
})


//Query Middleware
movieSchema.pre(/^find/,function(next){
    this.find({releaseDate:{$lte:Date.now()}});
    this.startTime = Date.now();

    next();
});

movieSchema.post(/^find/,function(docs,next){
    this.find({releaseDate:{$lte:Date.now()}});
    this.endTime = Date.now();

    const content = `Query took ${this.endTime - this.startTime} milliseconds to fetch the documents.`
    fs.writeFileSync('./Log/log.txt',content,{flag: 'a'},(err)=>{
        console.log(err.message); 
     })
    next();
});

movieSchema.pre('aggregate',function(next){

    //console.log(this.pipeline().unshift({$match:{releaseDate:{$lte:new Date()}}}));
    next();
})

const Movie = mongoose.model('Movie', movieSchema)

module.exports = Movie;