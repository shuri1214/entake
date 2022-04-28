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
  
  // params is an object we'll pass to our handlebars template
  let params = { seo: seo };
  
  // If someone clicked the option for a random color it'll be passed in the querystring
  if (request.query.randomize) {
    
    // We need to load our color data file, pick one at random, and add it to the params
    const colors = require("./src/colors.json");
    const allColors = Object.keys(colors);
    let currentColor = allColors[(allColors.length * Math.random()) << 0];
    
    // Add the color properties to the params object
    params = {
      color: colors[currentColor],
      colorError: null,
      seo: seo
    };
  }
  
  // The Handlebars code will be able to access the parameter values and build them into the page
  reply.view("/src/pages/index.hbs", params);
});

fastify.get("/switch", function(request, reply) {
  let params = { seo: seo,"post":{}};
  
  // obsolete data clean not 
  db.run("delete from posted where posttime < strftime('%Y%m%d%H%M%S')-600");
  
  reply.view("/src/pages/buttons.hbs", params);
});


fastify.get("/bgscene", function(request, reply) {
  let params = { seo: seo};
  reply.view("/src/pages/bgscene.hbs", params);
});

fastify.get("/nigiyaka", function(request, reply) {
    db.serialize(() => {
    var pre = db.prepare(sql.geticon);
    pre.bind(request.query['code'],function(){
      pre.get((err, rows) => {
        reply
          .code(200)
          .header("Content-Type","application/json; charset=utf-8")
          .send(JSON.stringify(rows));
      });
    });
  })
  
});


/**
* Our POST route to handle and react to form submissions 
*
* Accepts body data indicating the user choice
*/
fastify.post("/switch", function(request, reply) {
  let params = { seo: seo ,"post": request.body};
  db.serialize(() => {
    var preins = db.prepare(sql.insert);
    preins.run([request.body.icon]);
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
