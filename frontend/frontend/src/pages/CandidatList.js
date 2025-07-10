import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CandidatList = () => {
  const [candidats, setCandidats] = useState([]);
  const [electeurs, setElecteurs] = useState([]);
  const [elections, setElections] = useState([]);
  const [form, setForm] = useState({
    electeur_id: '', elections_id: '', programme: ''
  });

  useEffect(() => {
    fetchCandidats();
    fetchElecteurs();
    fetchElections();
  }, []);

  const fetchCandidats = async () => {
    const res = await axios.get('http://localhost:3001/api/candidats');
    setCandidats(res.data);
  };

  const fetchElecteurs = async () => {
    const res = await axios.get('http://localhost:3001/api/electeurs');
    setElecteurs(res.data.filter(e => e.type === 'candidat'));
  };

  const fetchElections = async () => {
    const res = await axios.get('http://localhost:3001/api/elections');
    setElections(res.data);
  };

  const ajouterCandidat = async () => {
    const { electeur_id, elections_id, programme } = form;
    if (!electeur_id || !elections_id) {
      return alert("Tous les champs sont obligatoires");
    }

    try {
      await axios.post('http://localhost:3001/api/candidats', form);
      setForm({ electeur_id: '', elections_id: '', programme: '' });
      fetchCandidats();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'ajout");
    }
  };

  const supprimerCandidat = async (id) => {
    if (!window.confirm("Confirmer la suppression ?")) return;
    await axios.delete(`http://localhost:3001/api/candidats/${id}`);
    fetchCandidats();
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

      {/* Main */}
      <main className="flex-fill">
        <div className="container mt-5">
          <h2 className="mb-4 text-center fw-bold">Gestion des Candidats</h2>

          {/* Formulaire */}
          <div className="card p-4 mb-5 shadow">
            <div className="row g-3">
              <div className="col-md-4">
                <select
                  className="form-select"
                  value={form.electeur_id}
                  onChange={e => setForm({ ...form, electeur_id: e.target.value })}
                >
                  <option value="">-- Candidat --</option>
                  {electeurs.map(e => (
                    <option key={e.id} value={e.id}>{e.nom}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <select
                  className="form-select"
                  value={form.elections_id}
                  onChange={e => setForm({ ...form, elections_id: e.target.value })}
                >
                  <option value="">-- Élection --</option>
                  {elections.map(el => (
                    <option key={el.id} value={el.id}>{el.nom}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Programme"
                  value={form.programme}
                  onChange={e => setForm({ ...form, programme: e.target.value })}
                />
              </div>
              <div className="col-12 text-end">
                <button className="btn btn-success" onClick={ajouterCandidat}>
                  Ajouter
                </button>
              </div>
            </div>
          </div>

          {/* Tableau */}
          <div className="card shadow">
            <div className="table-responsive">
              <table className="table table-bordered table-striped mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Candidat</th>
                    <th>Élection</th>
                    <th>Programme</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {candidats.length > 0 ? candidats.map(c => (
                    <tr key={c.id}>
                      <td>{c.electeur_nom}</td>
                      <td>{c.election_nom}</td>
                      <td>{c.programme}</td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => supprimerCandidat(c.id)}
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="text-center text-muted py-3">
                        Aucun candidat enregistré.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
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

export default CandidatList;
