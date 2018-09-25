'use strict'

const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({ content: String });

const authorSchema = mongoose.Schema({
    "firstName": String,
    "lastName": String,
    "userName": {
        type: String,
        unique: true
    }
});

const postSchema = mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author' },
    created: { type: Date, default: Date.now },
    comments: [commentSchema]
});

postSchema.virtual('fullName').get(function () {
    return `${this.author.firstName} ${this.author.lastName}`.trim();
});

postSchema.methods.serialize = function () {
    return {
        id: this._id,
        title: this.title,
        content: this.content,
        author: this.fullName,
        created: this.created,
        comments: this.comments
    };
};


postSchema.pre('find', function (next) {
    this.populate('Author');
    next();
})

postSchema.pre('findOne', function (next) {
    this.populate('Author');
    next();
})

const Blog = mongoose.model('Blog', postSchema);

let Author = mongoose.model('Author', authorSchema);

module.exports = { Author, Blog };