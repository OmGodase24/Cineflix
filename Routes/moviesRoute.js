
const express = require('express')
const moviesController = require('../controllers/moviesController')
const authController = require('./../controllers/authController');

const router = express.Router();



router.route('/')
    .get(authController.protect,moviesController.getAllMovies)
    .post(moviesController.createMovie)

router.route('/highest-rated')
    .get(moviesController.getHighestRated, moviesController.getAllMovies);

router.route('/movie-stats')
    .get(moviesController.getMovieStats);

router.route('/movies-by-genre/:genre')
    .get(moviesController.getMovieByGenre);

router.route('/:id')
    .get(authController.protect,moviesController.getMovie)
    .patch(moviesController.updateMovie)
    .delete(authController.protect,authController.restrict('admin'),moviesController.deleteMovie);



module.exports = router; 