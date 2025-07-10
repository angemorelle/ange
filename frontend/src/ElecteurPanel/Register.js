// // import React, { useState } from 'react';
// // import axios from 'axios';

// // const Register = () => {
// //   const [form, setForm] = useState({
// //     nom: "", email: "", pwd: "", tel: "", profession: "", departement_id: ""
// //   });

// //   const handleChange = (e) => {
// //     setForm({...form, [e.target.name]: e.target.value });
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     try {
// //       await axios.post("http://localhost:3001/api/register", form);
// //       alert("Inscription réussie !");
// //     } catch (err) {
// //       console.error(err);
// //       alert("Erreur à l'inscription.");
// //     }
// //   };

// //   return (
// //     <form onSubmit={handleSubmit} className="p-6 max-w-md mx-auto">
// //       <h2 className="text-xl font-bold mb-4">Inscription</h2>
// //       {["nom", "email", "pwd", "tel", "profession", "departement_id"].map(field => (
// //         <input
// //           key={field}
// //           name={field}
// //           placeholder={field}
// //           type={field === "pwd" ? "password" : "text"}
// //           value={form[field]}
// //           onChange={handleChange}
// //           className="block w-full mb-3 p-2 border rounded"
// //           required
// //         />
// //       ))}
// //       <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
// //         S’inscrire
// //       </button>
// //     </form>
// //   );
// // };

// // export default Register;

// // import React, { useState } from 'react';
// // import axios from 'axios';

// // const Register = () => {
// //   const [form, setForm] = useState({
// //     nom: "", email: "", pwd: "", tel: "", profession: "", departement_id: ""
// //   });

// //   const handleChange = (e) => {
// //     setForm({...form, [e.target.name]: e.target.value });
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     try {
// //       await axios.post("http://localhost:3001/api/register", form);
// //       alert("Inscription réussie !");
// //     } catch (err) {
// //       console.error(err);
// //       alert("Erreur à l'inscription.");
// //     }
// //   };

// //   return (
// //     <form onSubmit={handleSubmit} className="p-6 max-w-md mx-auto">
// //       <h2 className="text-xl font-bold mb-4">Inscription</h2>
// //       {["nom", "email", "pwd", "tel", "profession", "departement_id"].map(field => (
// //         <input
// //           key={field}
// //           name={field}
// //           placeholder={field}
// //           type={field === "pwd" ? "password" : "text"}
// //           value={form[field]}
// //           onChange={handleChange}
// //           className="block w-full mb-3 p-2 border rounded"
// //           required
// //         />
// //       ))}
// //       <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
// //         S’inscrire
// //       </button>
// //     </form>
// //   );
// // };

// // export default Register;

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const Register = () => {
//   const [form, setForm] = useState({
//     nom: "", email: "", pwd: "", tel: "", profession: "", departement_id: ""
//   });
//   const [departements, setDepartements] = useState([]);

//   useEffect(() => {
//     // Charger la liste des départements depuis le backend
//     const fetchDepartements = async () => {
//       try {
//         const res = await axios.get("http://localhost:3001/api/departements");
//         setDepartements(res.data);
//       } catch (err) {
//         console.error("Erreur lors du chargement des départements", err);
//       }
//     };

//     fetchDepartements();
//   }, []);

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
//       <h2 className="text-xl font-bold mb-4">Inscription électeur</h2>

//       <input name="nom" placeholder="Nom" value={form.nom} onChange={handleChange} required className="w-full mb-3 p-2 border rounded" />
//       <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required className="w-full mb-3 p-2 border rounded" />
//       <input name="pwd" type="password" placeholder="Mot de passe" value={form.pwd} onChange={handleChange} required className="w-full mb-3 p-2 border rounded" />
//       <input name="tel" placeholder="Téléphone" value={form.tel} onChange={handleChange} className="w-full mb-3 p-2 border rounded" />
//       <input name="profession" placeholder="Profession" value={form.profession} onChange={handleChange} className="w-full mb-3 p-2 border rounded" />

//       <select
//         name="departement_id"
//         value={form.departement_id}
//         onChange={handleChange}
//         required
//         className="w-full mb-4 p-2 border rounded"
//       >
//         <option value="">-- Choisir un département --</option>
//         {departements.map(dep => (
//           <option key={dep.id} value={dep.id}>
//             {dep.nom}
//           </option>
//         ))}
//       </select>

//       <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
//         S’inscrire
//       </button>
//     </form>
//   );
// };

// export default Register;
import 'bootstrap/dist/css/bootstrap.min.css';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Register = () => {
  const [form, setForm] = useState({
    nom: "", email: "", pwd: "", tel: "", profession: "", departement_id: ""
  });
  const [departements, setDepartements] = useState([]);

  useEffect(() => {
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
    setForm({ ...form, [e.target.name]: e.target.value });
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
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: "#f1f1f1" }}>
      {/* HEADER */}
      <header>
        <nav className="navbar navbar-expand-lg" style={{ backgroundColor: "#6c9eff" }}>
          <div className="container justify-content-center">
            <span className="navbar-brand text-white fs-3 fw-bold">Election</span>
          </div>
        </nav>
      </header>

      {/* FORMULAIRE */}
      <main className="flex-fill">
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card shadow p-4">
                <h2 className="mb-4 text-center">Inscription Électeur</h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label>Nom</label>
                    <input type="text" name="nom" className="form-control" value={form.nom} onChange={handleChange} required />
                  </div>
                  <div className="mb-3">
                    <label>Email</label>
                    <input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} required />
                  </div>
                  <div className="mb-3">
                    <label>Mot de passe</label>
                    <input type="password" name="pwd" className="form-control" value={form.pwd} onChange={handleChange} required />
                  </div>
                  <div className="mb-3">
                    <label>Téléphone</label>
                    <input type="text" name="tel" className="form-control" value={form.tel} onChange={handleChange} />
                  </div>
                  <div className="mb-3">
                    <label>Profession</label>
                    <input type="text" name="profession" className="form-control" value={form.profession} onChange={handleChange} />
                  </div>
                  <div className="mb-4">
                    <label>Département</label>
                    <select name="departement_id" className="form-select" value={form.departement_id} onChange={handleChange} required>
                      <option value="">-- Choisir un département --</option>
                      {departements.map(dep => (
                        <option key={dep.id} value={dep.id}>{dep.nom}</option>
                      ))}
                    </select>
                  </div>
                  <div className="text-center">
                    <button type="submit" className="btn btn-success w-100">S’inscrire</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-dark text-white text-center py-3 mt-4">
        <div className="container">
          &copy; {new Date().getFullYear()} Election - Tous droits réservés.
        </div>
      </footer>
    </div>
  );
};

export default Register;
