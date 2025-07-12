import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/api';
import { toast } from 'react-toastify';

const SuperviseurList = () => {
  const [superviseurs, setSuperviseurs] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    nom: '', email: '', pwd: '', tel: '', profession: '', departement_id: ''
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger superviseurs et départements en parallèle
      const [superviseursRes, departementsRes] = await Promise.all([
        adminService.getSuperviseurs(),
        adminService.getDepartements()
      ]);

      console.log('Réponses API:', { superviseursRes, departementsRes });

      if (superviseursRes.success) {
        setSuperviseurs(Array.isArray(superviseursRes.data) ? superviseursRes.data : []);
      } else {
        console.error('Erreur superviseurs:', superviseursRes.error);
        setSuperviseurs([]);
      }

      if (departementsRes.success) {
        setDepartements(Array.isArray(departementsRes.data) ? departementsRes.data : []);
      } else {
        console.error('Erreur départements:', departementsRes.error);
        setDepartements([]);
      }

    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      setError('Erreur lors du chargement des données');
      toast.error('Erreur lors du chargement des données');
      
      setSuperviseurs([]);
      setDepartements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const ajouterSuperviseur = async () => {
    const { nom, email, pwd, departement_id } = form;
    
    if (!nom || !email || !pwd || !departement_id) {
      toast.error("Champs obligatoires manquants (nom, email, mot de passe, département)");
      return;
    }

    try {
      setSubmitting(true);
      const response = await adminService.addSuperviseur(form);
      
      if (response.success) {
        setForm({ nom: '', email: '', pwd: '', tel: '', profession: '', departement_id: '' });
        toast.success('Superviseur ajouté avec succès');
        loadData();
      } else {
        toast.error(response.error || 'Erreur lors de l\'ajout');
      }
    } catch (err) {
      console.error('Erreur ajout superviseur:', err);
      toast.error('Erreur lors de l\'ajout: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const supprimerSuperviseur = async (id) => {
    if (!window.confirm("Confirmer la suppression ?")) return;
    
    try {
      const response = await adminService.deleteSuperviseur(id);
      
      if (response.success) {
        toast.success('Superviseur supprimé avec succès');
        loadData();
      } else {
        toast.error(response.error || 'Erreur lors de la suppression');
      }
    } catch (err) {
      console.error('Erreur suppression superviseur:', err);
      toast.error('Erreur lors de la suppression: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-3" role="alert">
        <h4 className="alert-heading">Erreur</h4>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={loadData}>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: "#f8f9fa" }}>
      {/* HEADER */}
      <header>
        <nav className="navbar navbar-expand-lg" style={{ 
          background: 'linear-gradient(135deg, #FF6B35 0%, #F44336 100%)',
          boxShadow: '0 4px 20px rgba(255, 107, 53, 0.3)'
        }}>
          <div className="container">
            <span className="navbar-brand text-white fs-3 fw-bold">
              🛡️ Gestion des Superviseurs
            </span>
            <div className="d-flex align-items-center text-white">
              <i className="fas fa-users-cog me-2"></i>
              <small>Administration</small>
            </div>
          </div>
        </nav>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-fill">
        <div className="container mt-4">
          {/* Titre et statistiques */}
          <div className="row mb-4">
            <div className="col-md-8">
              <h2 className="fw-bold text-dark mb-2">
                <i className="fas fa-user-shield text-warning me-2"></i>
                Superviseurs Électoraux
              </h2>
              <p className="text-muted">Gérez les superviseurs responsables du contrôle électoral</p>
            </div>
            <div className="col-md-4">
              <div className="card bg-primary text-white">
                <div className="card-body text-center">
                  <h3 className="fw-bold mb-0">{superviseurs.length}</h3>
                  <small>Superviseur(s) actif(s)</small>
                </div>
              </div>
            </div>
          </div>

          {/* FORMULAIRE D'AJOUT */}
          <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '15px' }}>
            <div className="card-header bg-gradient text-white" style={{ 
              background: 'linear-gradient(135deg, #FF6B35 0%, #F44336 100%)',
              borderRadius: '15px 15px 0 0'
            }}>
              <h5 className="mb-0">
                <i className="fas fa-plus-circle me-2"></i>
                Ajouter un Superviseur
              </h5>
            </div>
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="form-floating">
                    <input 
                      type="text" 
                      className="form-control" 
                      id="nom"
                      placeholder="Nom complet"
                      value={form.nom} 
                      onChange={e => setForm({ ...form, nom: e.target.value })} 
                    />
                    <label htmlFor="nom">
                      <i className="fas fa-user me-2"></i>Nom complet *
                    </label>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="form-floating">
                    <input 
                      type="email" 
                      className="form-control" 
                      id="email"
                      placeholder="Email"
                      value={form.email} 
                      onChange={e => setForm({ ...form, email: e.target.value })} 
                    />
                    <label htmlFor="email">
                      <i className="fas fa-envelope me-2"></i>Email *
                    </label>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="form-floating">
                    <input 
                      type="password" 
                      className="form-control" 
                      id="pwd"
                      placeholder="Mot de passe"
                      value={form.pwd} 
                      onChange={e => setForm({ ...form, pwd: e.target.value })} 
                    />
                    <label htmlFor="pwd">
                      <i className="fas fa-lock me-2"></i>Mot de passe *
                    </label>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="form-floating">
                    <input 
                      type="tel" 
                      className="form-control" 
                      id="tel"
                      placeholder="Téléphone"
                      value={form.tel} 
                      onChange={e => setForm({ ...form, tel: e.target.value })} 
                    />
                    <label htmlFor="tel">
                      <i className="fas fa-phone me-2"></i>Téléphone
                    </label>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="form-floating">
                    <input 
                      type="text" 
                      className="form-control" 
                      id="profession"
                      placeholder="Profession"
                      value={form.profession} 
                      onChange={e => setForm({ ...form, profession: e.target.value })} 
                    />
                    <label htmlFor="profession">
                      <i className="fas fa-briefcase me-2"></i>Profession
                    </label>
                  </div>
                </div>

                <div className="col-md-8">
                  <div className="form-floating">
                    <select 
                      className="form-select" 
                      id="departement"
                      value={form.departement_id}
                      onChange={e => setForm({ ...form, departement_id: e.target.value })}
                    >
                      <option value="">Choisir un département</option>
                      {Array.isArray(departements) && departements.map(dep => (
                        <option key={dep.id} value={dep.id}>{dep.nom}</option>
                      ))}
                    </select>
                    <label htmlFor="departement">
                      <i className="fas fa-map-marker-alt me-2"></i>Département *
                    </label>
                  </div>
                </div>

                <div className="col-md-4 d-flex align-items-end">
                  <button 
                    className="btn btn-lg fw-bold text-white w-100"
                    style={{ 
                      background: 'linear-gradient(135deg, #FF6B35 0%, #F44336 100%)',
                      border: 'none'
                    }}
                    onClick={ajouterSuperviseur}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Ajout...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus me-2"></i>
                        Ajouter
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* LISTE DES SUPERVISEURS */}
          <div className="card shadow-sm border-0" style={{ borderRadius: '15px' }}>
            <div className="card-header bg-light border-0" style={{ borderRadius: '15px 15px 0 0' }}>
              <h5 className="mb-0 text-dark">
                <i className="fas fa-list me-2"></i>
                Liste des Superviseurs
              </h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="px-4 py-3">
                        <i className="fas fa-user me-2 text-muted"></i>
                        Superviseur
                      </th>
                      <th className="py-3">
                        <i className="fas fa-envelope me-2 text-muted"></i>
                        Contact
                      </th>
                      <th className="py-3">
                        <i className="fas fa-map-marker-alt me-2 text-muted"></i>
                        Département
                      </th>
                      <th className="text-center py-3">
                        <i className="fas fa-cogs me-2 text-muted"></i>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(superviseurs) && superviseurs.length > 0 ? superviseurs.map(s => (
                      <tr key={s.id} className="border-bottom">
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center">
                            <div className="avatar-circle bg-primary text-white me-3 d-flex align-items-center justify-content-center" 
                                 style={{ width: '40px', height: '40px', borderRadius: '50%' }}>
                              {s.nom.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="fw-bold">{s.nom}</div>
                              <small className="text-muted">{s.profession || 'Superviseur'}</small>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <div>
                            <div className="text-dark">{s.email}</div>
                            <small className="text-muted">
                              <i className="fas fa-phone me-1"></i>
                              {s.tel || 'Non renseigné'}
                            </small>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="badge bg-info text-dark">
                            <i className="fas fa-building me-1"></i>
                            {s.departement_nom || 'Non assigné'}
                          </span>
                        </td>
                        <td className="text-center py-3">
                          <button 
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => supprimerSuperviseur(s.id)}
                            title="Supprimer ce superviseur"
                          >
                            <i className="fas fa-trash-alt me-1"></i>
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" className="text-center py-5">
                          <div className="text-muted">
                            <i className="fas fa-users fa-3x mb-3 d-block"></i>
                            <h5>Aucun superviseur enregistré</h5>
                            <p>Ajoutez votre premier superviseur pour commencer.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-dark text-white text-center py-3 mt-5">
        <div className="container">
          <small>
            <i className="fas fa-shield-alt me-2"></i>
            &copy; {new Date().getFullYear()} ElectionDapp - Système de supervision électoral sécurisé
          </small>
        </div>
      </footer>
    </div>
  );
};

export default SuperviseurList;
