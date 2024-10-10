const Movie = require("../Models/movieModel");

class Apifeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    filter() {
        let queryString = JSON.stringify(this.queryStr);
        queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        const queryObj = JSON.parse(queryString);

        delete queryObj.sort;
        delete queryObj.fields;
        delete queryObj.page;
        delete queryObj.limit;

        this.query = this.query.find(queryObj);

        return this;
    }

    sort() {
        if (this.queryStr.sort) {
            const sortBy = this.queryStr.sort.split(',').join(' ');
            console.log(sortBy)
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }

        return this;
    }

    limitFields() {
        if (this.queryStr.fields) {
            //query.select('name duration price ratings)
            const fields = this.queryStr.fields.split(',').join(' ');
            console.log(fields);
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }
        return this;
    }

    paginate(){
        const page = this.queryStr.page*1 || 1;
        const limit = this.queryStr.limit*1 || 10;
        //PAGE 1:1-10;PAGE 2:11-20;PAGE  3:21-30
        const skip = (page-1)*limit;
        //here suppose we want go to second page (2-1)10 = 10 for 2nd page the skip value will be 10
        this.query = this.query.skip(skip).limit(limit);

        // if (this.queryStr.page) {
        //     const moviesCount = await Movie.countDocuments();
        //     if(skip>=moviesCount){
        //         throw new Error("This page is not found");
        //     }
        // }

        return this;
    }
}

module.exports = Apifeatures;