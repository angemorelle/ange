// import React, { useState } from 'react';
// import axios from 'axios';

// const Register = () => {
//   const [form, setForm] = useState({
//     nom: "", email: "", pwd: "", tel: "", profession: "", departement_id: ""
//   });

//   const handleChange = (e) => {
//     setForm({...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.post("http://localhost:3001/api/register", form);
//       alert("Inscription réussie !");
//     } catch (err) {
//       console.error(err);
//       alert("Erreur à l'inscription.");
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="p-6 max-w-md mx-auto">
//       <h2 className="text-xl font-bold mb-4">Inscription</h2>
//       {["nom", "email", "pwd", "tel", "profession", "departement_id"].map(field => (
//         <input
//           key={field}
//           name={field}
//           placeholder={field}
//           type={field === "pwd" ? "password" : "text"}
//           value={form[field]}
//           onChange={handleChange}
//           className="block w-full mb-3 p-2 border rounded"
//           required
//         />
//       ))}
//       <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
//         S’inscrire
//       </button>
//     </form>
//   );
// };

// export default Register;

// import React, { useState } from 'react';
// import axios from 'axios';

// const Register = () => {
//   const [form, setForm] = useState({
//     nom: "", email: "", pwd: "", tel: "", profession: "", departement_id: ""
//   });

//   const handleChange = (e) => {
//     setForm({...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.post("http://localhost:3001/api/register", form);
//       alert("Inscription réussie !");
//     } catch (err) {
//       console.error(err);
//       alert("Erreur à l'inscription.");
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="p-6 max-w-md mx-auto">
//       <h2 className="text-xl font-bold mb-4">Inscription</h2>
//       {["nom", "email", "pwd", "tel", "profession", "departement_id"].map(field => (
//         <input
//           key={field}
//           name={field}
//           placeholder={field}
//           type={field === "pwd" ? "password" : "text"}
//           value={form[field]}
//           onChange={handleChange}
//           className="block w-full mb-3 p-2 border rounded"
//           required
//         />
//       ))}
//       <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
//         S’inscrire
//       </button>
//     </form>
//   );
// };

// export default Register;

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Register = () => {
  const [form, setForm] = useState({
    nom: "", email: "", pwd: "", tel: "", profession: "", departement_id: ""
  });
  const [departements, setDepartements] = useState([]);

  useEffect(() => {
    // Charger la liste des départements depuis le backend
    const fetchDepartements = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/departements");
        setDepartements(res.data);
      } catch (err) {
        console.error("Erreur lors du chargement des départements", err);
      }
    };

    fetchDepartements();
  }, []);

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3001/api/register", form);
      alert("Inscription réussie !");
    } catch (err) {
      console.error(err);
      alert("Erreur à l'inscription.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Inscription électeur</h2>

      <input name="nom" placeholder="Nom" value={form.nom} onChange={handleChange} required className="w-full mb-3 p-2 border rounded" />
      <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required className="w-full mb-3 p-2 border rounded" />
      <input name="pwd" type="password" placeholder="Mot de passe" value={form.pwd} onChange={handleChange} required className="w-full mb-3 p-2 border rounded" />
      <input name="tel" placeholder="Téléphone" value={form.tel} onChange={handleChange} className="w-full mb-3 p-2 border rounded" />
      <input name="profession" placeholder="Profession" value={form.profession} onChange={handleChange} className="w-full mb-3 p-2 border rounded" />

      <select
        name="departement_id"
        value={form.departement_id}
        onChange={handleChange}
        required
        className="w-full mb-4 p-2 border rounded"
      >
        <option value="">-- Choisir un département --</option>
        {departements.map(dep => (
          <option key={dep.id} value={dep.id}>
            {dep.nom}
          </option>
        ))}
      </select>

      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
        S’inscrire
      </button>
    </form>
  );
};

export default Register;
