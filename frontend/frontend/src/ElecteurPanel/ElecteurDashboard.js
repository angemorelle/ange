// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const ElecteurDashboard = () => {
//   const [elections, setElections] = useState([]);
//   const electeur = JSON.parse(localStorage.getItem("user")); // récupère l’électeur connecté

//   useEffect(() => {
//     axios.get("http://localhost:3001/api/elections")
//       .then(res => setElections(res.data))
//       .catch(err => console.error("Erreur chargement élections :", err));
//   }, []);

//   const postuler = async (elections_id) => {
//     const programme = prompt("Entrez votre programme électoral :");
//     if (!programme) return;

//     try {
//       await axios.post("http://localhost:3001/api/candidats", {
//         electeur_id: electeur.id,
//         elections_id,
//         programme
//       });
//       alert("Candidature enregistrée !");
//     } catch (err) {
//       alert("Erreur : déjà candidat ou autre problème.");
//     }
//   };

//   const voter = async (elections_id) => {
//     try {
//       await axios.post("http://localhost:3001/api/bulletins", {
//         electeur_id: electeur.id,
//         elections_id
//       });
//       alert("Vote enregistré !");
//     } catch (err) {
//       alert("Erreur : déjà voté ou élection non ouverte.");
//     }
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-bold mb-4">Bienvenue, {electeur.nom}</h2>
      
//       <a
//         href={`/electeur/edit/${electeur.id}`}
//         className="bg-yellow-500 text-white px-4 py-2 rounded mb-6 inline-block"
//       >
//         Modifier mes informations
//       </a>

//       <h3 className="text-lg font-semibold mt-4">Élections disponibles</h3>
//       <table className="w-full mt-4 border text-sm">
//         <thead className="bg-gray-100">
//           <tr>
//             <th className="p-2 border">Nom</th>
//             <th className="p-2 border">Statut</th>
//             <th className="p-2 border">Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {elections.map(e => (
//             <tr key={e.id} className="text-center">
//               <td className="border p-2">{e.nom}</td>
//               <td className="border p-2">{e.status}</td>
//               <td className="border p-2 space-x-2">
//                 <button
//                   onClick={() => postuler(e.id)}
//                   className="bg-green-600 text-white px-2 py-1 rounded"
//                 >
//                   Postuler
//                 </button>
//                 <a
//                   href={`/elections/${e.id}/candidats`}
//                   className="bg-blue-500 text-white px-2 py-1 rounded"
//                 >
//                   Candidats
//                 </a>
//                 {e.status === "ouverte" && (
//                   <button
//                     onClick={() => voter(e.id)}
//                     className="bg-purple-600 text-white px-2 py-1 rounded"
//                   >
//                     Voter
//                   </button>
//                 )}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default ElecteurDashboard;


import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ElecteurDashboard = () => {
  const [elections, setElections] = useState([]);

  const storedUser = localStorage.getItem("user");
  const electeur = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    axios.get("http://localhost:3001/api/elections")
      .then(res => setElections(res.data))
      .catch(err => console.error("Erreur chargement élections :", err));
  }, []);

  if (!electeur) {
    return (
      <p className="text-red-600 text-center mt-10">
        Vous devez être connecté pour accéder à cette page.
      </p>
    );
  }

  const postuler = async (elections_id) => {
    const programme = prompt("Entrez votre programme électoral :");
    if (!programme) return;

    try {
      await axios.post("http://localhost:3001/api/candidats", {
        electeur_id: electeur.id,
        elections_id,
        programme
      });
      alert("Candidature enregistrée !");
    } catch (err) {
      alert("Erreur : déjà candidat ou autre problème.");
    }
  };

  const voter = async (elections_id) => {
    try {
      await axios.post("http://localhost:3001/api/bulletins", {
        electeur_id: electeur.id,
        elections_id
      });
      alert("Vote enregistré !");
    } catch (err) {
      alert("Erreur : déjà voté ou élection non ouverte.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Bienvenue, {electeur.nom}</h2>

      <a
        href={`/electeur/edit/${electeur.id}`}
        className="bg-yellow-500 text-white px-4 py-2 rounded mb-6 inline-block"
      >
        Modifier mes informations
      </a>

      <h3 className="text-lg font-semibold mt-4">Élections disponibles</h3>
      <table className="w-full mt-4 border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Nom</th>
            <th className="p-2 border">Date ouverture</th>
            <th className="p-2 border">Date fermeture</th>
            <th className="p-2 border">Statut</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {elections.map(e => (
            <tr key={e.id} className="text-center">
              <td className="border p-2">{e.nom}</td>
              <td className="border p-2">{new Date(e.date_ouverture).toLocaleString()}</td>
              <td className="border p-2">{new Date(e.date_fermeture).toLocaleString()}</td>
              <td className="border p-2">{e.status}</td>
              <td className="border p-2 space-x-2">
                <button
                  onClick={() => postuler(e.id)}
                  className="bg-green-600 text-white px-2 py-1 rounded"
                >
                  Postuler
                </button>
                <a
                  href={`/elections/${e.id}/candidats`}
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                >
                  Candidats
                </a>
                {e.status === "ouverte" && (
                  <button
                    onClick={() => voter(e.id)}
                    className="bg-purple-600 text-white px-2 py-1 rounded"
                  >
                    Voter
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ElecteurDashboard;
