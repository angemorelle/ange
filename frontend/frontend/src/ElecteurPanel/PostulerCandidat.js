import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PostulerCandidat = () => {
  const [elections, setElections] = useState([]);
  const [electionSelectionnee, setElectionSelectionnee] = useState(null);
  const [programme, setProgramme] = useState("");

  const electeurId = localStorage.getItem('electeur_id');

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/elections');
      setElections(res.data.filter(e => e.status === 'en_attente'));
    } catch (err) {
      console.error(err);
    }
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
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: "#f8f9fa" }}>
      {/* Header */}
      <header>
        <nav className="navbar navbar-expand-lg" style={{ backgroundColor: "#6c9eff" }}>
          <div className="container justify-content-center">
            <span className="navbar-brand text-white fs-3 fw-bold">Election</span>
          </div>
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-fill">
        <div className="container mt-5">
          <h2 className="text-center fw-bold mb-4">Postuler en tant que Candidat</h2>

          {!electionSelectionnee ? (
            <div className="row">
              {elections.length > 0 ? elections.map(e => (
                <div key={e.id} className="col-md-6 mb-4">
                  <div className="card shadow-sm h-100">
                    <div className="card-body d-flex flex-column justify-content-between">
                      <div>
                        <h5 className="card-title fw-bold">{e.nom}</h5>
                        <p className="card-text">
                          Du {new Date(e.date_ouverture).toLocaleDateString()} au {new Date(e.date_fermeture).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        className="btn btn-success mt-3"
                        onClick={() => handlePostulerClick(e)}
                      >
                        Postuler
                      </button>
                    </div>
                  </div>
                </div>
              )) : (
                <p className="text-center text-muted">Aucune élection ouverte pour le moment.</p>
              )}
            </div>
          ) : (
            <div className="card shadow p-4">
              <h4 className="mb-3">Candidature à l’élection : <strong>{electionSelectionnee.nom}</strong></h4>
              <div className="mb-3">
                <textarea
                  className="form-control"
                  rows="5"
                  placeholder="Votre programme"
                  value={programme}
                  onChange={(e) => setProgramme(e.target.value)}
                />
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button
                  className="btn btn-primary"
                  onClick={soumettreCandidature}
                >
                  Soumettre
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setElectionSelectionnee(null)}
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-3 mt-5">
        <div className="container">
          &copy; {new Date().getFullYear()} Election - Tous droits réservés.
        </div>
      </footer>
    </div>
  );
};

export default PostulerCandidat;
