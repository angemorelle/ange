import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ElectionList = () => {
  const [elections, setElections] = useState([]);
  const [postes, setPostes] = useState([]);
  const [form, setForm] = useState({
    nom: '',
    date_ouverture: '',
    date_fermeture: '',
    poste_id: ''
  });

  useEffect(() => {
    fetchElections();
    fetchPostes();
  }, []);

  const fetchElections = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/elections');
      setElections(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPostes = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/postes');
      setPostes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const ajouterElection = async () => {
    const { nom, date_ouverture, date_fermeture, poste_id } = form;
    if (!nom || !date_ouverture || !date_fermeture || !poste_id) {
      return alert("Tous les champs sont obligatoires");
    }

    try {
      await axios.post('http://localhost:3001/api/elections', form);
      setForm({ nom: '', date_ouverture: '', date_fermeture: '', poste_id: '' });
      fetchElections();
    } catch (err) {
      console.error(err);
    }
  };

  const supprimerElection = async (id) => {
    if (!window.confirm("Confirmer la suppression ?")) return;
    try {
      await axios.delete(`http://localhost:3001/api/elections/${id}`);
      fetchElections();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Gestion des Élections</h2>

      <div className="mb-6 grid grid-cols-4 gap-4 items-end">
        <input
          type="text"
          placeholder="Nom de l'élection"
          value={form.nom}
          onChange={e => setForm({ ...form, nom: e.target.value })}
          className="border px-3 py-2 rounded-md"
        />
        <input
          type="datetime-local"
          value={form.date_ouverture}
          onChange={e => setForm({ ...form, date_ouverture: e.target.value })}
          className="border px-3 py-2 rounded-md"
        />
        <input
          type="datetime-local"
          value={form.date_fermeture}
          onChange={e => setForm({ ...form, date_fermeture: e.target.value })}
          className="border px-3 py-2 rounded-md"
        />
        <select
          value={form.poste_id}
          onChange={e => setForm({ ...form, poste_id: e.target.value })}
          className="border px-3 py-2 rounded-md"
        >
          <option value="">-- Poste --</option>
          {postes.map(poste => (
            <option key={poste.id} value={poste.id}>{poste.nom}</option>
          ))}
        </select>
        <button
          onClick={ajouterElection}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md col-span-1"
        >
          Ajouter
        </button>
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Nom</th>
            <th className="p-2 border">Période</th>
            <th className="p-2 border">Poste</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {elections.map(e => (
            <tr key={e.id} className="hover:bg-gray-100">
              <td className="p-2 border">{e.id}</td>
              <td className="p-2 border">{e.nom}</td>
              <td className="p-2 border">
                {new Date(e.date_ouverture).toLocaleString()} -<br />
                {new Date(e.date_fermeture).toLocaleString()}
              </td>
              <td className="p-2 border">{e.poste_nom}</td>
              <td className="p-2 border">
                <button
                  onClick={() => supprimerElection(e.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
          {elections.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center p-4 text-gray-500">
                Aucune élection trouvée.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ElectionList;
