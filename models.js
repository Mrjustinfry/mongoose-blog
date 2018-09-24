'use strict'

const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    "title": { type: String, required: true },
    "content": { type: String },
    "author": {
        "firstName": String,
        "lastName": String
    },
    "created": {type: Date, default: Date.now }
});

postSchema.virtual('fullName').get(function () {
    return `${this.author.firstName} ${this.author.lastName}`.trim();
});

postSchema.methods.together = function () {
    return {
        id: this._id,
        title: this.title,
        content: this.content,
        author: this.fullName,
        created: this.created
    };
};

const Blog = mongoose.model('Blog', postSchema);

module.exports = { Blog };