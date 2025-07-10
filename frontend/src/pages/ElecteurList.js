import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ElecteurList = () => {
  const [electeurs, setElecteurs] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [elections, setElections] = useState([]);
  const [form, setForm] = useState({
    nom: '', email: '', pwd: '', tel: '', profession: '',
    type: 'electeur', departement_id: '', elections_id: ''
  });

  useEffect(() => {
    fetchElecteurs();
    fetchDepartements();
    fetchElections();
  }, []);

  const fetchElecteurs = async () => {
    const res = await axios.get('http://localhost:3001/api/electeurs');
    setElecteurs(res.data);
  };

  const fetchDepartements = async () => {
    const res = await axios.get('http://localhost:3001/api/departements');
    setDepartements(res.data);
  };

  const fetchElections = async () => {
    const res = await axios.get('http://localhost:3001/api/elections');
    setElections(res.data);
  };

  const ajouterElecteur = async () => {
    const { nom, email, pwd, tel, profession, type, departement_id, elections_id } = form;
    if (!nom || !email || !pwd || !departement_id || !elections_id) {
      return alert("Champs obligatoires manquants");
    }

    try {
      await axios.post('http://localhost:3001/api/electeurs', form);
      setForm({
        nom: '', email: '', pwd: '', tel: '', profession: '',
        type: 'electeur', departement_id: '', elections_id: ''
      });
      fetchElecteurs();
    } catch (err) {
      console.error(err);
    }
  };

  const supprimerElecteur = async (id) => {
    if (!window.confirm("Confirmer la suppression ?")) return;
    await axios.delete(`http://localhost:3001/api/electeurs/${id}`);
    fetchElecteurs();
  };

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: "#f1f1f1" }}>
      {/* HEADER */}
      <header>
        <nav className="navbar navbar-expand-lg" style={{ backgroundColor: "#6c9eff" }}>
          <div className="container justify-content-center">
            <span className="navbar-brand text-white fs-3 fw-bold">Election</span>
          </div>
        </nav>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-fill">
        <div className="container mt-5">
          <h2 className="mb-4 text-center fw-bold">Gestion des Electeurs/Candidats </h2>

          {/* FORMULAIRE */}
          <div className="card p-4 mb-5 shadow">
            <div className="row g-3">
              <div className="col-md-4">
                <input type="text" className="form-control" placeholder="Nom"
                  value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} />
              </div>
              <div className="col-md-4">
                <input type="email" className="form-control" placeholder="Email"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="col-md-4">
                <input type="password" className="form-control" placeholder="Mot de passe"
                  value={form.pwd} onChange={e => setForm({ ...form, pwd: e.target.value })} />
              </div>
              <div className="col-md-4">
                <input type="text" className="form-control" placeholder="Téléphone"
                  value={form.tel} onChange={e => setForm({ ...form, tel: e.target.value })} />
              </div>
              <div className="col-md-4">
                <input type="text" className="form-control" placeholder="Profession"
                  value={form.profession} onChange={e => setForm({ ...form, profession: e.target.value })} />
              </div>
              <div className="col-md-4">
                <select className="form-select" value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="electeur">Électeur</option>
                  <option value="candidat">Candidat</option>
                </select>
              </div>
              <div className="col-md-6">
                <select className="form-select" value={form.departement_id}
                  onChange={e => setForm({ ...form, departement_id: e.target.value })}>
                  <option value="">-- Département --</option>
                  {departements.map(d => (
                    <option key={d.id} value={d.id}>{d.nom}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <select className="form-select" value={form.elections_id}
                  onChange={e => setForm({ ...form, elections_id: e.target.value })}>
                  <option value="">-- Élection --</option>
                  {elections.map(e => (
                    <option key={e.id} value={e.id}>{e.nom}</option>
                  ))}
                </select>
              </div>
              <div className="col-12 text-end">
                <button className="btn btn-success" onClick={ajouterElecteur}>
                  Ajouter
                </button>
              </div>
            </div>
          </div>

          {/* TABLEAU */}
          <div className="card shadow">
            <div className="table-responsive">
              <table className="table table-bordered table-striped mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Téléphone</th>
                    <th>Type</th>
                    <th>Département</th>
                    <th>Élection</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {electeurs.length > 0 ? electeurs.map(e => (
                    <tr key={e.id}>
                      <td>{e.nom}</td>
                      <td>{e.email}</td>
                      <td>{e.tel}</td>
                      <td>{e.type}</td>
                      <td>{e.departement_nom}</td>
                      <td>{e.election_nom}</td>
                      <td>
                        <button className="btn btn-danger btn-sm"
                          onClick={() => supprimerElecteur(e.id)}>
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="7" className="text-center text-muted py-3">
                        Aucun électeur enregistré.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-dark text-white text-center py-3 mt-5">
        <div className="container">
          &copy; {new Date().getFullYear()} Election - Tous droits réservés.
        </div>
      </footer>
    </div>
  );
};

export default ElecteurList;
