-- database/add-complete-data.sql
-- Script pour ajouter des données complètes dans toutes les tables

USE election_db;

-- Ajouter plus de départements
INSERT INTO Departement (nom) VALUES 
('Bordeaux'), ('Lille'), ('Nantes'), ('Strasbourg'), ('Montpellier'),
('Rennes'), ('Reims'), ('Le Havre'), ('Saint-Étienne'), ('Toulon');

-- Ajouter plus de postes électifs
INSERT INTO Poste (nom, description) VALUES 
('Président de Région', 'Élu responsable de la gestion régionale'),
('Conseiller Municipal', 'Représentant au conseil municipal'),
('Député Européen', 'Représentant au Parlement européen'),
('Président de Département', 'Élu responsable de la gestion départementale');

-- Ajouter plus d'élections avec différents statuts
INSERT INTO Elections (nom, description, date_ouverture, date_fermeture, poste_id, status) VALUES 
-- Élections futures (pour candidatures)
('Élection Municipale Bordeaux 2024', 'Élection du nouveau maire de Bordeaux', '2024-03-15 08:00:00', '2024-03-15 18:00:00', 1, 'planifiee'),
('Élection Conseil Régional 2024', 'Élection des conseillers régionaux', '2024-04-20 08:00:00', '2024-04-20 20:00:00', 5, 'planifiee'),
('Élection Député Européen 2024', 'Élection du député européen', '2024-06-09 08:00:00', '2024-06-09 20:00:00', 7, 'planifiee'),

-- Élections en cours
('Élection Maire Lyon 2024', 'Élection municipale de Lyon en cours', '2024-01-13 08:00:00', '2024-01-15 20:00:00', 1, 'ouverte'),
('Élection Conseiller Municipal Paris', 'Élection conseil municipal Paris', '2024-01-13 08:00:00', '2024-01-14 18:00:00', 6, 'ouverte'),

-- Élections fermées
('Élection Sénateur 2023', 'Élection sénatoriale terminée', '2023-12-10 08:00:00', '2023-12-10 18:00:00', 3, 'fermee'),
('Élection Député Marseille 2023', 'Élection législative Marseille', '2023-11-15 08:00:00', '2023-11-15 20:00:00', 2, 'fermee');

-- Ajouter plus d'électeurs
INSERT INTO Electeurs (nom, email, pwd, tel, profession, type, departement_id) VALUES 
-- Électeurs normaux
('Sophie Bernard', 'sophie.bernard@email.com', '$2b$12$URrRbjeXTI9HdlCjh7SgHei0x3pax/tWH0NsE/fN0lJAlzwYUY7ky', '0234567890', 'Avocate', 'electeur', 1),
('Pierre Moreau', 'pierre.moreau@email.com', '$2b$12$URrRbjeXTI9HdlCjh7SgHei0x3pax/tWH0NsE/fN0lJAlzwYUY7ky', '0345678901', 'Médecin', 'electeur', 2),
('Claire Lemoine', 'claire.lemoine@email.com', '$2b$12$URrRbjeXTI9HdlCjh7SgHei0x3pax/tWH0NsE/fN0lJAlzwYUY7ky', '0456789012', 'Enseignante', 'electeur', 3),
('Marc Petit', 'marc.petit@email.com', '$2b$12$URrRbjeXTI9HdlCjh7SgHei0x3pax/tWH0NsE/fN0lJAlzwYUY7ky', '0567890123', 'Ingénieur', 'electeur', 1),
('Ana Garcia', 'ana.garcia@email.com', '$2b$12$URrRbjeXTI9HdlCjh7SgHei0x3pax/tWH0NsE/fN0lJAlzwYUY7ky', '0678901234', 'Architecte', 'electeur', 2),
('Carlos Martinez', 'carlos.martinez@email.com', '$2b$12$URrRbjeXTI9HdlCjh7SgHei0x3pax/tWH0NsE/fN0lJAlzwYUY7ky', '0789012345', 'Chef d\'entreprise', 'electeur', 3),
('Julie Rousseau', 'julie.rousseau@email.com', '$2b$12$URrRbjeXTI9HdlCjh7SgHei0x3pax/tWH0NsE/fN0lJAlzwYUY7ky', '0890123456', 'Journaliste', 'electeur', 4),
('Thomas Leblanc', 'thomas.leblanc@email.com', '$2b$12$URrRbjeXTI9HdlCjh7SgHei0x3pax/tWH0NsE/fN0lJAlzwYUY7ky', '0901234567', 'Comptable', 'electeur', 5),

-- Administrateurs supplémentaires
('Admin Regional', 'admin.regional@election.com', '$2b$12$URrRbjeXTI9HdlCjh7SgHei0x3pax/tWH0NsE/fN0lJAlzwYUY7ky', '0123456790', 'Admin Régional', 'admin', 2),
('Admin National', 'admin.national@election.com', '$2b$12$URrRbjeXTI9HdlCjh7SgHei0x3pax/tWH0NsE/fN0lJAlzwYUY7ky', '0123456791', 'Admin National', 'admin', 1);

-- Ajouter plus de superviseurs
INSERT INTO Superviseur (nom, email, pwd, tel, profession, departement_id) VALUES 
('Supervisor Lyon', 'supervisor.lyon@election.com', '$2b$12$URrRbjeXTI9HdlCjh7SgHei0x3pax/tWH0NsE/fN0lJAlzwYUY7ky', '0234567891', 'Superviseur Lyon', 2),
('Supervisor Marseille', 'supervisor.marseille@election.com', '$2b$12$URrRbjeXTI9HdlCjh7SgHei0x3pax/tWH0NsE/fN0lJAlzwYUY7ky', '0234567892', 'Superviseur Marseille', 3),
('Supervisor Toulouse', 'supervisor.toulouse@election.com', '$2b$12$URrRbjeXTI9HdlCjh7SgHei0x3pax/tWH0NsE/fN0lJAlzwYUY7ky', '0234567893', 'Superviseur Toulouse', 4),
('Supervisor Nice', 'supervisor.nice@election.com', '$2b$12$URrRbjeXTI9HdlCjh7SgHei0x3pax/tWH0NsE/fN0lJAlzwYUY7ky', '0234567894', 'Superviseur Nice', 5);

-- Ajouter des candidatures variées
INSERT INTO Candidats (electeur_id, elections_id, programme, status) VALUES 
-- Candidatures pour l'élection 6 (Municipale Bordeaux - future)
(4, 6, 'Programme pour améliorer les transports publics et l\'écologie urbaine à Bordeaux. Mise en place de pistes cyclables sécurisées et développement des espaces verts.', 'en_attente'),
(5, 6, 'Programme axé sur le développement économique local et le soutien aux PME bordelaises. Création d\'un incubateur municipal pour les startups.', 'approuve'),
(6, 6, 'Programme social : augmentation des crèches municipales et aide au logement pour les jeunes actifs. Amélioration des services publics de proximité.', 'approuve'),

-- Candidatures pour l'élection 7 (Conseil Régional)  
(7, 7, 'Programme régional pour le développement durable : transition énergétique, agriculture bio et tourisme vert dans toute la région.', 'approuve'),
(8, 7, 'Programme d\'innovation et de numérique : développement de la fibre optique rurale et création de zones d\'activités numériques.', 'en_attente'),
(9, 7, 'Programme éducatif : rénovation des lycées régionaux et création de nouvelles formations professionnelles adaptées aux métiers d\'avenir.', 'approuve'),

-- Candidatures pour l'élection 9 (Lyon - en cours)
(2, 9, 'Vision moderne pour Lyon : smart city, mobilité douce et innovation technologique au service des citoyens lyonnais.', 'approuve'),
(4, 9, 'Programme culturel et patrimonial : valorisation du patrimoine lyonnais et soutien aux artistes locaux.', 'approuve'),
(6, 9, 'Programme social et solidaire : lutte contre la précarité et développement des services de proximité.', 'approuve'),

-- Candidatures pour l'élection 10 (Conseil Municipal Paris - en cours)
(3, 10, 'Amélioration de la qualité de vie parisienne : espaces verts, propreté urbaine et lutte contre la pollution.', 'approuve'),
(5, 10, 'Paris ville inclusive : accessibilité pour tous, logement social et mixité urbaine.', 'approuve'),

-- Candidatures pour élections fermées (pour avoir des résultats)
(2, 11, 'Programme sénatorial axé sur la défense des territoires ruraux et la décentralisation.', 'approuve'),
(3, 11, 'Programme pour le renforcement des collectivités locales et l\'autonomie territoriale.', 'approuve'),
(7, 12, 'Programme législatif pour Marseille : sécurité, emploi et développement des quartiers nord.', 'approuve'),
(8, 12, 'Programme de rénovation urbaine et de développement économique du port de Marseille.', 'approuve');

-- Ajouter des votes pour les élections fermées
INSERT INTO Bulletin (electeur_id, elections_id, candidat_id, blockchain_tx_hash, vote_timestamp) VALUES 
-- Votes pour l'élection 11 (Sénateur 2023)
(2, 11, 13, '0x1234567890abcdef1234567890abcdef12345678', '2023-12-10 10:30:00'),
(3, 11, 13, '0x2345678901bcdef12345678901cdef123456789', '2023-12-10 11:15:00'),
(4, 11, 14, '0x3456789012cdef23456789012def1234567890', '2023-12-10 14:20:00'),
(5, 11, 13, '0x456789013def3456789013ef12345678901a', '2023-12-10 15:45:00'),
(6, 11, 14, '0x56789014ef456789014f123456789012ab', '2023-12-10 16:30:00'),

-- Votes pour l'élection 12 (Député Marseille 2023)
(7, 12, 15, '0x6789015f56789015123456789013abc', '2023-11-15 09:00:00'),
(8, 12, 16, '0x789016056789016234567890124bcd', '2023-11-15 10:30:00'),
(9, 12, 15, '0x89017156789017345678901235cde', '2023-11-15 12:00:00'),
(10, 12, 15, '0x9018267890118456789012346def', '2023-11-15 14:15:00'),
(11, 12, 16, '0xa019378901229567890123457ef0', '2023-11-15 16:45:00');

-- Ajouter des données de synchronisation blockchain
INSERT INTO Blockchain_Sync (table_name, record_id, blockchain_id, tx_hash, block_number, sync_status) VALUES 
('Elections', 11, 1001, '0xabcdef1234567890abcdef1234567890abcdef12', 1500001, 'synced'),
('Elections', 12, 1002, '0xbcdef1234567890abcdef1234567890abcdef123', 1500025, 'synced'),
('Candidats', 13, 2001, '0xcdef1234567890abcdef1234567890abcdef1234', 1500002, 'synced'),
('Candidats', 14, 2002, '0xdef1234567890abcdef1234567890abcdef12345', 1500003, 'synced'),
('Candidats', 15, 2003, '0xef1234567890abcdef1234567890abcdef123456', 1500026, 'synced'),
('Candidats', 16, 2004, '0xf1234567890abcdef1234567890abcdef1234567', 1500027, 'synced'),
('Elections', 9, 1003, '0x1234567890abcdef1234567890abcdef12345678', 1500050, 'pending'),
('Elections', 10, 1004, '0x234567890abcdef1234567890abcdef123456789', 1500051, 'pending');

-- Ajouter des sessions utilisateur actives
INSERT INTO User_Sessions (user_id, user_type, session_token, expires_at) VALUES 
(1, 'admin', 'session_admin_1234567890abcdef', DATE_ADD(NOW(), INTERVAL 24 HOUR)),
(2, 'electeur', 'session_electeur_234567890abcdef1', DATE_ADD(NOW(), INTERVAL 24 HOUR)),
(3, 'electeur', 'session_electeur_34567890abcdef12', DATE_ADD(NOW(), INTERVAL 24 HOUR));

-- Ajouter des logs d'activité
INSERT INTO Activity_Log (user_id, user_type, action, details, ip_address) VALUES 
(1, 'admin', 'login', '{"timestamp":"2024-01-13T10:00:00Z","success":true}', '192.168.1.100'),
(2, 'electeur', 'login', '{"timestamp":"2024-01-13T10:15:00Z","success":true}', '192.168.1.101'),
(2, 'electeur', 'candidature_submitted', '{"candidature_id":1,"election_id":6,"submitted_at":"2024-01-13T10:30:00Z"}', '192.168.1.101'),
(3, 'electeur', 'login', '{"timestamp":"2024-01-13T11:00:00Z","success":true}', '192.168.1.102'),
(1, 'admin', 'election_created', '{"election_id":9,"nom":"Élection Maire Lyon 2024"}', '192.168.1.100'),
(4, 'electeur', 'blockchain_address_generated', '{"blockchain_address":"0x742d35Cc6635C0532925a3b8D2FDaF2741395B5F","generated_at":"2024-01-13T11:30:00Z"}', '192.168.1.103'),
(5, 'electeur', 'vote_submitted', '{"election_id":11,"candidat_id":13,"vote_timestamp":"2023-12-10T15:45:00Z"}', '192.168.1.104'),
(1, 'admin', 'supervisor_access', '{"timestamp":"2024-01-13T12:00:00Z","success":true}', '192.168.1.105'),
(6, 'electeur', 'candidature_approved', '{"candidature_id":3,"approved_by":1,"approved_at":"2024-01-13T12:30:00Z"}', '192.168.1.100'),
(7, 'electeur', 'vote_submitted', '{"election_id":12,"candidat_id":15,"vote_timestamp":"2023-11-15T09:00:00Z"}', '192.168.1.106');

-- Mettre à jour quelques électeurs avec des adresses blockchain
UPDATE Electeurs SET blockchain_address = '0x742d35Cc6635C0532925a3b8D2FDaF2741395B5F' WHERE id = 2;
UPDATE Electeurs SET blockchain_address = '0x8ba1f109551bD432803012645Hac136c5c12925A' WHERE id = 3;
UPDATE Electeurs SET blockchain_address = '0x1d96F2a57b8f45a2d3eC6e8Eadc4d8B5A7C9B4E1' WHERE id = 4;
UPDATE Electeurs SET blockchain_address = '0x7aB3f125d8A4b2c9E5F7d1C6B8A2D5E9F4C7B1A3' WHERE id = 5;
UPDATE Electeurs SET blockchain_address = '0x3eD5a8B9C2F1E4A7D9B6C3F8E1A4D7B2C5F9E8A1' WHERE id = 6;

-- Afficher un résumé des données insérées
SELECT 'Résumé des données ajoutées:' as message;
SELECT 'Départements' as table_name, COUNT(*) as total FROM Departement;
SELECT 'Postes' as table_name, COUNT(*) as total FROM Poste;
SELECT 'Élections' as table_name, COUNT(*) as total FROM Elections;
SELECT 'Électeurs' as table_name, COUNT(*) as total FROM Electeurs;
SELECT 'Superviseurs' as table_name, COUNT(*) as total FROM Superviseur;
SELECT 'Candidats' as table_name, COUNT(*) as total FROM Candidats;
SELECT 'Bulletins de vote' as table_name, COUNT(*) as total FROM Bulletin;
SELECT 'Sync Blockchain' as table_name, COUNT(*) as total FROM Blockchain_Sync;
SELECT 'Sessions utilisateur' as table_name, COUNT(*) as total FROM User_Sessions;
SELECT 'Logs activité' as table_name, COUNT(*) as total FROM Activity_Log;

COMMIT; 