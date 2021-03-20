var admin = require('firebase-admin');

const path = require('path');
const express = require('express');
const app = express();
const port = 3000;


const bodyParser = require('body-parser');

const shorthash = require('short-hash');


app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.engine('html', require('ejs').renderFile);
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

const home_url = "http://localhost:3000/re/";

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
console.log(req.body);

//get the url
const original_url = req.body.url;

//Generate hash of the url
const hash = shorthash(original_url)+"";

//Store value in firebase
var ref = db.ref("/hash/").set({[hash]:original_url})

console.log("Sending response");
res.send(JSON.stringify({hash:home_url+hash}))

})

app.get('/re/:hash',(req,res)=>{
//get the hashcode
var hash = req.params.hash;
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
                  //redirect to the original url
                  res.redirect(original_url);
                })
           
});


app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})