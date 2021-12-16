const User = require('../models/User');
const bcrypt = require('bcrypt');

exports.login = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            res.render('login', { _pageName: "login", errors: { message: 'Email not found' }, message: null })
            return;
        }

        const match = await bcrypt.compare(req.body.password, user.password);
        if (match) {
            req.session.userID = user._id;
            console.log(req.session.userID);
            res.redirect('history');
            return
        }

        res.render('login', { _pageName: "login", errors: { message: 'Incorrect Password' }, message: null })


    } catch (e) {
        console.log("Error");
        console.log(e);
        return res.status(400).send({
            message: JSON.parse(e),
        });
    }
}

exports.register = async (req, res) => {
    try {
        if(req.body.confirm_password == req.body.password){
            const user = new User({ email: req.body.email, password: req.body.password, fullname: req.body.fullname });
            await user.save();
            res.redirect('/login/?message=Account created - please sign in')
        }
        else{
            console.log("Passwords don't match");
            res.render('register', { _pageName: "register", errors: { message: "passwords don't match" }});
        }
    } catch (e) {
        console.log("error: ---")
        console.log(e);
        if (e.error || e.errors) {
            console.log("mongoose error");
            res.render('register', { _pageName: "register", errors: e.error || e.errors || e.MongoError})
            return;
        }
        else if((e.name==='MongoError' || e.name ==='MongoServerError') && e.code === 11000 ){
            res.render('register', { _pageName: "register", errors: {message: "Duplicate Email Error"}})
            return;
        }
        return res.status(400).send({
            message: JSON.parse(e),
        });
    }
}