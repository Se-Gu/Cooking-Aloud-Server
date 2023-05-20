const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());

const apiKey = "86b00266fbc34fd8be501c09567ae835";

app.get("/api/users", (req, res) => {
  res.json({ users: ["userOne", "userTwo", "userThree"] });
});

app.get("/api/admins", (req, res) => {
  res.json({ admins: ["Serhat", "Özgür"] });
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

app.listen(8080, () => console.log("Server started on port 5000"));
