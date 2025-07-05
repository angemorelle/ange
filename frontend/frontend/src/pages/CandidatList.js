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
    if (!electeur_id || !elections_id) return alert("Tous les champs sont obligatoires");

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
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Gestion des Candidats</h2>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <select
          value={form.electeur_id}
          onChange={e => setForm({ ...form, electeur_id: e.target.value })}
          className="border px-3 py-2 rounded"
        >
          <option value="">-- Candidat --</option>
          {electeurs.map(e => (
            <option key={e.id} value={e.id}>{e.nom}</option>
          ))}
        </select>
        <select
          value={form.elections_id}
          onChange={e => setForm({ ...form, elections_id: e.target.value })}
          className="border px-3 py-2 rounded"
        >
          <option value="">-- Élection --</option>
          {elections.map(el => (
            <option key={el.id} value={el.id}>{el.nom}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Programme"
          value={form.programme}
          onChange={e => setForm({ ...form, programme: e.target.value })}
          className="border px-3 py-2 rounded"
        />
        <button
          onClick={ajouterCandidat}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded col-span-3"
        >
          Ajouter
        </button>
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">Candidat</th>
            <th className="p-2 border">Élection</th>
            <th className="p-2 border">Programme</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {candidats.map(c => (
            <tr key={c.id} className="hover:bg-gray-100">
              <td className="p-2 border">{c.electeur_nom}</td>
              <td className="p-2 border">{c.election_nom}</td>
              <td className="p-2 border">{c.programme}</td>
              <td className="p-2 border">
                <button
                  onClick={() => supprimerCandidat(c.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
          {candidats.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center py-4 text-gray-500">Aucun candidat.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CandidatList;
