import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nom: "", email: "", pwd: "", tel: "", profession: "", departement_id: ""
  });
  const [departements, setDepartements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadDepartements = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.getDepartements();
      
      if (response.success) {
        setDepartements(Array.isArray(response.data) ? response.data : []);
      } else {
        console.error('Erreur départements:', response.error);
        setDepartements([]);
        toast.error('Erreur lors du chargement des départements');
      }
    } catch (err) {
      console.error("Erreur lors du chargement des départements", err);
      setDepartements([]);
      toast.error('Erreur lors du chargement des départements');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDepartements();
  }, [loadDepartements]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.nom || !form.email || !form.pwd || !form.departement_id) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      setSubmitting(true);
      const response = await adminService.addElecteur(form);
      
      if (response.success) {
        toast.success("Inscription réussie ! Vous pouvez maintenant vous connecter.");
        navigate('/login');
      } else {
        toast.error(response.error || "Erreur lors de l'inscription");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'inscription: " + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* HEADER */}
      <header>
        <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
          <div className="container">
            <span className="navbar-brand fs-3 fw-bold">
              🗳️ ElectionDapp
            </span>
            <button 
              className="btn btn-outline-light btn-sm"
              onClick={() => navigate('/login')}
            >
              Se connecter
            </button>
          </div>
        </nav>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-fill d-flex align-items-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-8">
              <div className="card shadow-lg border-0" style={{ borderRadius: '20px' }}>
                <div className="card-body p-5">
                  <div className="text-center mb-4">
                    <div className="mb-3">
                      <span style={{ fontSize: '3rem' }}>👤</span>
                    </div>
                    <h2 className="fw-bold text-dark mb-2">Créer un compte</h2>
                    <p className="text-muted">Rejoignez la plateforme électorale sécurisée</p>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="form-floating">
                          <input 
                            type="text" 
                            name="nom" 
                            className="form-control" 
                            id="nom"
                            placeholder="Nom complet"
                            value={form.nom} 
                            onChange={handleChange} 
                            required 
                          />
                          <label htmlFor="nom">Nom complet *</label>
                        </div>
                      </div>
                      
                      <div className="col-md-6">
                        <div className="form-floating">
                          <input 
                            type="email" 
                            name="email" 
                            className="form-control" 
                            id="email"
                            placeholder="Email"
                            value={form.email} 
                            onChange={handleChange} 
                            required 
                          />
                          <label htmlFor="email">Adresse email *</label>
                        </div>
                      </div>

                      <div className="col-12">
                        <div className="form-floating">
                          <input 
                            type="password" 
                            name="pwd" 
                            className="form-control" 
                            id="pwd"
                            placeholder="Mot de passe"
                            value={form.pwd} 
                            onChange={handleChange} 
                            required 
                            minLength="6"
                          />
                          <label htmlFor="pwd">Mot de passe *</label>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-floating">
                          <input 
                            type="tel" 
                            name="tel" 
                            className="form-control" 
                            id="tel"
                            placeholder="Téléphone"
                            value={form.tel} 
                            onChange={handleChange} 
                          />
                          <label htmlFor="tel">Téléphone</label>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-floating">
                          <input 
                            type="text" 
                            name="profession" 
                            className="form-control" 
                            id="profession"
                            placeholder="Profession"
                            value={form.profession} 
                            onChange={handleChange} 
                          />
                          <label htmlFor="profession">Profession</label>
                        </div>
                      </div>

                      <div className="col-12">
                        <div className="form-floating">
                          <select 
                            name="departement_id" 
                            className="form-select" 
                            id="departement"
                            value={form.departement_id} 
                            onChange={handleChange} 
                            required
                          >
                            <option value="">Choisir un département</option>
                            {Array.isArray(departements) && departements.map(dep => (
                              <option key={dep.id} value={dep.id}>
                                {dep.nom}
                              </option>
                            ))}
                          </select>
                          <label htmlFor="departement">Département *</label>
                        </div>
                      </div>
                    </div>

                    <div className="d-grid gap-2 mt-4">
                      <button 
                        type="submit" 
                        className="btn btn-lg fw-bold text-white"
                        style={{ 
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          border: 'none'
                        }}
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Inscription en cours...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-user-plus me-2"></i>
                            Créer mon compte
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-center mt-3">
                      <small className="text-muted">
                        Déjà inscrit ? 
                        <button 
                          type="button"
                          className="btn btn-link btn-sm p-0 ms-1"
                          onClick={() => navigate('/login')}
                        >
                          Se connecter
                        </button>
                      </small>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-dark bg-opacity-75 text-white text-center py-3">
        <div className="container">
          <small>
            &copy; {new Date().getFullYear()} ElectionDapp - Plateforme électorale sécurisée par blockchain
          </small>
        </div>
      </footer>
    </div>
  );
};

export default Register;
