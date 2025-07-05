import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SuperviseurList = () => {
  const [superviseurs, setSuperviseurs] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [form, setForm] = useState({
    nom: '', email: '', pwd: '', tel: '', profession: '', departement_id: ''
  });

  useEffect(() => {
    fetchSuperviseurs();
    fetchDepartements();
  }, []);

  const fetchSuperviseurs = async () => {
    const res = await axios.get('http://localhost:3001/api/superviseurs');
    setSuperviseurs(res.data);
  };

  const fetchDepartements = async () => {
    const res = await axios.get('http://localhost:3001/api/departements');
    setDepartements(res.data);
  };

  const ajouterSuperviseur = async () => {
    const { nom, email, pwd, tel, profession, departement_id } = form;
    if (!nom || !email || !pwd || !departement_id) {
      return alert("Tous les champs obligatoires doivent être remplis");
    }

    try {
      await axios.post('http://localhost:3001/api/superviseurs', form);
      setForm({ nom: '', email: '', pwd: '', tel: '', profession: '', departement_id: '' });
      fetchSuperviseurs();
    } catch (err) {
      console.error(err);
    }
  };

  const supprimerSuperviseur = async (id) => {
    if (!window.confirm("Confirmer la suppression ?")) return;
    await axios.delete(`http://localhost:3001/api/superviseurs/${id}`);
    fetchSuperviseurs();
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Gestion des Superviseurs</h2>

      <div className="grid grid-cols-3 gap-4 mb-6">
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
        <select value={form.departement_id}
          onChange={e => setForm({ ...form, departement_id: e.target.value })}
          className="border px-3 py-2 rounded">
          <option value="">-- Département --</option>
          {departements.map(dep => (
            <option key={dep.id} value={dep.id}>{dep.nom}</option>
          ))}
        </select>
        <button onClick={ajouterSuperviseur}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 col-span-3">
          Ajouter
        </button>
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">Nom</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Téléphone</th>
            <th className="p-2 border">Département</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {superviseurs.map(s => (
            <tr key={s.id} className="hover:bg-gray-100">
              <td className="p-2 border">{s.nom}</td>
              <td className="p-2 border">{s.email}</td>
              <td className="p-2 border">{s.tel}</td>
              <td className="p-2 border">{s.departement_nom}</td>
              <td className="p-2 border">
                <button onClick={() => supprimerSuperviseur(s.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
          {superviseurs.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center text-gray-500 py-4">
                Aucun superviseur.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SuperviseurList;
