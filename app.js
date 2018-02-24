var express = require('express');
var mysql = require('mysql');
var app = express();
var bodyParser =    require("body-parser");
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.use(express.static(__dirname));
var LocalStorage = require('node-localstorage').LocalStorage,
localStorage = new LocalStorage('./.scratch');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'vishal',
  port      : 3306,
  password : 'vishal',
  database : 'DBMSMiniProject'
});

connection.connect();

app.get("/", function(req, res) {
    res.render("index.ejs");
});
app.get("/loggedIn/farmer", function(req, res) {
	res.render("farmer.ejs");
});

app.get("/loggedIn/commercial", function(req, res) {
	res.render("commercial.ejs");
});

app.get("/loggedIn/truck", function(req, res) {
	
	res.render("truck.ejs");
});
app.get("/loggedIn/Farmer/submit", function(req,res) {
	var a = localStorage.getItem("FSource");
	var b = localStorage.getItem("FDestination");
	res.render("confirm.ejs",{a:a,b:b});
});
app.get("/loggedIn/Commercial/submit", function(req,res) {
	var a = localStorage.getItem("CSource");
	var b = localStorage.getItem("CDestination");
	res.render("confirm.ejs",{a:a,b:b});
});
app.get("/loggedIn/gps", function(req,res) {
	res.render("gps.ejs");
});
app.get("/InvalidCredentials", function(req,res) {

	res.render("<h1> <center> Invalid Credentials, Pls Login Again <center> </h1>")
});
app.get("/loggedIn/admin", function(req,res) {
	res.render("admin.ejs")
	
});

app.get("/TData", function(req,res){
	connection.query("select * from Truck", function(err,results){
		if(err){
			console.log(err);
		}
		else{
			res.send(results);	
		}
	});
});
app.post("/loggedIn", function(req, res) {


	var a = req.body.uname;
	var b = req.body.pass;
	connection.query("select Type from Auth where Username=\""+a+"\" and Password=\""+b+"\"", function(err, results) {
		if(err) {
			console.error(err);
			
		}
		else{
			if(results[0].Type==="f"){
				res.redirect("/loggedIn/farmer");
				localStorage.setItem("loggedIn","yes");
			}
			else if(results[0].Type==="c"){
				res.redirect("/loggedIn/commercial");
				localStorage.setItem("loggedIn","yes");
			}
			else if(results[0].Type==="d"){
				res.redirect("/loggedIn/truck");
				localStorage.setItem("loggedIn","yes");
			}
			else if(results[0].Type==="a"){
				res.redirect("/loggedIn/admin");
			}
			else {
				res.render("/InvalidCredentials");
			}
		localStorage.setItem("Type",results[0].Type);
		console.log(results);
		}
	});

});

app.post("/submitFarmer", function(req,res) {
	var a = req.body.source;
	var b = req.body.dest;
	var f1=0,f2=0;
	connection.query("insert into Farmer(Source,Destination) values(\""+a+"\",\""+b+"\")", function(err,results){
		if(err){
			console.log(err);
			return;
		}
		else{
			console.log(results);
		}
	});

	localStorage.setItem("FSource",a);
	localStorage.setItem("FDestination",b);
	res.redirect("/loggedIn/Farmer/submit");

});
app.post("/submitCommercial", function(req,res) {
	var a = req.body.source;
	var b = req.body.dest;
	var f1=0,f2=0;
	connection.query("insert into Commercial(Source,Destination) values(\""+a+"\",\""+b+"\")", function(err,results){
		if(err){
			console.log(err);
			return;
		}
		else{
			console.log(results);
		}
	});

	localStorage.setItem("CSource",a);
	localStorage.setItem("CDestination",b);
	res.redirect("/loggedIn/Commercial/submit");

});
app.post("/rtlTracking",function(req,res) {

	var srcF = localStorage.getItem("FSource");
	var destF = localStorage.getItem("FDestination");

	var srcC = localStorage.getItem("CSource");
	var destC = localStorage.getItem("CDestination");

	var Type = localStorage.getItem("Type");

	if(Type ==="f"){
		connection.query("insert into Truck (Source,Destination,AcceptedRide) values(\""+srcF+"\",\""+destF+"\",\"Yes\")",function (err,results) {
			if(err){
				console.log(err);
			}
			else{
				console.log(results);
			}
		});	
	}
	else if(Type==="c"){
		connection.query("insert into Truck (Source,Destination,AcceptedRide) values(\""+srcC+"\",\""+destC+"\",\"Yes\")",function (err,results) {
			if(err){
				console.log(err);
			}
			else{
				console.log(results);
			}
		});
	}
	else if(Type==="d"){
		res.redirect("/loggedIn/gps");
	}
	res.redirect("/loggedIn/gps");
});
app.post("/Delete", function(req,res){
	connection.query("delete from Truck where ID="+req.body.ID+";",function(err,results){
		if(err){
			console.log(err);
		}
		else{
			console.log(results);
		}
	});
});	
app.post("/Update",function(req,res){
	var leni=req.body.data.length;
	var lenj=4;

	connection.query("delete from Truck", function(err,results){
		if(err){
			console.log(err);
		}
		else{
			console.log(results);
		}
	});
	for(i=0;i<leni;i++){
			connection.query("insert into Truck values("+req.body.data[i][0]+",\""+req.body.data[i][1]+"\",\""+req.body.data[i][2]+"\",\""+req.body.data[i][3]+"\")",function (err,results) {
				if(err){
					console.log(err);
				}
				else{
					console.log(results);
				}
			});
	}
});
app.get("*", function(req, res) {
	res.send("<h1>Invalid URL!</h1>");
});
app.listen(3000, "localhost", function() {
    console.log("Server started on port number 3000...");
});
