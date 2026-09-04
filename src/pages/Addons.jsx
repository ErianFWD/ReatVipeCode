import { useEffect, useState } from 'react';
import { FiGift, FiPlus, FiX, FiCheckCircle, FiAlertCircle, FiShoppingBag, FiInfo } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getUserReservations, updateReservation } from '../services/api.js';
import Loader from '../components/Loader.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function Addons() {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const [activeReservations, setActiveReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [selectedRes, setSelectedRes] = useState(null);
  
  // Form State
  const [wineQuantity, setWineQuantity] = useState(0);
  const [lateCheckout, setLateCheckout] = useState(false);
  const [dietaryRequests, setDietaryRequests] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  
  // Submission state
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Prices
  const WINE_PRICE = 25;
  const LATE_CHECKOUT_PRICE = 50;

  const loadReservations = async () => {
    setLoading(true);
    try {
      const data = await getUserReservations(user.id);
      // Filter out 'Cancelada' or past reservations depending on logic.
      // We assume 'Confirmada' and 'Pendiente' are active.
      const active = data.filter(res => res.status === 'Pendiente' || res.status === 'Confirmada');
      setActiveReservations(active);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, [user.id]);

  const openModal = (res) => {
    setSelectedRes(res);
    setWineQuantity(0);
    setLateCheckout(false);
    setDietaryRequests('');
    setSpecialRequests('');
    setFormError('');
    setSuccessMessage('');
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setSelectedRes(null);
  };

  const wineTotal = wineQuantity * WINE_PRICE;
  const lateCheckoutTotal = lateCheckout ? LATE_CHECKOUT_PRICE : 0;
  const grandTotal = wineTotal + lateCheckoutTotal;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (wineQuantity === 0 && !lateCheckout && !dietaryRequests.trim() && !specialRequests.trim()) {
      setFormError('Debes seleccionar al menos un servicio o enviar una solicitud especial.');
      return;
    }

    if (dietaryRequests.trim() && dietaryRequests.trim().length < 5) {
      setFormError('Por favor detalla un poco más tus requerimientos dietéticos.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const addonsRequest = {
        wineQuantity,
        wineTotal,
        lateCheckout,
        lateCheckoutTotal,
        dietaryRequests,
        specialRequests,
        grandTotal,
        status: 'Pendiente',
        submittedAt: new Date().toISOString()
      };

      const updatedRes = {
        ...selectedRes,
        addonsRequest
      };

      await updateReservation(selectedRes.id, updatedRes);
      
      // Update local state
      setActiveReservations(current => 
        current.map(res => res.id === selectedRes.id ? updatedRes : res)
      );

      setSuccessMessage('Tu solicitud de servicios adicionales ha sido enviada exitosamente.');
      setTimeout(() => {
        closeModal();
      }, 3000);
      
    } catch (err) {
      setFormError(err.message || 'Ocurrió un error al enviar tu solicitud.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Loader text={t('common.loading')} />;

  return (
    <main className="inner-page">
      <section className="page-hero compact-hero">
        <div className="container page-title-row">
          <div>
            <span className="eyebrow"><FiGift /> Servicios Adicionales</span>
            <h1>Solicitudes Especiales / Add-ons</h1>
            <p>Personaliza tu estancia agregando servicios exclusivos a tus reservas activas.</p>
          </div>
        </div>
      </section>

      <section className="section light-section">
        <div className="container">
          <ErrorMessage message={error} />

          {activeReservations.length > 0 ? (
            <div className="reservations-grid">
              {activeReservations.map(res => (
                <article key={res.id} className="reservation-card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="reservation-card-head">
                    <div>
                      <span className="reservation-type">
                        {res.serviceType === 'hotel' ? 'Alojamiento' : 'Restaurante'}
                      </span>
                      <h3>Reserva #{res.id}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>{res.date}</p>
                    </div>
                    <StatusBadge status={res.status} />
                  </div>

                  <div style={{ flex: 1, padding: '1rem 0' }}>
                    {res.addonsRequest ? (
                      <div className="message success-message" style={{ margin: 0, padding: '0.75rem', fontSize: '0.85rem' }}>
                        <FiCheckCircle /> Solicitud adicional {res.addonsRequest.status.toLowerCase()}.
                      </div>
                    ) : (
                      <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
                        Añade requerimientos dietéticos, vino de bienvenida o late check-out.
                      </p>
                    )}
                  </div>
                  
                  <button 
                    className="button primary-outline" 
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => openModal(res)}
                    disabled={!!res.addonsRequest}
                  >
                    {res.addonsRequest ? 'Solicitud Enviada' : <><FiPlus /> Agregar servicios</>}
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <FiShoppingBag />
              <h2>Sin reservas activas</h2>
              <p>No tienes reservas pendientes o confirmadas para agregar servicios adicionales.</p>
            </div>
          )}
        </div>
      </section>

      {/* Add-ons Modal */}
      {selectedRes && (
        <div className="confirm-modal-overlay" onClick={closeModal}>
          <div 
            className="confirm-modal" 
            onClick={e => e.stopPropagation()} 
            style={{ maxWidth: '650px', width: '90%', textAlign: 'left', borderTop: '1px solid #d5c8b6' }}
          >
            {!isSubmitting && !successMessage && (
              <button className="confirm-modal-close" onClick={closeModal} disabled={isSubmitting}>
                <FiX />
              </button>
            )}
            
            {successMessage ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <FiCheckCircle size={64} style={{ color: 'var(--success)', marginBottom: '1rem' }} />
                <h3 style={{ marginBottom: '1rem' }}>¡Éxito!</h3>
                <p>{successMessage}</p>
              </div>
            ) : (
              <>
                <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.5rem', marginTop: '0.5rem' }}>
                  <span className="eyebrow">Añadir servicios a la Reserva #{selectedRes.id}</span>
                  <h2 style={{ fontSize: '1.5rem', margin: '0.25rem 0' }}>Personaliza tu experiencia</h2>
                </div>

                <form onSubmit={handleSubmit}>
                  {formError && <ErrorMessage message={formError} />}

                  <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
                    {/* Wine Add-on */}
                    <div className="form-group" style={{ gridColumn: '1 / -1', padding: '1rem', background: 'var(--bg-lighter)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ margin: '0 0 0.25rem 0' }}>Vino de Bienvenida</h4>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Botella de vino tinto o blanco al llegar. (${WINE_PRICE} c/u)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button type="button" className="button light" style={{ padding: '0.25rem 0.5rem' }} onClick={() => setWineQuantity(Math.max(0, wineQuantity - 1))}>-</button>
                          <span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{wineQuantity}</span>
                          <button type="button" className="button light" style={{ padding: '0.25rem 0.5rem' }} onClick={() => setWineQuantity(wineQuantity + 1)}>+</button>
                        </div>
                      </div>
                    </div>

                    {/* Late Checkout Add-on */}
                    {selectedRes.serviceType === 'hotel' && (
                      <div className="form-group" style={{ gridColumn: '1 / -1', padding: '1rem', background: 'var(--bg-lighter)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <h4 style={{ margin: '0 0 0.25rem 0' }}>Late Check-out</h4>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Disfruta tu habitación hasta las 16:00. (${LATE_CHECKOUT_PRICE})</span>
                          </div>
                          <div className="checkbox-group" style={{ margin: 0 }}>
                            <input 
                              type="checkbox" 
                              id="lateCheckout" 
                              checked={lateCheckout} 
                              onChange={e => setLateCheckout(e.target.checked)} 
                              style={{ width: '24px', height: '24px', cursor: 'pointer' }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Dietary Requests */}
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label htmlFor="dietaryRequests">Requerimientos Dietéticos (Alergias, Intolerancias)</label>
                      <textarea
                        id="dietaryRequests"
                        value={dietaryRequests}
                        onChange={e => setDietaryRequests(e.target.value)}
                        placeholder="Ej. Soy alérgico a los mariscos, dieta vegana..."
                        className="input-field"
                        style={{ minHeight: '80px', resize: 'vertical' }}
                      />
                    </div>

                    {/* Special Requests */}
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label htmlFor="specialRequests">Solicitudes Especiales Generales</label>
                      <textarea
                        id="specialRequests"
                        value={specialRequests}
                        onChange={e => setSpecialRequests(e.target.value)}
                        placeholder="Ej. Cuna adicional, decoración de aniversario..."
                        className="input-field"
                        style={{ minHeight: '80px', resize: 'vertical' }}
                      />
                    </div>
                  </div>

                  {/* Summary / Total */}
                  <div style={{ background: 'var(--cream)', padding: '1.25rem', borderRadius: 'var(--radius)', border: '1px dashed #d5c8b6', marginBottom: '1.5rem' }}>
                    <h4 style={{ margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiInfo /> Resumen de Solicitud</h4>
                    {wineQuantity > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span>Vino de Bienvenida (x{wineQuantity})</span>
                        <span>${wineTotal}</span>
                      </div>
                    )}
                    {lateCheckout && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span>Late Check-out</span>
                        <span>${lateCheckoutTotal}</span>
                      </div>
                    )}
                    {wineQuantity === 0 && !lateCheckout && (
                      <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>No hay cargos adicionales.</span>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #d5c8b6', paddingTop: '0.75rem', marginTop: '0.75rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
                      <span>Total Adicional</span>
                      <span>${grandTotal}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                      type="button"
                      className="button danger-outline" 
                      style={{ flex: 1, justifyContent: 'center' }} 
                      onClick={closeModal}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      className="button primary" 
                      style={{ flex: 1, justifyContent: 'center' }} 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Procesando...' : 'Confirmar solicitud'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

    </main>
  );
}
