const express = require('express');
const router = express.Router();


//routes
router.get('/', (req, res) => {
    res.render("admin/index")
})
router.get('/posts', (req, res) => {
    res.send("Página de posts")
})
router.get('/categorias', (req, res) => {
    res.send('categorias')
})


//exports routes to app.js
module.exports = router;