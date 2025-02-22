const fs = require('fs');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');
const app = express();
const port = 3000;
const moment = require ('moment');

/*sql*/
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "volmed_db"
});
con.connect(err => {
  if (err) throw err;
  console.log("Connected!");
});

app.use(bodyParser.urlencoded({extended:true}))

const routes = { 
    search: '/search', 
    register: '/register' 
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));


app.get("/", (req, res) => {
    res.render('index', {
        data: {title: "Главная страница"}
    })
})

app.post('/search', (req, res) => {
    const id = req.body.id; 
    const query = 'SELECT * FROM patients WHERE id = ?';
    
    con.query(query, [id], (err, results) => {
        if (err) throw err;
    
        console.log(results);

        if (results.length > 0) {
            const created_at = moment(results[0].created_at).format('DD.MM.YYYY HH:mm');
console.log(created_at);

            res.render('search', {
                data: results[0], 
                noResults: false,
                created_at: created_at
            });
        } else {
            // If no patient is found, render the search page with a no results message
            res.render('search', {
                data: null,
                noResults: true,
                created_at: null
            });
        }
    });
});

app.get('/partial/:section/:id', (req, res) => {
    const { section, id } = req.params;
    const query = 'SELECT * FROM patients WHERE id = ?';

    con.query(query, [id], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).send("Error fetching data.");
        }

        if (results.length === 0) {
            return res.status(404).send("Patient not found.");
        }

        const data = results[0];

        // Dynamically load the appropriate partial template
        const partialPath = `partials/${section}`;
        res.render(partialPath, { data });
    });
});

app.get('/patients', (req, res) =>{
  const query = 'SELECT * FROM patients';

  con.query(query, (err,results) =>{
    if (err) throw err;
    console.log(results)
    if (results.length>0) {
        console.log(results)
      res.render('patients', {
        data: results,
        title: "Список пациентов"
      })
    }
    else{
      res.send('No results');
    }
  })
})

app.get('/register', (req, res) =>{
    res.render('register', {
        data: "Новый пациент"
    })
})

app.post('/register', (req, res) =>{
    const {lastName, firstName, patr, sex, birthDay, phone, address, complaint, anam, life, status, diag, mkb, sop_zab, rec}=req.body;

    const query = "INSERT INTO patients (lastName, firstName, patr, sex, birthDay, phone, address, complaint, anam, life, status, diag, mkb, sop_zab, rec) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"

    con.query(query, [lastName, firstName, patr, sex, birthDay, phone, address, complaint, anam, life, status, diag, mkb, sop_zab, rec], (err,results) =>{
        if (err) {
            console.error("Database error:", err);
            return res.status(500).send("An error occurred while registering the user.");
        }
        res.redirect("/")
    })
})

app.get('/update/:id', (req, res) => {
    const { id } = req.params;

    const query = "SELECT * FROM patients WHERE id = ?";
    con.query(query, [id], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).send("An error occurred while retrieving the patient's data.");
        }

        if (results.length === 0) {
            return res.status(404).send("Patient not found.");
        }

        res.render('update', { data: results[0], id: req.params.id });
    });
});

app.post('/update/:id', (req, res) =>{
    console.log(req.body);
    const id = req.params.id;
    const {lastName, firstName, patr, sex, birthDay, phone, address, complaint, anam, life, status, diag, mkb, sop_zab, rec}=req.body;

    if (!id) {
        return res.status(400).send("Patient ID is missing");
    }

    const query = "UPDATE patients SET lastName=?, firstName=?, patr=?, sex=?, birthDay=?, phone=?, address=?, complaint=?, anam=?, life=?, status=?, diag=?, mkb=?, sop_zab=?, rec=? WHERE id = ?";

    con.query(query, [lastName, firstName, patr, sex, birthDay, phone, address, complaint, anam, life, status, diag, mkb, sop_zab, rec, id], (err,results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).send("An error occurred while updating the user.");
        }
        res.redirect("/patients")
    })
})

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});



app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));