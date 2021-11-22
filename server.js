const express = require('express')
const path = require('path')

const app = express()

// server only the static files from the dist directory
app.use(express.static('./dist/angular-ecommerce-spring'))

app.get('/*', (req, res) =>
res.sendFile('index.html', {root: 'dist/angular-ecommerce-spring/'})
)

app.listen(process.env.PORT || 8080)