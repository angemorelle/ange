import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const VotePage = () => {
  const { electionId } = useParams(); // ID de l’élection passé dans l’URL
  const [candidats, setCandidats] = useState([]);
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const electeur = storedUser ? JSON.parse(storedUser) : null;

  // Chargement des candidats à l’élection
  useEffect(() => {
    if (!electeur) {
      alert("Veuillez vous connecter d'abord !");
      navigate("/");
      return;
    }

    axios
      .get(`http://localhost:3001/api/candidats/election/${electionId}`)
      .then((res) => setCandidats(res.data))
      .catch((err) =>
        console.error("Erreur lors du chargement des candidats :", err)
      );
  }, [electionId, electeur, navigate]);

  // Fonction de vote
  const voter = async (candidat_id) => {
    try {
      await axios.post("http://localhost:3001/api/bulletins", {
        electeur_id: electeur.id,
        elections_id: parseInt(electionId),
        candidat_id: parseInt(candidat_id),
      });
      alert("✅ Vote enregistré avec succès !");
      navigate("/electeur/dashboard");
    } catch (err) {
      alert("❌ Erreur : vous avez peut-être déjà voté ou un problème est survenu.");
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: "#f8f9fa" }}>
      {/* Header */}
      <header>
        <nav className="navbar navbar-expand-lg" style={{ backgroundColor: "#6c9eff" }}>
          <div className="container justify-content-center">
            <span className="navbar-brand text-white fs-3 fw-bold">ElectionDapp</span>
          </div>
        </nav>
      </header>

      {/* Contenu principal */}
      <main className="flex-fill">
        <div className="container mt-5">
          <h2 className="text-center fw-bold mb-4">Vote pour l’élection #{electionId}</h2>

          {candidats.length === 0 ? (
            <p className="text-center text-muted">Aucun candidat pour cette élection.</p>
          ) : (
            <div className="card shadow">
              <div className="table-responsive">
                <table className="table table-bordered table-striped mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="text-center">Nom du candidat</th>
                      <th className="text-center">Programme</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidats.map((candidat) => (
                      <tr key={candidat.id} className="text-center">
                        <td>{candidat.nom}</td>
                        <td>{candidat.programme}</td>
                        <td>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => voter(candidat.id)}
                          >
                            Voter pour lui
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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

export default VotePage;
