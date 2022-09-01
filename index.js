const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const path = require("path");
const axios = require("axios");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;

app.set("port", process.env.PORT || 8099);
const PORT = app.get("port");
app.use(express.json());
app.use(cors());

let db = null;
MongoClient.connect(process.env.MONGO_URL, { useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.log(err);
  }
  db = client.db("voca-app");
});

app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("hello voca-server");
});

app.get("/days", (req, res) => {
  db.collection("days")
    .find()
    .toArray((err, result) => {
      res.json(result);
    });
});
app.post("/days/add", (req, res) => {
  db.collection("counter").findOne({ name: "count" }, (err, result) => {
    const insertData = {
      day: req.body.day,
      id: result.daysTotal,
    };
    db.collection("days").insertOne(insertData, (err, result) => {
      db.collection("counter").updateOne({ name: "count" }, { $inc: { daysTotal: 1 } }, (err, result) => {
        if (err) {
          console.log(err);
        }
        res.json({ statusText: "OK" });
      });
    });
  });
});
app.get("/voca/:day", (req, res) => {
  const _day = parseInt(req.params.day);
  db.collection("vocas")
    .find({ day: _day })
    .toArray((err, result) => {
      res.json(result);
    });
});
app.put("/voca/:id", (req, res) => {
  const _id = parseInt(req.params.id);
  const _isDone = req.body.isDone;
  db.collection("vocas").updateOne({ id: _id }, { $set: { isDone: _isDone } }, (err, result) => {
    if (err) {
      console.log(err);
    }
    res.json({ done: "OK" });
  });
});
app.delete("/voca/:id", (req, res) => {
  const _id = parseInt(req.params.id);
  db.collection("vocas").deleteOne({ id: _id }, { $set: { id: -1 } }, (err, result) => {
    if (err) {
      console.log(err);
    }
    res.json({ delete: "OK" });
  });
});
app.post("/voca/add", (req, res) => {
  db.collection("counter").findOne({ name: "count" }, (err, result) => {
    const insertData = {
      day: req.body.day,
      eng: req.body.eng,
      kor: req.body.kor,
      isDone: req.body.isDone,
      id: result.vocasTotal,
    };
    db.collection("vocas").insertOne(insertData, (err, result) => {
      db.collection("counter").updateOne({ name: "count" }, { $inc: { vocasTotal: 1 } }, (err, result) => {
        if (err) {
          console.log(err);
        }
        res.json({ statusText: "OK" });
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`${PORT}에서 서버 대기중`);
});
