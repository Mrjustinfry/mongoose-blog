'use strict' 

const express = require('express');

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL } = require('./config');
const { Blog } = require('./models');

const app = express();

app.use(express.json());

//GET request
app.get('/blog', (req, res) => {
    Blog.find()
        .then(posts =>
            res.json({
                posts: posts.map(posts => posts.together())
            }))
        .catch(err => {
            console.log(err);
            res.status({ message: "Internal Server Error" })
        })

});

//POST request
app.post('/blog', (req, res) => {
    
});

//PUT request
app.put('/blog:id', (req, res) => {

});

//DELETE request
app.delete('/blog:id', (req, res) => {

});

let server;

function runServer(dataBaseUrl, port = PORT) {
    return new Promise((resolve, reject) => {
        mongoose.connect(

            dataBaseUrl,
            err => {
                if (err) {
                    return reject(err);
                }
                server = app.listen(port, () => {
                    console.log(`Your app is listening on ${port}`);
                    resolve();
                })
                    .on('error', err => {
                        mongoose.disconnect()
                        reject(err);
                    });
            })
    })
};

function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('Server closing');
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            })
        })
    })
};

module.exports = { app, runServer, closeServer };