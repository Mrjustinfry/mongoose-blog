'use strict'

const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    "title": String,
    "content": String,
    "author": {
        "firstName": String,
        "lastName": String
    }
});

postSchema.virtual('fullName').get(function () {
    return `${this.author.firstName} ${this.author.lastName}`.trim();
});

postSchema.methods.together = function () {
    return {
        title: this.title,
        content: this.content,
        author: this.fullName
    };
};

const Blog = mongoose.model('Blog', postSchema);

module.exports = { Blog };