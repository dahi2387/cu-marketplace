// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************

const express = require('express'); // To build an application server or API
const app = express();
const handlebars = require('express-handlebars');
const Handlebars = require('handlebars');
const path = require('path');
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcryptjs'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server
const nodemailer = require('nodemailer');

// *****************************************************
// <!-- Section 2 : Connect to DB -->
// *****************************************************

// create `ExpressHandlebars` instance and configure the layouts and partials dir.
const hbs = handlebars.create({
  extname: 'hbs',
  layoutsDir: __dirname + '/src/views/layouts',
  partialsDir: __dirname + '/src/views/partials',
});

// database configuration
const dbConfig = {
  host: process.env.HOST,      // Changed from hardcoded value to env variable
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
};

const db = pgp(dbConfig);


// Nodemailer
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

console.log('Email credentials being used:');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
// Don't log the full password in production, but for testing we can log a few characters
console.log('EMAIL_PASSWORD first 4 chars:', process.env.EMAIL_PASSWORD?.substring(0, 4));
console.log('EMAIL_PASSWORD length:', process.env.EMAIL_PASSWORD?.length);

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
  }
});

transporter.verify(function(error, success) {
  if (error) {
      console.log("Transporter error:", error);
  } else {
      console.log("Server is ready to take our messages");
  }
});

async function sendVerificationEmail(email, code) {
  const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Buff Market Email Verification',
      html: `
          <h1>Welcome to Buff Market!</h1>
          <p>Your verification code is: <strong>${code}</strong></p>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
      `
  };

  return transporter.sendMail(mailOptions);
}

// test your database
db.connect()
  .then(obj => {
    console.log('Database connection successful'); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });

// *****************************************************
// <!-- Section 3 : App Settings -->
// *****************************************************

// Register `hbs` as our view engine using its bound `engine()` function.
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'src/views'));
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.

// initialize session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(express.static(path.join(__dirname, 'src', 'resources')));

// *****************************************************
// <!-- Section 4 : API Routes -->
// *****************************************************

// Login Authentification
const auth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

// Home Routes
app.get('/', (req, res) => {
  res.render('pages/home',{ loggedIn: req.session.loggedIn });
});

// Register Routes
app.get('/register', (req, res) => {
  res.render('pages/register',{ loggedIn: req.session.loggedIn });
});

app.post('/register', async (req, res) => {
  const email = req.body.email;
  const emailPattern = /^[a-zA-Z0-9._%+-]+@colorado\.edu$/;

  if (!emailPattern.test(email)) {
      return res.status(400).send("Invalid email domain. Please use a colorado.edu email.");
  }

  try {
      // Generate and store verification code
      const code = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 15 * 60000); // 15 minutes from now

      await db.none(
          'INSERT INTO verification_codes (email, code, expires_at) VALUES ($1, $2, $3)',
          [email, code, expiresAt]
      );

      // Store password temporarily in session
      req.session.pendingRegistration = {
          email: email,
          password: req.body.password
      };

      // Send verification email
      await sendVerificationEmail(email, code);

      // Redirect to verification page
      res.redirect('/verify-email');
  } catch (err) {
      console.error(err);
      res.render('pages/register', {
          message: 'There was an error sending the verification email.'
      });
  }
});

// Verify Email
app.get('/verify-email', (req, res) => {
  if (!req.session.pendingRegistration) {
      return res.redirect('/register');
  }
  res.render('pages/verify-email', { email: req.session.pendingRegistration.email });
});

app.post('/verify-email', async (req, res) => {
  const { code } = req.body;
  const { email, password } = req.session.pendingRegistration;

  try {
      // Verify code
      const result = await db.oneOrNone(
          `SELECT * FROM verification_codes 
           WHERE email = $1 AND code = $2 AND used = FALSE 
           AND expires_at > CURRENT_TIMESTAMP
           ORDER BY created_at DESC LIMIT 1`,
          [email, code]
      );
      console.log(result);

      if (!result) {
          return res.render('pages/verify-email', {
              email: email,
              message: 'Invalid or expired verification code.'
          });
      }
      
      // Mark code as used
      await db.none(
          'UPDATE verification_codes SET used = TRUE WHERE id = $1',
          [result.id]
      );
      console.log("after update")
      // Create user account
      const hash = await bcrypt.hash(password, 10);
      await db.none(
          'INSERT INTO users (email, password) VALUES ($1, $2)',
          [email, hash]
      );
      console.log("after insert")
      // Clear pending registration
      delete req.session.pendingRegistration;
      console.log("got here");
      // Redirect to login
      res.redirect('/login');
  } catch (err) {
      console.error(err);
      res.render('pages/verify-email', {
          email: email,
          message: 'There was an error verifying your email.'
      });
  }
});

// Login Routes
app.get('/login', (req, res) => {
  res.render('pages/login',{ loggedIn: req.session.loggedIn });
});

app.post('/login', async (req, res) => {
  const query = "select * from users where users.email = $1 limit 1";
  const email = req.body.email;

  try {
    const user = await db.one(query, [email]);
    
    if (!user) {
      res.redirect('/register');
    }

    // check if password from request matches with password in DB
    const match = await bcrypt.compare(req.body.password, user.password);

    if (match) {
      //save user details in session like in lab 7
      req.session.user = user;
      req.session.save();
      res.redirect('/events');
    } else {
      res.render('pages/login', {
        message: `Incorrect username or password (Likely password).`,
      });
    }
  } catch (err) {
    console.log(err);
    // res.redirect('/register');
    res.render('pages/login', {
      message: 'Your username could not be found, or there was an error with your login.',
    });
  }
});

// Account Routes
app.get('/account', auth, (req, res) => {
  // Get username from email (everything before @)
  const username = req.session.user.email.split('@')[0];
  res.render('pages/account', {
    loggedIn: true, 
    username: username
  });
});

// Events Routes
app.get('/events', (req, res) => {
  res.render('pages/events', { loggedIn: req.session.user ? true : false });
});

app.get('/buy', auth, (req, res) => {
  res.render('pages/buy', { loggedIn: req.session.user ? true : false });
});

app.get('/sell', auth, (req, res) => {
  res.render('pages/sell', { loggedIn: req.session.user ? true : false });
});

app.get('/bid', auth, (req, res) => {
  // Get from database in the future
  // Also add a way to idetify which event to load info for based on eventID
  const event = {
      homeTeam: "CU",
      awayTeam: "UCLA",
      date: "Oct 28, 2024",
      time: "7:00 PM",
      location: "Folsom Field",
      marketPrice: "85.00",
      lowestAsk: "80.00",
      highestBid: "75.00",
      lastSale: "82.50",
      quickBidOptions: [70, 75, 80]
  };

  // Render the bid page template with the event data
  res.render('pages/bid', {event, loggedIn: req.session.user ? true : false });
});

// Logout Routes
app.get('/logout', (req, res) => {
  const renderData = { loggedIn: false };
  req.session.destroy();
  res.render('pages/logout', renderData);
});

// Lab 11 Stub
app.get('/welcome', (req, res) => {
  res.json({status: 'success', message: 'Welcome!'});
});


app.post('/place-bid', (req, res) => {
  const { bidAmount, quantity, expiration } = req.body;
  
  // Add bid processing logic later

  res.redirect('/confirmation');
});

// Confirmation Page
app.get('/confirmation/:orderId?', async (req, res) => {
      //fetch this data from your database using the orderId from req.params.orderId
      const transactionData = {
          event: {
              homeTeam: "CU",
              awayTeam: "UCLA",
              date: "Oct 28, 2024",
              time: "7:00 PM",
              location: "Folsom Field"
          },
          transaction: {
              orderId: "ORD-" + req.params.orderId,
              date: new Date().toLocaleDateString(),
              paymentMethod: "Credit Card",
              quantity: 2,
              pricePerTicket: "85.00",
              subtotal: "170.00",
              serviceFee: "17.00",
              total: "187.00"
          }
      };

      res.render('pages/confirmation', transactionData);
});

app.get('/about', (req, res) => {
  res.render('pages/about');
});

app.get('/tickets', async (req, res) => {
  const query = "select * from Tickets;"

  try {
    const tickets = await db.any(query);
    res.render('pages/tickets', {
      tickets
    });
  } catch {
    console.err(err);
    res.status(500);
  }
});

// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests

module.exports = app.listen(3000);
console.log('Server is listening on port 3000');
