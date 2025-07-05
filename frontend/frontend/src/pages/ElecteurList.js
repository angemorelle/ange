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
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Gestion des Électeurs</h2>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <input type="text" placeholder="Nom" value={form.nom}
          onChange={e => setForm({ ...form, nom: e.target.value })}
          className="border px-3 py-2 rounded" />
        <input type="email" placeholder="Email" value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          className="border px-3 py-2 rounded" />
        <input type="password" placeholder="Mot de passe" value={form.pwd}
          onChange={e => setForm({ ...form, pwd: e.target.value })}
          className="border px-3 py-2 rounded" />
        <input type="text" placeholder="Téléphone" value={form.tel}
          onChange={e => setForm({ ...form, tel: e.target.value })}
          className="border px-3 py-2 rounded" />
        <input type="text" placeholder="Profession" value={form.profession}
          onChange={e => setForm({ ...form, profession: e.target.value })}
          className="border px-3 py-2 rounded" />
        <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
          className="border px-3 py-2 rounded">
          <option value="electeur">Électeur</option>
          <option value="candidat">Candidat</option>
        </select>
        <select value={form.departement_id} onChange={e => setForm({ ...form, departement_id: e.target.value })}
          className="border px-3 py-2 rounded">
          <option value="">-- Département --</option>
          {departements.map(d => (
            <option key={d.id} value={d.id}>{d.nom}</option>
          ))}
        </select>
        <select value={form.elections_id} onChange={e => setForm({ ...form, elections_id: e.target.value })}
          className="border px-3 py-2 rounded">
          <option value="">-- Élection --</option>
          {elections.map(e => (
            <option key={e.id} value={e.id}>{e.nom}</option>
          ))}
        </select>
        <button onClick={ajouterElecteur}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Ajouter
        </button>
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">Nom</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Téléphone</th>
            <th className="p-2 border">Type</th>
            <th className="p-2 border">Département</th>
            <th className="p-2 border">Élection</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {electeurs.map(e => (
            <tr key={e.id} className="hover:bg-gray-100">
              <td className="p-2 border">{e.nom}</td>
              <td className="p-2 border">{e.email}</td>
              <td className="p-2 border">{e.tel}</td>
              <td className="p-2 border">{e.type}</td>
              <td className="p-2 border">{e.departement_nom}</td>
              <td className="p-2 border">{e.election_nom}</td>
              <td className="p-2 border">
                <button onClick={() => supprimerElecteur(e.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
          {electeurs.length === 0 && (
            <tr>
              <td colSpan="7" className="text-center text-gray-500 py-4">
                Aucun électeur enregistré.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ElecteurList;
