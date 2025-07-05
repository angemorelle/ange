// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;

import React from 'react';
import DepartementList from './pages/DepartementList';
import PosteList from './pages/PosteList';
import ElectionList from './pages/ElectionForm';
import ElecteurList from './pages/ElecteurList';
import SuperviseurList from './pages/SuperviseurList';
import CandidatList from './pages/CandidatList';
import PostulerCandidat from './ElecteurPanel/PostulerCandidat';

function App() {
  return (
    <div className="App">
      <ElectionList />
      <ElecteurList />
      <CandidatList />
      <PostulerCandidat />
      {/* <PosteList /> */}
    </div>
  );
}

export default App;
