const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());

app.get("/api/users", (req, res) => {
  res.json({ users: ["userOne", "userTwo", "userThree"] });
});

app.get("/api/admins", (req, res) => {
  res.json({ admins: ["Serhat", "Özgür"] });
});

app.get("/api/exres", (req, res) => {
   fetch("https://api.spoonacular.com/recipes/{716429}/information")
   .then(function(response){
	   res.json(response);
   });
});

app.listen(8080, () => console.log("Server started on port 5000"));
