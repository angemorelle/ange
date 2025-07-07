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

import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [userType, setUserType] = useState("electeur"); // par défaut

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3001/api/login", {
        email,
        pwd,
        userType
      });

      alert(`Connexion réussie en tant que ${userType}`);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("userType", userType);
    } catch (err) {
      console.error(err);
      alert("Email ou mot de passe invalide.");
    }
  };

  return (
    <form onSubmit={handleLogin} className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Connexion</h2>

      <select
        value={userType}
        onChange={(e) => setUserType(e.target.value)}
        className="w-full mb-4 p-2 border rounded"
      >
        <option value="electeur">Electeur</option>
        <option value="superviseur">Superviseur</option>
      </select>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full mb-3 p-2 border rounded"
        required
      />
      <input
        type="password"
        placeholder="Mot de passe"
        value={pwd}
        onChange={(e) => setPwd(e.target.value)}
        className="w-full mb-3 p-2 border rounded"
        required
      />

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Se connecter
      </button>
    </form>
  );
};

export default Login;
