var express = require("express");
var app = express();
var morgan = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var engine = require('ejs-mate');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var flash = require('express-flash');
var MongoStore = require('connect-mongo/es5')(session);
var passport = require('passport');
var User = require('./models/user');
var Category = require('./models/category');
var secret = require('./config/secret');
mongoose.connect(secret.database,function(err){
	if(err){
		console.log(err);
	}
	else
	{
		console.log('connected to the Database');
	}
});
app.set('port', (process.env.PORT || 5000));



//middleware
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
app.use(session({
	resave:true,
	saveUninitialized:true,
	secret:secret.secretKey,
  store: new MongoStore({url: secret.database, autoReconnect:true})
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req,res,next){
	res.locals.user = req.user;
	next();
});
app.use(function(req,res,next){
	Category.find({},function(err, categories){
		if(err) return next(err);
		res.locals.categories = categories;
		next();
	});
});


app.engine('ejs',engine);
app.set('view engine','ejs');

var mainRoutes = require('./routes/main');
var userRoutes = require('./routes/user');
var adminRoutes = require('./routes/admin');
var apiRoutes = require('./api/api');
app.use(mainRoutes);
app.use(userRoutes);
app.use(adminRoutes);
app.use('/api',apiRoutes);
app.post('/create',function(req, res, next){
var user = new User();

user.profile.name = req.body.name;
user.password = req.body.password;
user.email = req.body.email;

user.save(function(err){
	if(err) next(err);
	res.json('Successfully created a new user');
});
});
app.listen(app.get('port'),function(){
	console.log('Node app on port' + app.get('port'));
});



/*app.get('/',function(req,res){
    var name = "Jatin";
    res.json("My name is" + name);
});*/
// app.listen(secret.port,function(err){
//     if(err) throw err;
//     console.log("App is running on port " + secret.port);
// });

//mongousername=jkmongodb
//mongopassword=mongo123
//Dbname = mongoecomm
//dbusername=mongojk
//dbpassword=mongo123
