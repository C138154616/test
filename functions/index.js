const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// Initialiser l'application Firebase Admin
admin.initializeApp();

// Initialiser Firestore
const db = admin.firestore();

// Initialiser Express
const app = express();
app.use(bodyParser.json());
app.use(cors());

// Ajouter un nouveau livre
app.post("/books", async (req, res) => {
  const {book, user} = req.body;
  try {
    const docRef = await db.collection("books").add({book, user});
    res.status(201).send(`Book added with ID: ${docRef.id}`);
  } catch (error) {
    res.status(500).send(`Error adding book: ${error.message}`);
  }
});

// Obtenir tous les livres
app.get("/books", async (req, res) => {
  try {
    const booksSnapshot = await db.collection("books").get();
    const books=booksSnapshot.docs.map((doc)=>({id: doc.id, ...doc.data()}));
    res.status(200).json(books);
  } catch (error) {
    res.status(500).send(`Error getting books: ${error.message}`);
  }
});

// Obtenir un livre par ID
app.get("/books/:id", async (req, res) => {
  const {id} = req.params;
  try {
    const doc = await db.collection("books").doc(id).get();
    if (!doc.exists) {
      res.status(404).send("Book not found");
    } else {
      res.status(200).json({id: doc.id, ...doc.data()});
    }
  } catch (error) {
    res.status(500).send(`Error getting book: ${error.message}`);
  }
});

// Mettre à jour un livre par ID
app.put("/books/:id", async (req, res) => {
  const {id} = req.params;
  const {book, user} = req.body;
  try {
    await db.collection("books").doc(id).update({book, user});
    res.status(200).send("Book updated successfully");
  } catch (error) {
    res.status(500).send(`Error updating book: ${error.message}`);
  }
});

// Supprimer un livre par ID
app.delete("/books/:id", async (req, res) => {
  const {id} = req.params;
  try {
    await db.collection("books").doc(id).delete();
    res.status(200).send("Book deleted successfully");
  } catch (error) {
    res.status(500).send(`Error deleting book: ${error.message}`);
  }
});


app.get("/books/user/:username", async (req, res) => {
  const {username} = req.params;
  try {
    const booksSnapshot = await db.collection("books")
        .where("user", "==", username)
        .get();
    const books = booksSnapshot.docs.map((doc)=>({id: doc.id, ...doc.data()}));
    res.status(200).json(books);
  } catch (error) {
    res.status(500).send(`Error${username}: ${error.message}`);
  }
});

exports.api = functions.https.onRequest(app);
