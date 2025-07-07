// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ElectionDapp {
    struct Candidate {
        uint id;
        string name;
        string programme;
        uint voteCount;
    }

    struct Election {
        uint id;
        string name;
        bool isOpen;
        uint candidatesCount;
        mapping(uint => Candidate) candidates;
        mapping(address => bool) hasVoted;
    }

    uint public electionsCount;
    mapping(uint => Election) public elections;

    // Ajouter une nouvelle élection
    function addElection(string memory _name) public {
        electionsCount++;
        elections[electionsCount].id = electionsCount;
        elections[electionsCount].name = _name;
        elections[electionsCount].isOpen = true;
    }

    // Ajouter un candidat à une élection
    function addCandidate(uint _electionId, string memory _name, string memory _programme) public {
        Election storage e = elections[_electionId];
        require(e.id != 0, "Election inexistante");
        e.candidatesCount++;
        e.candidates[e.candidatesCount] = Candidate(e.candidatesCount, _name, _programme, 0);
    }

    // Voter pour un candidat d'une élection
    function vote(uint _electionId, uint _candidateId) public {
        Election storage e = elections[_electionId];
        require(e.isOpen, "Election fermee");
        require(!e.hasVoted[msg.sender], "Deja vote");
        require(_candidateId > 0 && _candidateId <= e.candidatesCount, "Candidat invalide");

        e.candidates[_candidateId].voteCount++;
        e.hasVoted[msg.sender] = true;
    }

    // Fermer une election
    function closeElection(uint _electionId) public {
        require(elections[_electionId].id != 0, "Election inexistante");
        elections[_electionId].isOpen = false;
    }

    // Lire les détails d'un candidat
    function getCandidate(uint _electionId, uint _candidateId)
        public
        view
        returns (uint, string memory, string memory, uint)
    {
        Candidate storage c = elections[_electionId].candidates[_candidateId];
        return (c.id, c.name, c.programme, c.voteCount);
    }

    // Obtenir le nombre de candidats dans une élection
    function getCandidatesCount(uint _electionId) public view returns (uint) {
        return elections[_electionId].candidatesCount;
    }

    // Lire les informations d'une élection
    function getElection(uint _electionId)
        public
        view
        returns (uint, string memory, bool, uint)
    {
        Election storage e = elections[_electionId];
        return (e.id, e.name, e.isOpen, e.candidatesCount);
    }
}
