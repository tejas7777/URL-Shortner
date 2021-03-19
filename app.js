var admin = require('firebase-admin');


const express = require('express');
const app = express();
const port = 3000;


const bodyParser = require('body-parser');

const shorthash = require('short-hash');

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.set('views', __dirname + '/res');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');


const home_url = "http://localhost:3000/";

const serviceAccount = require("./ServiceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://urlshort-46c78-default-rtdb.firebaseio.com"
});

//Get the db object
const db = admin.database();

// Use middleware to set the default Content-Type
app.use(function (req, res, next) {
  res.locals.url = req.originalUrl;
  res.locals.host = req.get('host');
  res.locals.protocol = req.protocol;
  res.header('Content-Type', 'application/json');
  next();
});

app.get('/', (req, res) => {
  res.render('index.html')
})

app.post('/generate',(req,res) => {
//generates a hashed URL

//get the url
const original_url = req.body.url;

//console.log(nanoid(req.body.message));
const hash = shorthash(original_url)+"";

//Store value in firebase
var ref = db.ref("/hash/").set({[hash]:original_url})

res.send(JSON.stringify({hash:home_url+hash}))

})

app.get('*',(req,res)=>{
var full_url= res.locals.url;

//get the hashcode
var hash = full_url.split('/')[1];
console.log(hash)

//read the hash key value pair from firebase
var ref = db.ref('/hash').once('value')
                .then((snapshot)=>{
                  var values = snapshot.val();
                  var original_url;
                  snapshot.forEach((item)=>{
                    if(item.key==hash){
                      original_url = item.val();
                    }
                  })
                  return original_url;
                }).then((original_url)=>{
                  res.redirect(original_url);
                })
           
});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})