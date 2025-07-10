-- database/schema.sql
-- Refonte complète du schéma de base de données
CREATE DATABASE IF NOT EXISTS election_db;
USE election_db;

-- Table des départements
CREATE TABLE Departement (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des postes électifs
CREATE TABLE Poste (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des élections
CREATE TABLE Elections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    date_ouverture DATETIME NOT NULL,
    date_fermeture DATETIME NOT NULL,
    poste_id INT NOT NULL,
    blockchain_id INT DEFAULT NULL, -- ID sur la blockchain
    status ENUM('planifiee', 'ouverte', 'fermee') DEFAULT 'planifiee',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (poste_id) REFERENCES Poste(id) ON DELETE CASCADE,
    INDEX idx_election_dates (date_ouverture, date_fermeture),
    INDEX idx_election_status (status)
);

-- Table des électeurs
CREATE TABLE Electeurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    pwd VARCHAR(255) NOT NULL,
    tel VARCHAR(20),
    profession VARCHAR(100),
    type ENUM('electeur', 'admin') DEFAULT 'electeur',
    departement_id INT NOT NULL,
    blockchain_address VARCHAR(42), -- Adresse Ethereum
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (departement_id) REFERENCES Departement(id),
    INDEX idx_electeur_email (email),
    INDEX idx_electeur_departement (departement_id)
);

-- Table des superviseurs
CREATE TABLE Superviseur (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    pwd VARCHAR(255) NOT NULL,
    tel VARCHAR(20),
    profession VARCHAR(100),
    departement_id INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (departement_id) REFERENCES Departement(id),
    INDEX idx_superviseur_email (email),
    INDEX idx_superviseur_departement (departement_id)
);

-- Table des candidats
CREATE TABLE Candidats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    electeur_id INT NOT NULL,
    elections_id INT NOT NULL,
    programme TEXT,
    blockchain_id INT DEFAULT NULL, -- ID sur la blockchain
    status ENUM('en_attente', 'approuve', 'rejete') DEFAULT 'en_attente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (electeur_id) REFERENCES Electeurs(id) ON DELETE CASCADE,
    FOREIGN KEY (elections_id) REFERENCES Elections(id) ON DELETE CASCADE,
    UNIQUE KEY unique_candidature (electeur_id, elections_id),
    INDEX idx_candidat_election (elections_id),
    INDEX idx_candidat_electeur (electeur_id)
);

-- Table des bulletins de vote
CREATE TABLE Bulletin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    electeur_id INT NOT NULL,
    elections_id INT NOT NULL,
    candidat_id INT NOT NULL,
    blockchain_tx_hash VARCHAR(66), -- Hash de transaction blockchain
    vote_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (electeur_id) REFERENCES Electeurs(id) ON DELETE CASCADE,
    FOREIGN KEY (elections_id) REFERENCES Elections(id) ON DELETE CASCADE,
    FOREIGN KEY (candidat_id) REFERENCES Candidats(id) ON DELETE CASCADE,
    UNIQUE KEY unique_vote (electeur_id, elections_id),
    INDEX idx_bulletin_election (elections_id),
    INDEX idx_bulletin_candidat (candidat_id),
    INDEX idx_bulletin_timestamp (vote_timestamp)
);

-- Table de synchronisation blockchain
CREATE TABLE Blockchain_Sync (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id INT NOT NULL,
    blockchain_id INT,
    tx_hash VARCHAR(66),
    block_number INT,
    sync_status ENUM('pending', 'synced', 'failed') DEFAULT 'pending',
    last_sync_attempt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sync_table_record (table_name, record_id),
    INDEX idx_sync_status (sync_status)
);

-- Table des sessions utilisateur
CREATE TABLE User_Sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_type ENUM('electeur', 'superviseur') NOT NULL,
    session_token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_session_token (session_token),
    INDEX idx_session_expiry (expires_at)
);

-- Table de log des activités
CREATE TABLE Activity_Log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_type ENUM('electeur', 'superviseur', 'admin') NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_activity_user (user_id, user_type),
    INDEX idx_activity_action (action),
    INDEX idx_activity_date (created_at)
);

-- Insertion de données de test
INSERT INTO Departement (nom) VALUES 
('Paris'), ('Lyon'), ('Marseille'), ('Toulouse'), ('Nice');

INSERT INTO Poste (nom, description) VALUES 
('Maire', 'Élu municipal responsable de la gestion de la commune'),
('Député', 'Représentant à l\'Assemblée nationale'),
('Sénateur', 'Représentant au Sénat'),
('Conseiller Régional', 'Élu au conseil régional');

-- Mot de passe "password123" hashé avec bcrypt
INSERT INTO Electeurs (nom, email, pwd, tel, profession, type, departement_id) VALUES 
('Admin Système', 'admin@election.com', '$2b$10$rONUjxJQ.VjTjvONzJJ.6eRjZjqTBJgR8Zj7VQNjJQ.VjTjvONzJJ', '0123456789', 'Administrateur', 'admin', 1),
('Jean Dupont', 'jean.dupont@email.com', '$2b$10$rONUjxJQ.VjTjvONzJJ.6eRjZjqTBJgR8Zj7VQNjJQ.VjTjvONzJJ', '0123456788', 'Ingénieur', 'electeur', 1),
('Marie Martin', 'marie.martin@email.com', '$2b$10$rONUjxJQ.VjTjvONzJJ.6eRjZjqTBJgR8Zj7VQNjJQ.VjTjvONzJJ', '0123456787', 'Professeur', 'electeur', 2);

INSERT INTO Superviseur (nom, email, pwd, tel, profession, departement_id) VALUES 
('Pierre Superviseur', 'pierre.sup@election.com', '$2b$10$rONUjxJQ.VjTjvONzJJ.6eRjZjqTBJgR8Zj7VQNjJQ.VjTjvONzJJ', '0123456786', 'Superviseur Electoral', 1);