// import React from 'react';
// import DepartementList from './pages/DepartementList';
// import PosteList from './pages/PosteList';
// import ElectionList from './pages/ElectionForm';
// import ElecteurList from './pages/ElecteurList';
// import SuperviseurList from './pages/SuperviseurList';
// import CandidatList from './pages/CandidatList';
// import PostulerCandidat from './ElecteurPanel/PostulerCandidat';
// import ElectionApp from './Election/ElectionApp';
// import Login from './ElecteurPanel/Login';
// import Register from './ElecteurPanel/Register';
// import ElecteurDashboard from './ElecteurPanel/ElecteurDashboard';

// function App() {
//   return (
//     <div className="App">

//       {/* <ElectionList />
//       <ElecteurList />
//       <CandidatList />
//       <PostulerCandidat /> */}

//       {/* <ElectionApp /> */}
//       <Login/>
//       <Register/>
//       <ElectionList/>
//       <PostulerCandidat/>
//       <ElecteurDashboard/>
//     </div>
//   );
// }

// export default App;


import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './ElecteurPanel/Login';
import Register from './ElecteurPanel/Register';
import ElecteurDashboard from './ElecteurPanel/ElecteurDashboard';

const App = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const userType = localStorage.getItem("userType");

  return (
    <Router>
      <Routes>
        {/* ✅ Redirection automatique sur / */}
        <Route
          path="/"
          element={
            user && userType === "electeur" ? (
              <Navigate to="/electeur/dashboard" />
            ) : (
              <Navigate to="/register" />
            )
          }
        />

        {/* 🔐 Connexion (login) */}
        <Route path="/login" element={<Login />} />

        {/* ✍️ Inscription (register) */}
        <Route path="/register" element={<Register />} />

        {/* 🗳️ Dashboard électeur protégé */}
        <Route
          path="/electeur/dashboard"
          element={
            user && userType === "electeur" ? (
              <ElecteurDashboard />
            ) : (
              <Navigate to="/register" />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;

