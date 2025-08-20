const express = require('express');
const axios = require('axios');
const app = express();

require('dotenv').config();

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// * Please DO NOT INCLUDE the private app access token in your repo. Don't do this practicum in your normal account.
const PRIVATE_APP_ACCESS = process.env.ACCESS_TOKEN;

const petsAPIName = 'p_pets';

let petData = [];

// TODO: ROUTE 1 - Create a new app.get route for the homepage to call your custom object data. Pass this data along to the front-end and create a new pug template in the views folder.

app.get('/', async (req, res) => {
    const pets = `https://api.hubapi.com/crm/v3/objects/${petsAPIName}?properties=name,pet_type,date_of_birth`;
    
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    }
    try {
        const resp = await axios.get(pets, { headers });
        petData = resp.data.results;
        res.render('homepage', { title: 'Pets Table | Integrating With HubSpot I Practicum', petData });      
    } catch (error) {
        console.error(error);
    }
});

// TODO: ROUTE 2 - Create a new app.get route for the form to create or update new custom object data. Send this data along in the next route.

app.get('/update-cobj', (req, res) => {
    let existingPet = null;

    // If pet query exists, we are updating and need to get the existing pet data
    if (req.query.pet) {
        existingPet = petData.find(pet => pet.id === req.query.pet);
    }

    res.render('updates', { title: 'Update Custom Object Form | Integrating with HubSpot I Practicum', existingPet });
});

// TODO: ROUTE 3 - Create a new app.post route for the custom objects form to create or update your custom object data. Once executed, redirect the user to the homepage.

app.post('/update-cobj', async (req, res) => {
    const update = {
        properties: {
            "name": req.body.name,
            "pet_type": req.body.animal,
            "date_of_birth": req.body.dob
        }
    }

    const petId = req.query.pet;
    const isUpdating = petId;
    const createPet = `https://api.hubapi.com/crm/v3/objects/${petsAPIName}`;
    const updatePet = `${createPet}/${petId}`;

    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    };

    try {
        if (isUpdating) {
            await axios.patch(updatePet, update, { headers } );
        }
        else {
            await axios.post(createPet, update, { headers });
        }
        
        res.redirect('/');
    } catch(err) {
        console.error(err);
    }
})

// * Localhost
app.listen(3000, () => console.log('Listening on http://localhost:3000'));