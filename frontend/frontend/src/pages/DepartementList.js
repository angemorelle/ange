import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DepartementList = () => {
  const [departements, setDepartements] = useState([]);
  const [nom, setNom] = useState('');

  useEffect(() => {
    fetchDepartements();
  }, []);

  const fetchDepartements = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/departements');
      setDepartements(res.data);
    } catch (err) {
      console.error('Erreur lors du chargement des départements:', err);
    }
  };

  const ajouterDepartement = async () => {
    if (!nom.trim()) return alert("Le nom du département est requis");

    try {
      await axios.post('http://localhost:3001/api/departements', { nom });
      setNom('');
      fetchDepartements();
    } catch (err) {
      console.error('Erreur lors de l’ajout:', err);
    }
  };

  const supprimerDepartement = async (id) => {
    if (!window.confirm('Confirmer la suppression ?')) return;

    try {
      await axios.delete(`http://localhost:3001/api/departements/${id}`);
      fetchDepartements();
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
        🏢 Gestion des Départements
      </h2>

      {/* Formulaire d'ajout */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Nom du département"
            className="border border-gray-300 px-4 py-2 rounded-md w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            onClick={ajouterDepartement}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-2 rounded-md shadow transition"
          >
            ➕ Ajouter
          </button>
        </div>
      </div>

      {/* Tableau des départements */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-md">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="text-xs text-white uppercase bg-blue-600">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Nom du Département</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {departements.map((dep) => (
              <tr key={dep.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{dep.id}</td>
                <td className="px-6 py-4">{dep.nom}</td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => supprimerDepartement(dep.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-medium shadow"
                  >
                    🗑 Supprimer
                  </button>
                </td>
              </tr>
            ))}
            {departements.length === 0 && (
              <tr>
                <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                  Aucun département trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DepartementList;
