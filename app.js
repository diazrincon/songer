let args = process.argv.slice(2);
var express = require("express");
var app = express();
var axios = require("axios");
var logger = require("morgan");
var path = require("path");
var fs = require("fs");
var mediaserver = require("mediaserver");
var multer = require("multer");

app.use(express.static("public"));
app.use(logger("dev"));
app.use(express.json());

let argHost = args[0];
let argPort = args[1];
let localSongs = [];
let songs = [];
const songsFolder = path.join(__dirname, "songs");

let multerOptions = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "songs"));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

let upload = multer({ storage: multerOptions });

const updateLocalSongs = () => {
  localSongs = [];
  fs.readdirSync(songsFolder).forEach(song => {
    localSongs.push({ name: song });
  });
};

const updateRemoteSongs = () => {
  axios.get(argHost  + '/songs')
  .then(function (response) {
    songs = response.data;
    console.log(response.data);
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })
  .then(function () {
    // always executed
  });
};

const joinHost = () =>  {
  axios
    .post(argHost + '/join')
    .then(function(response) {
      console.log('Connected to middleware!');
    })
    .catch(function(error) {
      console.log('Error while connecting middleware!');
    });
};

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"));
});

app.post("/upload", (req, res) => {
  axios
    .post(argHost + '/upload', {
      name: req.body.name,
      src: req.body.src
    })
    .then(function(response) {
      res.sendStatus(200);
    })
    .catch(function(error) {
      console.log('Upload Error!');
    });
});


app.get("/songs", (req, res) => {
  res.send(songs);
});

app.get("/pow", (req, res) => {
  res.json({ pow: Math.random() });
});

app.post('/song', (req, res) =>   {
  var song = req.body;
  console.log(req.body);
  console.log('Upcomming song! ' + song.name + ' from ' + song.src);
  res.sendStatus(200);
});

app.post('/songs', (req, res) =>   {
  var updatedSongs = req.body;
  console.log('Upcomming songs! Updating...');
  songs = updatedSongs;
  console.log(songs)
  res.sendStatus(200);
});

app.get('/songs/:name', function (req, res) {
  var song = path.join(__dirname, 'songs', req.params.name);
  mediaserver.pipe(req, res, song);
});

app.listen(argPort, '0.0.0.0', () => {
  console.log("Server running on port " + argPort);
  console.log(argHost);
  updateLocalSongs();
  updateRemoteSongs();
  joinHost();
});
