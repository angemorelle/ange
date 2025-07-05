import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PosteList = () => {
  const [postes, setPostes] = useState([]);
  const [nom, setNom] = useState('');

  useEffect(() => {
    fetchPostes();
  }, []);

  const fetchPostes = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/postes');
      setPostes(res.data);
    } catch (err) {
      console.error('Erreur chargement postes:', err);
    }
  };

  const ajouterPoste = async () => {
    if (!nom.trim()) return alert("Le nom du poste est requis");

    try {
      await axios.post('http://localhost:3001/api/postes', { nom });
      setNom('');
      fetchPostes();
    } catch (err) {
      console.error('Erreur ajout poste:', err);
    }
  };

  const supprimerPoste = async (id) => {
    if (!window.confirm('Supprimer ce poste ?')) return;

    try {
      await axios.delete(`http://localhost:3001/api/postes/${id}`);
      fetchPostes();
    } catch (err) {
      console.error('Erreur suppression poste:', err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Gestion des Postes</h2>

      <div className="mb-6 flex items-center gap-2">
        <input
          type="text"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="Nom du poste"
          className="border border-gray-300 px-3 py-2 rounded-md w-64"
        />
        <button
          onClick={ajouterPoste}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
        >
          Ajouter
        </button>
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Nom</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {postes.map(poste => (
            <tr key={poste.id} className="hover:bg-gray-100">
              <td className="p-2 border">{poste.id}</td>
              <td className="p-2 border">{poste.nom}</td>
              <td className="p-2 border">
                <button
                  onClick={() => supprimerPoste(poste.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
          {postes.length === 0 && (
            <tr>
              <td colSpan="3" className="p-4 text-center text-gray-500">
                Aucun poste trouvé.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PosteList;
