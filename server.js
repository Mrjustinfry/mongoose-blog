'use strict'; 

const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL } = require('./config');
const { Blog } = require('./models');

const app = express();

app.use(morgan('common'));
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

//GET request by id
app.get('/blog/:id', (req, res) => {
    Blog.findById(req.params.id)
        .then(post => res.json(post.together()))
        .catch(err => {
            console.log(err);
            res.status({ message: "Internal Server Error"})
        })
})

//POST request
app.post('/blog', (req, res) => {
    const requiredInfo = ['title', 'content', 'author'];
    for (let i = 0; i < requiredInfo.length; i++) {
        const info = requiredInfo[i];
        if (!(info in req.body)) {
            const msg = `Missing \`${info}\`in body`;
            console.log(msg)
             return res.status(400).send(msg)
        }
    }
    Blog.create({
        title: req.body.title,
        content: req.body.content,
        author: req.body.author
    })
        .then(post => res.status(204).json(post.together()))
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: `Something went wrong`})
        })
});

//PUT request
app.put('/blog/:id', (req, res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        res.status(400).json({ error: `ID does not match` });
    }

    const updPost = {};
    const requiredInfo = ['title', 'content', 'author'];
    requiredInfo.forEach(info => {
        if (info in req.body) {
            updPost[info] = req.body[info];
        }
    });

    Blog
        .findByIdAndUpdate(req.params.id, { $set: updPost }, { new: true })
        .then(updatedPost => res.status(204).end())
        .catch(error => res.status(500).json({ error: `someting went wrong` }));
});

//DELETE request
app.delete('/blog/:id', (req, res) => {
    Blog.findByIdAndDelete(req.params.id)
        .then(() => {
            res.status(204).json({ message: `Deleted ${req.params.id}` })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: "something went wrong" })
        });
});

let server;

function runServer(databaseUrl, port = PORT) {
    return new Promise((resolve, reject) => {
        mongoose.connect(databaseUrl, err => {
            if (err) {
                return reject(err);
            }
            server = app.listen(port, () => {
                console.log(`Your app is listening on port ${port}`);
                resolve();
            })
                .on('error', err => {
                    mongoose.disconnect();
                    reject(err);
                });
        });
    });
}

function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('Closing server');
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}

if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };