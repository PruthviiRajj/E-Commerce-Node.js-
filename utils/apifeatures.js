const { json } = require("express")
const match = require("nodemon/lib/monitor/match")

class APIfeature{
    constructor(query, querystr){
        this.query = query
        this.querystr = querystr
    }
    
    //i means case insensitive
    search(){
        const keyword = this.querystr.keyword ?{
            name:{
                $regex: this.querystr.keyword,
                $options: 'i'
            }
        }:{}

        this.query = this.query.find({...keyword})
        return this
    }


    filter(){
        const queryCopy = {...this.querystr}

        // console.log(queryCopy)

        //removing fields from query
        const removefields = ['keyword', 'limit', 'page']
        removefields.forEach(e1 => delete queryCopy[e1])

        // console.log(queryCopy)
        
        //advance filter for price,rating and etc.        
        let querystr = JSON.stringify(queryCopy)
        querystr = querystr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`)
        // console.log(querystr)


        this.query = this.query.find(JSON.parse(querystr))          
        return this

    }

    pagination(resParPage){
        const currentPage = Number(this.querystr.page) || 1
        const skip = resParPage * (currentPage - 1)

        this.query = this.query.limit(resParPage).skip(skip)
        return this
    }

}

module.exports = APIfeature