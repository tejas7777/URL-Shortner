var admin = require('firebase-admin');

const path = require('path');
const express = require('express');
const app = express();
const port = 3000;
const localh = '127.0.0.1'
//Cache
const responseTime = require('response-time')
const axios = require('axios');
const redis = require('redis');

const client = redis.createClient(6379);

const shorthash = require('short-hash');

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.engine('html', require('ejs').renderFile);
const bodyParser = require('body-parser');
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

//const home_url = "http://localhost:3000/re/";

const serviceAccount = require("./ServiceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://urlshort-46c78-default-rtdb.firebaseio.com"
});

//Get the db object
const db = admin.database();

// Use middleware to set the default Content-Type
app.use(function (req, res, next) {
  res.header('Content-Type','application/json');
  next();
});

//Default route
app.get('/', (req, res) => {
  res.header('Content-Type','text/html');
  res.render('index.html')
})

app.post('/generate',(req,res) => {
console.log("Reached here")
//generates a hashed URL

//get the url
const original_url = req.body.url;

//Generate hash of the url
const hash = (shorthash(original_url)+"").slice(4);

//Store value in firebase
var ref = db.ref("/hash/").set({[hash]:original_url})

var base_url = req.protocol+"://"+req.headers.host+"/re/";
console.log(base_url)
console.log("Sending response");
res.send(JSON.stringify({hash:base_url+hash}))

})

app.get('/re/:hash',(req,res)=>{
//get the hashcode
var hash = req.params.hash;
console.log(hash)

client.on('connect', function() {
  console.log('cache connected');
}).on('error', function (error) {
  console.log(error);
});

//Check if key is in cache
client.exists(hash, function(err, reply) {
  if (reply===0) {
    //Doesn't exist, call fireabse
    //read the hash key value pair from firebase
      var ref = db.ref('/hash').once('value')
              .then((snapshot)=>{
                  var values = snapshot.val();
                  var original_url;
                  snapshot.forEach((item)=>{
                  if(item.key==hash){
                      original_url = item.val();
                      console.log(original_url);
                      //Set redis key value
                      client.set(hash,original_url);
                    }
                  })
                  return original_url;
                }).then((original_url)=>{
                  //redirect to the original url
                  console.log('original url',original_url)
                  res.redirect(original_url);
                })
        } else {
          //redirect
          
          client.get(hash,(err,reply)=>{
            res.redirect(reply);
          }) 
      }
});


           
});


app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})