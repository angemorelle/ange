import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PostulerCandidat = () => {
  const [elections, setElections] = useState([]);
  const [electionSelectionnee, setElectionSelectionnee] = useState(null);
  const [programme, setProgramme] = useState("");

  const electeurId = localStorage.getItem('electeur_id'); // ⚠️ Supposé être stocké après connexion

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    const res = await axios.get('http://localhost:3001/api/elections');
    setElections(res.data.filter(e => e.status === 'en_attente'));
  };

  const handlePostulerClick = (election) => {
    setElectionSelectionnee(election);
  };

  const soumettreCandidature = async () => {
    if (!programme) return alert("Veuillez saisir votre programme");

    try {
      await axios.post("http://localhost:3001/api/candidats", {
        electeur_id: electeurId,
        elections_id: electionSelectionnee.id,
        programme
      });
      alert("Candidature enregistrée !");
      setElectionSelectionnee(null);
      setProgramme("");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la candidature.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Postuler en tant que Candidat</h2>

      {!electionSelectionnee ? (
        <div className="grid gap-4">
          {elections.map(e => (
            <div key={e.id} className="p-4 border rounded shadow-sm flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">{e.nom}</h3>
                <p>Du {new Date(e.date_ouverture).toLocaleDateString()} au {new Date(e.date_fermeture).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => handlePostulerClick(e)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Postuler
              </button>
            </div>
          ))}
          {elections.length === 0 && <p>Aucune élection ouverte pour le moment.</p>}
        </div>
      ) : (
        <div className="p-4 border rounded shadow-md">
          <h3 className="text-xl mb-2">Candidature à l’élection : <strong>{electionSelectionnee.nom}</strong></h3>
          <textarea
            placeholder="Votre programme"
            value={programme}
            onChange={(e) => setProgramme(e.target.value)}
            className="w-full border px-3 py-2 rounded mb-4"
            rows={5}
          />
          <div className="flex gap-4">
            <button
              onClick={soumettreCandidature}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Soumettre
            </button>
            <button
              onClick={() => setElectionSelectionnee(null)}
              className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostulerCandidat;
