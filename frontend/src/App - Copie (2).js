import React from 'react';
import DepartementList from './pages/DepartementList';
import PosteList from './pages/PosteList';
import ElectionList from './pages/ElectionForm';
import ElecteurList from './pages/ElecteurList';
import SuperviseurList from './pages/SuperviseurList';
import CandidatList from './pages/CandidatList';
import PostulerCandidat from './ElecteurPanel/PostulerCandidat';
import ElectionApp from './Election/ElectionApp';
import Login from './ElecteurPanel/Login';
import Register from './ElecteurPanel/Register';
import ElecteurDashboard from './ElecteurPanel/ElecteurDashboard';

function App() {
  return (
    <div className="App">

      {/* <ElectionList />
      <ElecteurList />
      <CandidatList />
      <PostulerCandidat /> */}

      {/* <ElectionApp /> */}
      <Login/>
      <Register/>
      <ElectionList/>
      <PostulerCandidat/>
      <ElecteurDashboard/>
    </div>
  );
}

export default App;
