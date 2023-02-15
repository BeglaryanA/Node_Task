import express from 'express';
import mongoose from 'mongoose';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost/library", (err) => {
    console.error(err);
});

const userSchema = new mongoose.Schema({
    name: String,
    surname: String,
    books: []
});

const bookSchema = new mongoose.Schema({
    author: String,
    bookName: String,
});

const User = mongoose.model('User', userSchema);
const Book = mongoose.model('Books', bookSchema);
var count = Book.count();

app.post('/user', (req, res) => {
    const name = req.body.name;
    const surname = req.body.surname;
    const user = new User({
        name,
        surname,
    });
    user.save((err) => {
        if (err) {
            res.status(404);
            console.error(err);
        }
        res.send(user);
    });
})

app.get('/book', (req, res) => {
    const bookName = req.body.bookName;
    const _id = req.body.userID;
    User.findByIdAndUpdate(
        _id,
        { $push: { books: bookName } },
        { new: true, upsert: true },
        (err, result) => {
            if (err) {
                console.error(err);
            } else {
                res.send(result);
            }
        }
    );
})

app.get('/books', (req, res) => {
    if (count) {
        Book.find({}, (err, result) => {
            if (err) {
                res.status(404);
                console.error(err);
            }
            res.json(result);
        });
    }
})

app.post('/book', (req, res) => {
    const author = req.body.author;
    const bookName = req.body.bookName;
    Book.findOneAndUpdate({
        author,
        bookName
    },
        { author, bookName },
        { upsert: true, new: true, setDefaultsOnInsert: true }, (err, result) => {
            if (err) {
                res.status(404);
                console.error(err);
            }
            res.send(result);
        });
})

app.listen(PORT);