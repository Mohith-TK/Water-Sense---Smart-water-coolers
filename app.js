const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
var mqtt = require("mqtt");
var client = mqtt.connect("mqtt://test.mosquitto.org");

client.on("connect", function () {
  client.subscribe("presence", function (err) {
    if (!err) {
      client.publish("presence", "Hello mqtt");
    }
  });
});

client.on("message", function (topic, message) {
  // message is the data recieved from the sensors
  console.log(message.toString());
  client.end();
});

const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/adminDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const dataSchema = new mongoose.Schema({
  content: String,
});

const adminSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const Data = new mongoose.model("Data", dataSchema);

const User = new mongoose.model("User", adminSchema);

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/signin.html");
});

app.post("/", function (req, res) {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email }, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        if (foundUser.password === password) {
          res.sendFile(__dirname + "/index.html");
        }
      }
    }
  });
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
