const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = 4001;

app.use(cors());

app.get('/query', async (req, res) => {
  const sparql = req.query.sparql;

  try {
    const response = await fetch('http://localhost:8080/rdf4j-server/repositories/grafexamen?query=' + encodeURIComponent(sparql), {
      headers: {
        Accept: 'application/sparql-results+json'
      }
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Eroare la fetch:', err);
    res.status(500).json({ error: 'Fetch error' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Proxy RDF4J rulează pe http://localhost:${PORT}`);
});
