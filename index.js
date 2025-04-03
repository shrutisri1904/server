import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import EmployeeModel from './models/employee.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(cookieParser());

mongoose.connect('mongodb://127.0.0.1:27017/employee');

const verifyUser = (req, res, next) => {
    const token =  req.cookies.token;
    if(!token) {
        return res.json('The token is not available!')
    } else {
        jwt.verify(token, "jwt-secret-key", (err, decoded) => {
            if(err) return res.json('Token is wrong')
            next();
        })
    }
}
app.get('/home', verifyUser, (req, res) => {
    return res.json('Success')
})

app.post('/login', (req, res) => {
    const {email, password } = req.body;
    EmployeeModel.findOne({email: email})
    .then(user => {
        if(user) {
            bcrypt.compare(password, user.password, (err, response) => {
                if(response) {
                    const token = jwt.sign({email: user.email}, 'jwt-secret-key', {expiresIn: '1d'});
                    res.cookie('token', token);
                    res.json('Success')
                } else {
                    res.json('The password is incorrect!')
                }
            })
        } else {
            res.json('User does not exist!')
        }
    })
})
app.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    bcrypt.hash(password, 10)
    .then(hash => {
        EmployeeModel.create({name, email, password: hash})
        .then((employees) => { 
            res.json(employees)
        })
        .catch((err) => {
            res.json(err);
        })
    })
    .catch(err => {
        console.log(err.message);
    })
})

app.listen(3001, () => {
    console.log('Server is running...')
}); 