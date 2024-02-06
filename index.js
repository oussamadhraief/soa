const express = require('express');
const db = require('./database');
const fs = require('fs');
const app = express();
app.use(express.json());
const PORT = 3000;

app.get('/', (req, res) => {
    res.json("Registre de personnes! Choisissez le bon routage!");
});

// Récupérer toutes les personnes
app.get('/personnes', (req, res) => {
    db.all("SELECT id, nom, adresse FROM personnes", [], (err, rows) => {
        if (err) {
            res.status(400).json({
                "error": err.message
            });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// Récupérer une personne avec la photo
app.get('/personnes/:id', (req, res) => {
    const id = req.params.id;
    db.get("SELECT id, nom, adresse, picture FROM personnes WHERE id = ?", [id], (err, row) => {
        if (err) {
            res.status(400).json({
                "error": err.message
            });
            return;
        }
        if (row) {
            // Convert the binary data to base64 for easy representation in JSON
            row.picture = row.picture ? row.picture.toString('base64') : null;
        }
        res.json({
            "message": "success",
            "data": row
        });
    });
});

// Créer une nouvelle personne avec la photo
app.post('/personnes', (req, res) => {
    const {
        nom,
        adresse,
        picture
    } = req.body;

    // Convert the base64 image data to a Buffer
    const pictureData = picture ? Buffer.from(picture, 'base64') : null;

    db.run(`INSERT INTO personnes (nom, adresse, picture) VALUES (?, ?, ?)`, [nom, adresse, pictureData], function (err) {
        if (err) {
            res.status(400).json({
                "error": err.message
            });
            return;
        }
        res.json({
            "message": "success",
            "data": {
                id: this.lastID
            }
        });
    });
});

// Mettre à jour une personne avec la photo
app.put('/personnes/:id', (req, res) => {
    const id = req.params.id;
    const nom = req.body.nom;
    const adresse = req.body.adresse;
    const picture = req.body.picture;

    // Convert the base64 image data to a Buffer
    const pictureData = picture ? Buffer.from(picture, 'base64') : null;

    db.run(`UPDATE personnes SET nom = ?, adresse = ?, picture = ? WHERE id = ?`, [nom, adresse, pictureData, id], function (err) {
        if (err) {
            res.status(400).json({
                "error": err.message
            });
            return;
        }
        res.json({
            "message": "success"
        });
    });
});

// Supprimer une personne
app.delete('/personnes/:id', (req, res) => {
    const id = req.params.id;
    db.run(`DELETE FROM personnes WHERE id = ?`, id, function (err) {
        if (err) {
            res.status(400).json({
                "error": err.message
            });
            return;
        }
        res.json({
            "message": "success"
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
 