## PASI DE RULARE:

RDF4J: http://localhost:8080/rdf4j-workbench -> grafexamen:
@prefix : <http://examen.ro#> .
@prefix schema: <http://schema.org/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix fn: <http://www.w3.org/2005/xpath-functions#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix sesame: <http://www.openrdf.org/schema/sesame#> .
@prefix rdf4j: <http://rdf4j.org/schema/rdf4j#> .

:grafExcursii {
  :exc1 a schema:TouristTrip;
    schema:location "Paris";
    schema:startDate "2025-06-15";
    schema:tourGuide "Ioana Marin" .
  
  :exc2 a schema:TouristTrip;
    schema:location "Roma";
    schema:startDate "2025-07-01";
    schema:tourGuide "Andrei Radu" .
  
  :exc3 a schema:TouristTrip;
    schema:location "Berlin";
    schema:startDate "2025-08-10";
    schema:tourGuide "Alina Pop" .
  
  :excViena a schema:TouristTrip;
    schema:location "Viena";
    schema:startDate "2025-06-01";
    schema:tourGuide "Alina Pop" .
}

:grafParticipanti {
  :Ionut a schema:Person;
    schema:homeLocation "Arad";
    :participaLa :exc3;
    :varsta 26 .
  
  :Radu a schema:Person;
    schema:homeLocation "Sibiu";
    :participaLa :exc2;
    :varsta 28 .
  
  :Marius a schema:Person;
    schema:homeLocation "Cluj";
    :participaLa :excViena;
    :varsta 25 .
  
  :alexia a schema:Person;
    schema:homeLocation "Ploiesti";
    :participaLa :exc3;
    :varsta 24 .
}

tomcat -> startup.bat
proxy-server -> node index.js
json-server --watch db.json --port 4000
json-graphql-server graphql-data.json --port 3000
npm start
 
## COMPONENTE LIPSA: 
- JSON-LD 
- OpenAI
 
 
## BONUS:
- React + Express