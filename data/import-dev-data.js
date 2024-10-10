const mongoose = require('mongoose')
const dotenv = require('dotenv');
const fs = require('fs');
const Movie = require('./../Models/movieModel')

dotenv.config({ path: './config.env' })

mongoose.connect(process.env.CONN_STR)
    .then((conn) => {
        //console.log(conn);
        console.log("Connection Successful")
    })
    .catch((error) => {
        console.log("Error:", error);
    });


const movies = JSON.parse(fs.readFileSync('./data/movies.json', 'utf-8'));


const deleteMovies = async () => {
    try {
        await Movie.deleteMany();
        console.log("Data Successfully Deleted!");

    } catch (err) {
        console.log(err.message);
    }
    process.exit();
}

const importMovies = async () => {
    try {
        await Movie.create(movies);
        console.log('Data successfully imported');

    } catch (err) {
        console.log(err.message);
    }
    process.exit()
}

// deleteMovies()
// importMovies()

//console.log(process.argv)

if (process.argv[2] === '--import') {
    importMovies()
}
if (process.argv[2] === '--delete') {
    deleteMovies()
}

