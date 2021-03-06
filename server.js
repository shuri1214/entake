/**
* This is the main Node.js server script for your project
* Check out the two endpoints this back-end API provides in fastify.get and fastify.post below
*/

const path = require("path");

// Require the fastify framework and instantiate it
const fastify = require("fastify")({
  // Set this to true for detailed logging:
  logger: false
});

// ADD FAVORITES ARRAY VARIABLE FROM TODO HERE
const crypto = require("crypto");
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("./dbs/icons.db");
const sql = require("./src/sql.json");

// Setup our static files
fastify.register(require("fastify-static"), {
  root: path.join(__dirname, "public"),
  prefix: "/" // optional: default '/'
});

// fastify-formbody lets us parse incoming forms
fastify.register(require("fastify-formbody"));

// point-of-view is a templating manager for fastify
fastify.register(require("point-of-view"), {
  engine: {
    handlebars: require("handlebars")
  }
});

// Load and parse SEO data
const seo = require("./src/seo.json");
if (seo.url === "glitch-default") {
  seo.url = `https://${process.env.PROJECT_DOMAIN}.glitch.me`;
}

/**
* Our home page route
*
* Returns src/pages/index.hbs with data built into it
*/
fastify.get("/", function(request, reply) {
  let params = { seo: seo };
  reply.view("/src/pages/index.hbs", params);
});

fastify.get("/setuser", function(request, reply) {
  let params = { seo: seo,'get':{}};
  reply.view("/src/pages/user.hbs", params);
});

fastify.get("/switch/:user", function(request, reply) {
  let params = { seo: seo};
  db.run(sql.delete);// clean obsoleted (unnecessary serialized)
  reply.view("/src/pages/buttons.hbs", params);
});

fastify.get("/bgscene/:hash", function(request, reply) {
  let params = { seo: seo,"hash":request.params.hash};
  db.run(sql.deleteuser,request.params.hash);// clean obsoleted (unnecessary serialized)
  reply.view("/src/pages/bgscene.hbs", params);
});

fastify.get("/nigiyaka/:hash", function(request, reply) {
  db.serialize(() => {
    var pre = db.prepare(sql.geticon);
    pre.bind([request.query['code'],request.params.hash],function(){
      pre.get((err, rows) => {
        reply
          .code(200)
          .header("Content-Type","application/json; charset=utf-8")
          .send(JSON.stringify(rows));
      });
    });
  })
  
  db.run(sql.delete);// clean obsoleted (unnecessary serialized)
});

fastify.get("/getuser/:user", function(request, reply) {
  db.serialize(() => {
    var info = db.prepare(sql.userinfo);
    info.bind(request.params.user,function(){
      info.get((err, rows) => {
        reply
          .code(200)
          .header("Content-Type","application/json; charset=utf-8")
          .send(JSON.stringify(rows));
      });
    });
    var upd = db.prepare(sql.userupd);
    upd.run(request.params.user);
    upd.finalize();
  })
  db.close();
});


/**
* Our POST route to handle and react to form submissions 
*
* Accepts body data indicating the user choice
*/
fastify.post("/setuser", function(request, reply) {
  let params = { seo: seo ,
                'post': {
                  'username':request.body.username,
                  'buttonpage':seo.url+'/switch/'+request.body.username,
                  'streambaseurl':seo.url+'/bgscene/'
                }};
  db.serialize(() => {
    var sec = require('./src/secret.js');
    var hash = crypto.createHash('md5').update(request.body.username + sec.item).digest('hex');
    var st = db.prepare(sql.userregid);
    st.run([request.body.username, hash]);
    st.finalize();
  });
  db.close();
  reply.view("/src/pages/user.hbs", params);
});

fastify.post("/switch/:user", function(request, reply) {
  let params = { seo: seo ,"post": request.body};
  db.serialize(() => {
    var preins = db.prepare(sql.insert);
    preins.run([request.body.icon,request.params.user]);
    preins.finalize();  
  })
  reply.view("/src/pages/buttons.hbs", params);
});

// Run the server and report out to the logs
fastify.listen(process.env.PORT, '0.0.0.0', function(err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Your app is listening on ${address}`);
  fastify.log.info(`server listening on ${address}`);
});
