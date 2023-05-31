const express = require("express");
const cors = require("cors");
const app = express();

var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
const jwt = require("jsonwebtoken");

const dotenv = require('dotenv');
dotenv.config();

var mysql = require('mysql2');
let con = mysql.createConnection({
    host: 'db-mysql-fra1-20737-do-user-12533753-0.b.db.ondigitalocean.com',
    user: 'doadmin',
	port: 25060,
    password: 'AVNS_TyP_aTfi4c5egU12ZLl',
    database: 'cookingaloud'
});

con.connect(function(err) {
	if (err) {
		return console.error('error: ' + err.message);
	}
});

app.use(express.urlencoded());

app.set('view engine', 'pug');
app.set('views', './views');

// for parsing application/json
app.use(bodyParser.json()); 

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 
//form-urlencoded

// for parsing multipart/form-data
app.use(upload.array()); 
app.use(express.static('public'));

app.use(cors());

const apiKey = "86b00266fbc34fd8be501c09567ae835";

app.get("/api/users", (req, res) => {
  res.json({ users: ["userOne", "userTwo", "userThree"] });
});

app.get("/api/admins", (req, res) => {
  res.json({ admins: ["Serhat", "Özgür"] });
});

app.get("/api/dtest", (req, res) => {
	const query =
	"CREATE TABLE `USERS` (`id` INT(20) NOT NULL AUTO_INCREMENT, `email` VARCHAR(50), `password` VARCHAR(20), `favorite_meals` VARCHAR(10000), PRIMARY KEY (`id`));";
	con.query(query, function (err, result) {
		if (err) throw err;
		console.log("Result: " + result);
	});
});

app.get("/api/recipe/:rId", async (req, res) => {
	try {
		let rId = req.params["rId"]
		var url = new URL("https://api.spoonacular.com/recipes/" + rId + "/information?");
		url.searchParams.append("apiKey", apiKey);
		url.searchParams.append("includeNutrition", false);
		const response = await fetch(url);
		const data = await response.json();
		res.send(data);
	} catch (error) {
		console.error(error);
		res.status(500).send("Internal Server Error");
	}
});

app.get("/api/recipesearch/:query", async (req, res) => {
	try {
		let query = req.params["query"];
		var url = new URL("https://api.spoonacular.com/recipes/complexSearch?");
		url.searchParams.append("apiKey", "86b00266fbc34fd8be501c09567ae835");
		url.searchParams.append("query", query);
		url.searchParams.append("number", 10);
		const response = await fetch(url);
		const data = await response.json();
		res.send(data);
	} catch (error) {
		console.error(error);
		res.status(500).send("Internal Server Error");
	}
});

app.get("/api/instruction/:rId", async (req, res) => {
	try {
		let rId = req.params["rId"]
		var url = new URL("https://api.spoonacular.com/recipes/" + rId + "/analyzedInstructions?");
		url.searchParams.append("apiKey", apiKey);
		url.searchParams.append("stepBreakdown", true);
		const response = await fetch(url);
		const data = await response.json();
		
		steps = [];
		//console.log(data[0]["steps"]);
		
		for(let i in data[0]["steps"]){
			steps.push(data[0]["steps"][i]["step"]);
		}
		console.log(steps);
		
		res.send(steps);
	} catch (error) {
		console.error(error);
		res.status(500).send("Internal Server Error");
	}
});

app.post('/api/register', (req, res) => {
	let email = req.body.email;
	let password = req.body.password;
	const query =
	"SELECT * FROM USERS WHERE email = '" + email + "'";
	con.query(query, function (err, result) {
		if (err) throw err;
		if (result[0] == null){
			const query2 =
			"INSERT INTO USERS (email, password, favorite_meals) VALUES ('" + email + "', '" + password + "', '');";
			con.query(query2, function (err, result2) {
				if (err) throw err;
				let token;
				try {
					token = jwt.sign(
					{ userId: result2.insertId, userEmail: email },
					process.env.TOKEN_SECRET,
					{ expiresIn: "1h" }
					);
				} catch (err) {
					const error = new Error("Error! Something went wrong.");
					return next(error);
				}
				res.status(200).json({
					success: true,
					data: {userId: result2.insertId, userEmail: email, token: token },
				});
			});
		}
		else{
			res.status(200).json({
				success: false,
				data: {message: "This email is already registered!"}
			});
		}
	});	
	
	//res.send(`Email: ${email} Password: ${password}`);
});

app.post('/api/login', (req, res) => {
	let email = req.body.email;
	let password = req.body.password;
	const query =
	"SELECT * FROM USERS WHERE email = '" + email + "' AND password = '" + password + "'";
	con.query(query, function (err, result) {
		if (err) throw err;
		if (result[0] != null){
			let token;
			try {
				//Creating jwt token
				token = jwt.sign(
				  { userId: result[0].id, userEmail: result[0].email },
				  process.env.TOKEN_SECRET,
				  { expiresIn: "1h" }
				);
			} catch (err) {
				console.log(err);
				const error = new Error("Error! Something went wrong.");
				return next(error);
			}
 
			res.status(200).json({
				  success: true,
				  data: {userId: result[0].id, userEmail: result[0].email, token: token},
			});
		}
		else{
			res.status(200).json({
				success: false,
				data: {message: "Email or password is incorrect!"}
			});
		}
	});	
	
	//res.send(`Email: ${email} Password: ${password}`);
});

app.post('/api/addfavorite', (req, res) => {
	let newFavorite = req.body.mealid;
	const token = req.headers.authorization.split(' ')[1]; 
    if(!token){
        res.status(200).json({success:false, message: "Error! Token was not provided."});
    }
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET );
	var email = decodedToken.userEmail;
	//res.status(200).json({success:true, data:{userId:decodedToken.userId, userEmail:decodedToken.userEmail}});   
	const query = "SELECT * FROM USERS WHERE email = '" + email + "'";
	con.query(query, function (err, result) {
		if (err) throw err;
		if (result[0] != null){
			var favoriteMeals = result[0].favorite_meals;
			if (favoriteMeals == ""){
				favoriteMeals = newFavorite;
			}
			else{
				favoriteMeals = favoriteMeals + "/" + newFavorite;
			}
			const query2 = "UPDATE USERS SET favorite_meals = '" + favoriteMeals + "' WHERE email = '" + email + "'";
			con.query(query2, function (err, result2) {
				if (err) throw err;
				res.status(200).json({
				  success: true,
				  data: {message: "Favorite meal added successfully!"}
				});
			});
		}
		else{
			res.status(200).json({
				success: false,
				data: {message: "User not found!"}
			});
		}
	});
	
	//res.send(`Email: ${email} Password: ${password}`);
});

app.post('/api/removefavorite', (req, res) => {
	let remFavorite = req.body.mealid;
	const token = req.headers.authorization.split(' ')[1]; 
    if(!token){
        res.status(200).json({success:false, message: "Error! Token was not provided."});
    }
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET );
	var email = decodedToken.userEmail;
	//res.status(200).json({success:true, data:{userId:decodedToken.userId, userEmail:decodedToken.userEmail}});   
	const query = "SELECT * FROM USERS WHERE email = '" + email + "'";
	con.query(query, function (err, result) {
		if (err) throw err;
		if (result[0] != null){
			var favoriteMeals = result[0].favorite_meals;
			const mealList = favoriteMeals.split("/");
			if (mealList.includes(remFavorite)){
				
			}
			const query2 = "UPDATE USERS SET favorite_meals = '" + favoriteMeals + "' WHERE email = '" + email + "'";
			con.query(query2, function (err, result2) {
				if (err) throw err;
				res.status(200).json({
				  success: true,
				  data: {message: "Favorite meal added successfully!"}
				});
			});
		}
		else{
			res.status(200).json({
				success: false,
				data: {message: "User not found!"}
			});
		}
	});
	
	//res.send(`Email: ${email} Password: ${password}`);
});

app.get('/api/getfavorite', (req, res) => {
	const token = req.headers.authorization.split(' ')[1]; 
	console.log(req.headers);
    if(!token){
        res.status(200).json({success:false, message: "Error! Token was not provided."});
    }
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET );
	var email = decodedToken.userEmail;
	//res.status(200).json({success:true, data:{userId:decodedToken.userId, userEmail:decodedToken.userEmail}});   
	const query = "SELECT * FROM USERS WHERE email = '" + email + "'";
	con.query(query, function (err, result) {
		if (err) throw err;
		if (result[0] != null){
			var favoriteMeals = result[0].favorite_meals;
			const mealList = favoriteMeals.split("/");
			res.status(200).json({
				success: true,
				data: {favmeals: mealList}
			});
				
		}
		else{
			res.status(200).json({
				success: false,
				data: {message: "User not found!"}
			});
		}
	});
	
	//res.send(`Email: ${email} Password: ${password}`);
});
	


app.listen(8080, () => console.log("Server started on port 5000"));
