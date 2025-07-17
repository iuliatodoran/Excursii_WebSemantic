import React, { useState, useEffect} from 'react';

function App() {
  const [rows, setRows] = useState([]);
  const [excursiiREST, setExcursiiREST] = useState([]);
  const [participanti, setParticipanti] = useState([]);
  const [participantiGraphQL, setParticipantiGraphQL] = useState([]);
  const [rdfData, setRdfData] = useState([]);
  const [filtruDestinatie, setFiltruDestinatie] = useState("");
  const [filtruVarsta, setFiltruVarsta] = useState("");
  const [excursiiGraphQL, setExcursiiGraphQL] = useState([]);
  const [dropdownExcursii, setDropdownExcursii] = useState([]);
  const [participantNou, setParticipantNou] = useState({
    nume: "",
    oras: "",
    varsta: "",
    excursieId: ""
  });
  useEffect(() => {
    loadExcursiiGraphQL();
  }, []);

  const handleFetch = async () => {
    const sparqlQuery = `
      PREFIX : <http://examen.ro#>
      PREFIX schema: <http://schema.org/>

      SELECT ?excursie ?destinatie ?data ?ghid ?participant ?oras ?varsta
      WHERE {
        GRAPH :grafExcursii {
          ?excursie a schema:TouristTrip;
                    schema:location ?destinatie;
                    schema:startDate ?data;
                    schema:tourGuide ?ghid.
        }
        GRAPH :grafParticipanti {
          ?participant a schema:Person;
                       schema:homeLocation ?oras;
                       :varsta ?varsta;
                       :participaLa ?excursie.
        }

        FILTER (?destinatie != "Viena")
      }
    `;

    const fullUrl = 'http://localhost:4001/query?sparql=' + encodeURIComponent(sparqlQuery);

    try {
      const response = await fetch(fullUrl, {
        headers: {
          Accept: 'application/sparql-results+json'
        }
      });

      const json = await response.json();

      const results = json.results.bindings.map((binding) => ({
        excursie: binding.excursie.value,
        destinatie: binding.destinatie.value,
        data: binding.data.value,
        ghid: binding.ghid.value,
        participant: binding.participant.value.split('#')[1],
        oras: binding.oras.value,
        varsta: binding.varsta.value
      }));

      console.log("Date RDF preluate:", results);
      setRows(results);
      setRdfData(results);
    } catch (error) {
      console.error("Eroare la interogarea RDF4J:", error);
    }
  };

  const handleSendToREST = async () => {
    if (!rdfData.length) {
      alert("Nicio data RDF incarcata");
      return;
    }

    try {
      const existing = await fetch("http://localhost:4000/excursii");
      const existingData = await existing.json();

      for (const excursie of rdfData) {
        const duplicat = existingData.some(e =>
          e.destinatie === excursie.destinatie &&
          e.data === excursie.data &&
          e.participant === excursie.participant
        );

        if (!duplicat) {
          await fetch("http://localhost:4000/excursii", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(excursie)
          });
        }
      }

      alert("Datele RDF au fost trimise spre REST");
    } catch (error) {
      console.error("Eroare la trimitere:", error);
      alert("eroare");
    }
  };
  
  const handleReadFromREST = async () => {
    try {
      const res = await fetch('http://localhost:4000/excursii');
      const data = await res.json();
      console.log("Date REST:", data);
      
      setExcursiiREST(data);
      setDropdownExcursii(data);

      await loadParticipanti();
    } catch (err) {
      console.error("Eroare la citirea din REST:", err);
    }
  };

  const loadParticipanti = async () => {
    try {
      const res = await fetch('http://localhost:4000/participanti');
      const data = await res.json();
      setParticipanti(data);
    } catch (err) {
      console.error("Eroare la citirea participantilor:", err);
    }
  };

  const loadExcursiiGraphQL = async () => {
    const query = `
      {
        allExcursiis {
          id
          destinatie
        }
      }
    `;

    try {
      const response = await fetch("http://localhost:3000/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });

      const data = await response.json();
      setExcursiiGraphQL(data.data.allExcursiis);
    } catch (err) {
      console.error("Eroare la incarcarea excursiilor GraphQL:", err);
    }
  };

  const handleAddParticipant = async () => {
    const { nume, oras, varsta, excursieId } = participantNou;

    if (!nume || !oras || !varsta || !excursieId) {
      alert("Completeaza toate campurile!");
      return;
    }

    const excursie = dropdownExcursii.find(e => e.id === excursieId);

    if (!excursie) {
      alert("Excursia nu este valida!");
      return;
    }

    const mutation = `
      mutation {
        createParticipanti(
          nume: "${nume}",
          oras: "${oras}",
          varsta: ${parseInt(varsta)},
          excursieId: "${excursieId}"
        ) {
          id
          nume
        }
      } 
    `;

    try {
      console.log("Mutatia care va fi trimisa:", mutation);

      const res = await fetch("http://localhost:3000/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query: mutation })
      });

      const data = await res.json();

      if (data.errors) {
        console.error("Eroare GraphQL:", data.errors);
        data.errors.forEach((err, i) => {
          console.error(`Detaliu ${i + 1}:`, err.message || err);
        });
        alert("Eroare la adăugare. Vezi consola.");
        return;
      }

      console.log("Participant adaugat cu succes:", data);
      alert("Participant adaugat cu succes!");

      setParticipantNou({
        nume: "",
        oras: "",
        varsta: "",
        excursieId: ""
      });

      handleGraphQL();
    } catch (err) {
      console.error("Eroare la trimiterea datelor:", err);
      alert("Eroare la trimiterea datelor");
    }
  };


  const handleGraphQL = async () => {
    const query = `
      {
        allParticipantis {
          id
          nume
          oras
          varsta
          excursieId
        }
      }
    `;
    try {
      const response = await fetch('http://localhost:3000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
  
      const data = await response.json();

      if (data.errors || !data.data || !data.data.allParticipantis) {
        console.error("Eroare la interogarea GraphQL:", data.errors || data);
        alert("Eroare la afișarea participanților din GraphQL.");
        return;
      }

      const all = data.data.allParticipantis;
      const filtrati = all.filter(p => parseInt(p.varsta) >= 23);
      setParticipantiGraphQL(filtrati);
    } catch (err) {
      console.error("Eroare GraphQL:", err);
      alert("Eroare la interogare GraphQL");
    }
  };

  return (
    <div className="App" style={{ padding: "20px" }}>
      <h2>Excursii si Participanti</h2>
      <button onClick={handleFetch}>Buton 1 - Afisare RDF</button><br></br>
      <button onClick={handleSendToREST}>Buton 2 - Trimite spre REST</button><br></br>
      <button onClick={handleReadFromREST}>Buton 3 - Afisare REST</button><br></br>
      <button onClick={handleGraphQL}>Buton 5 - Afisare GraphQL</button>
    
      {rows.length > 0 && (
        <div>
          <h3 style={{ marginTop: "30px" }}>Tabel 1 - Date RDF (fara Viena)</h3>
          <table border="1" cellPadding="8" style={{ marginTop: "10px" }}>
            <thead>
              <tr>
                <th>Participant</th>
                <th>Oras</th>
                <th>Varsta</th>
                <th>Destinatie</th>
                <th>Ghid</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td>{r.participant}</td>
                  <td>{r.oras}</td>
                  <td>{r.varsta}</td>
                  <td>{r.destinatie}</td>
                  <td>{r.ghid}</td>
                  <td>{r.data}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {excursiiREST.length > 0 && (
        <div style={{ marginTop: "30px" }}>

          <h3 style={{ marginTop: "10px" }}>Tabel 2 - Date din REST</h3>
          <div style={{ marginBottom: "10px" }}>
            <label>Destinatie: </label>
            <select value={filtruDestinatie} onChange={(e) => setFiltruDestinatie(e.target.value)}>
              <option value="">Toate</option>
              {[...new Set(excursiiREST.map(e => e.destinatie))].map((d, i) => (
                <option key={i} value={d}>{d}</option>
              ))}
            </select>

            <label style={{ marginLeft: "20px" }}>Varsta minima: </label>
            <input
              type="number"
              placeholder="ex: 25"
              value={filtruVarsta}
              onChange={(e) => setFiltruVarsta(e.target.value)}
              style={{ width: "60px" }}
            />
          </div>

          <table border="1" cellPadding="8">
            <thead>
              <tr>
                <th>Participant</th>
                <th>Oras</th>
                <th>Varsta</th>
                <th>Destinatie</th>
                <th>Ghid</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {excursiiREST
                .filter(e =>
                  (filtruDestinatie === "" || e.destinatie === filtruDestinatie) &&
                  (filtruVarsta === "" || parseInt(e.varsta) >= parseInt(filtruVarsta))
                )
                .map((e, i) => (
                  <tr key={i}>
                    <td>{e.participant}</td>
                    <td>{e.oras}</td>
                    <td>{e.varsta}</td>
                    <td>{e.destinatie}</td>
                    <td>{e.ghid}</td>
                    <td>{e.data}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      <h3 style={{ marginTop: "40px" }}>Adauga participant nou</h3>
        <div>
          <input
            type="text"
            placeholder="Nume"
            value={participantNou.nume}
            onChange={(e) => setParticipantNou({ ...participantNou, nume: e.target.value })}
          />            
          <input
            type="text"
            placeholder="Oras"
            value={participantNou.oras}
            onChange={(e) => setParticipantNou({ ...participantNou, oras: e.target.value })}
          />
          <input
            type="number"
            placeholder="Varsta"
            value={participantNou.varsta}
            onChange={(e) => setParticipantNou({ ...participantNou, varsta: e.target.value })}
          />
          <select
            value={participantNou.excursieId}
            onChange={(e) => setParticipantNou({ ...participantNou, excursieId: e.target.value })}
          >
            <option value="">Selecteaza excursia</option>
            {dropdownExcursii.map((exc, index) => (
              <option key={index} value={exc.id ?? ""}>{exc.destinatie}</option>
            ))}
          </select>

          <button onClick={handleAddParticipant}>Adauga participant</button>
        </div>

      {participantiGraphQL.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Tabel 3 - Participanti GraphQL (varsta ≥ 23)</h3>
          <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Nume</th>
              <th>Oras</th>
              <th>Varsta</th>
              <th>Destinatie</th>
              <th>Ghid</th>
              <th>Data</th>
            </tr>
          </thead>
            <tbody>
              {participantiGraphQL.map((p, i) => {
                const excursie = dropdownExcursii.find(e => e.id === p.excursieId);
                const destinatie = excursie?.destinatie || "N/A";
                const ghid = excursie?.ghid || "N/A";
                const data = excursie?.data || "N/A";

                return (
                  <tr key={i}>
                    <td>{p.nume}</td>
                    <td>{p.oras}</td>
                    <td>{p.varsta}</td>
                    <td>{destinatie}</td>
                    <td>{ghid}</td>
                    <td>{data}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
