import React, { useEffect, useState } from "react";
import Web3 from "../web3.js";
// import Election from "./abis/Election.json";
import Election from "../abis/ElectionDapp.json";

const ElectionApp = () => {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [voteDone, setVoteDone] = useState(false);

  const contractAddress = "0x33263E2caB7F66903B29cc901c01ABF9a623D209"; // Remplace par l’adresse déployée

  useEffect(() => {
    const init = async () => {
      const accounts = await Web3.eth.getAccounts();
      setAccount(accounts[0]);

      const networkId = await Web3.eth.net.getId();
      const deployedNetwork = Election.networks[networkId];

      const instance = new Web3.eth.Contract(
        Election.abi,
        deployedNetwork && deployedNetwork.address
      );

      setContract(instance);
      const electionId=1
      const count = await instance.methods.getCandidatesCount(electionId).call();
      const list = [];

      for (let i = 1; i <= count; i++) {
        const cand = await instance.methods.candidates(i).call();
        list.push(cand);
      }

      setCandidates(list);
    };

    init();
  }, []);

  const vote = async (id) => {
    try {
      await contract.methods.vote(id).send({ from: account });
      alert("Vote enregistré !");
      setVoteDone(true);
    } catch (err) {
      console.error(err);
      alert("Erreur : peut-être déjà voté ?");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Candidats disponibles</h2>
      <ul>
        {candidates.map((c) => (
          <li key={c.id} className="mt-2">
            {c.name} — {c.voteCount} votes
            <button
              onClick={() => vote(c.id)}
              className="ml-4 bg-blue-500 text-white px-3 py-1 rounded"
            >
              Voter
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ElectionApp;
