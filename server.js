'use strict'; 

const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL } = require('./config');
const { Author, Blog } = require('./models');

const app = express();

app.use(morgan('common'));
app.use(express.json());

//GET request for authors
app.get('/author', (req, res) => {
    Author.find()
        .then(authors => {
            res.json(authors.map(author => {
                return {
                    id: author._id,
                    name: `${author.firstName} ${author.lastName}`,
                    userName: author.userName
                }
            })
            )
                .catch(err => {
                    console.log(err);
                    res.status({ message: "Internal Server Error" })
                });
        })
});


//POST request for authors
app.post('/author', (req, res) => {
    const requiredInfo = ["firstName", "lastName", "userName"];
    for (let i = 0; i < requiredInfo.length; i++) {
        const info = requiredInfo[i];
        if (!(info in req.body)) {
            const msg = `Missing \`${info}\` in body`;
            console.log(msg);
            return res.status(400).send(msg);
        }
    }
    Author.findOne({ userName: req.body.userName })
        .then(author => {
            if (author) {
                const msg = `Username already exists`;
                console.error(msg);
                return res.status(400).send(msg)
            } else {
                Author.create({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    userName: req.body.userName
                })
                    .then(author => res.status(201).json({
                        id: author.id,
                        name: `${author.firstName} ${author.lastName}`,
                        userName: author.userName
                    }))
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({ error: `Something went wrong`})
                    })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: `Something went wrong`})
        })
});

//PUT request for authors
app.put('/author/:id', (req, res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        res.status(400).json({ error: `ID does not match`})
    }

    const update = { };
    const requiredInfo = ["firstName", "lastName", "userName"];
    requiredInfo.forEach(info => {
        if (info in req.body) {
            update[info] = req.body[info]
        }
    })
    Author
        .findOne({ userName: update.userName || '', _id: { $ne: req.param.id } })
        .then(author => {
            if (author) {
                const msg = `Username already exists`;
                console.error(msg);
                return res.status(400).send(msg);
            } else {
                Author
                    .findByIdAndUpdate(req.params.id, { $set: update }, { new: true })
                    .then(updatedAuthor => {
                        res.status(200).json({
                            id: updatedAuthor.id,
                            name: `${updatedAuthor.firstName} ${updatedAuthor.lastName}`,
                            userName: updatedAuthor.userName
                        })
                    })
                    .catch(err => {
                        res.status(500).json({ error: `Something went wrong`})
                    })
            }
        })
});

//DELETE request for authors
app.delete('/author/:id', (req, res) => {
    Blog
        .remove({ author: req.params.id })
        .then(() => {
            Author
                .findByIdAndDelete(req.params.id)
                .then(() => {
                    console.log(`Deleted blog for author ${req.params.id}`);
                    res.status(204).json({ message: `Deleted ${req.params.id}` })
                })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: `Something went wrong`})
        })
});

//GET request for posts
app.get('/blog', (req, res) => {
    Blog
        .find()
        .then(posts => {
            res.json(posts.map(post => {
                return {
                    id: post._id,
                    author: post.fullName,
                    title: post.title,
                    content: post.content
                };
            }));
        })
        .catch(err => {
            console.log(err);
            res.status({ message: "Internal Server Error" })
        })
});

//GET request for posts by id
            app.get('/blog/:id', (req, res) => {
                Blog.findById(req.params.id)
                    .then(post => {
                        res.json({
                            id: post._id,
                            author: post.fullName,
                            title: post.title,
                            content: post.content
                        })
                    })
                    .catch(err => {
                        console.log(err);
                        res.status({ message: "Internal Server Error" })
                    });
            });

//POST request for posts
app.post('/blog', (req, res) => {
    const requiredInfo = ['title', 'content', 'author_id'];
    for (let i = 0; i < requiredInfo.length; i++) {
        const info = requiredInfo[i];
        if (!(info in req.body)) {
            const msg = `Missing \`${info}\`in body`;
            console.log(msg)
             return res.status(400).send(msg)
        }
    }
    Author
        .findById(req.body.author_id)
        .then(author => {
            if (author) {
                Blog.create({
                    title: req.body.title,
                    content: req.body.content,
                    author: req.body.id
                })
                    .then(post => {
                        res.status(201).json({
                            id: post.id,
                            title: post.title,
                            content: post.content,
                            author: `${author.firstName} ${author.lastName}`,
                            comments: post.comments
                        })
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({ error: `Something went wrong` })
                    })
            } else {
                const msg = `Unidentified Author`;
                console.log(msg);
                return res.status(400).send(msg);
            } 
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: `Something went wrong` })
        })
});

//PUT request for posts
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

//DELETE request for posts
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

app.use('*', function (req, res) {
    res.status(404).json({ message: 'Not Found' });
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
            };

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
            };

if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
            };

module.exports = { runServer, app, closeServer };