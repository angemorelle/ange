// import React, { useState } from 'react';
// import axios from 'axios';

// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [pwd, setPwd] = useState("");

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await axios.post("http://localhost:3001/api/login", { email, pwd });
//       alert("Connexion réussie !");
//       localStorage.setItem("electeur_id", res.data.user.id);
//     } catch (err) {
//       console.error(err);
//       alert("Identifiants invalides.");
//     }
//   };

//   return (
//     <form onSubmit={handleLogin} className="p-6 max-w-md mx-auto">
//       <h2 className="text-xl font-bold mb-4">Connexion</h2>
//       <input
//         type="email"
//         placeholder="Email"
//         className="block w-full mb-3 p-2 border rounded"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//         required
//       />
//       <input
//         type="password"
//         placeholder="Mot de passe"
//         className="block w-full mb-3 p-2 border rounded"
//         value={pwd}
//         onChange={(e) => setPwd(e.target.value)}
//         required
//       />
//       <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
//         Se connecter
//       </button>
//     </form>
//   );
// };

// export default Login;

import 'bootstrap/dist/css/bootstrap.min.css';

import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [userType, setUserType] = useState("electeur");
  const [message, setMessage] = useState(null);        // Message à afficher
  const [isError, setIsError] = useState(false);        // True = erreur, false = succès

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3001/api/login", {
        email,
        pwd,
        userType
      });

      setIsError(false);
      setMessage(`Connexion réussie en tant que ${userType}`);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("userType", userType);

      // Tu peux ici rediriger avec navigate() si tu utilises React Router
    } catch (err) {
      console.error(err);
      setIsError(true);
      setMessage("Email ou mot de passe invalide.");
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: "#f1f1f1" }}>
      {/* HEADER */}
      <header>
        <nav className="navbar navbar-expand-lg" style={{ backgroundColor: "#6c9eff" }}>
          <div className="container justify-content-center">
            <span className="navbar-brand text-white fs-3 fw-bold">ElectionDapp</span>
          </div>
        </nav>
      </header>

      {/* FORMULAIRE */}
      <main className="flex-fill">
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card shadow p-4">
                <h2 className="mb-4 text-center">Connexion</h2>

                {/* ALERTE */}
                {message && (
                  <div className={`alert ${isError ? 'alert-danger' : 'alert-success'}`} role="alert">
                    {message}
                  </div>
                )}

                <form onSubmit={handleLogin}>
                  <div className="mb-3">
                    <label>Type d'utilisateur</label>
                    <select
                      className="form-select"
                      value={userType}
                      onChange={(e) => setUserType(e.target.value)}
                    >
                      <option value="electeur">Électeur</option>
                      <option value="superviseur">Superviseur</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label>Email</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label>Mot de passe</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Mot de passe"
                      value={pwd}
                      onChange={(e) => setPwd(e.target.value)}
                      required
                    />
                  </div>

                  <div className="text-center">
                    <button type="submit" className="btn btn-primary w-100">
                      Se connecter
                    </button>
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
          &copy; {new Date().getFullYear()} ElectionDapp - Tous droits réservés.
        </div>
      </footer>
    </div>
  );
};

export default Login;
