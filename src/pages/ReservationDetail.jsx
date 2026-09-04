import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCalendar, FiClock, FiHome, FiMapPin, FiUsers, FiCheckCircle, FiAlertCircle, FiDownload, FiMaximize2, FiArrowLeft, FiX } from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';
import { getReservationById, updateReservation } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import Loader from '../components/Loader.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function ReservationDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Check-in form state
  const [checkInForm, setCheckInForm] = useState({
    identityDocument: '',
    estimatedArrivalTime: '',
    acceptTerms: false
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState(false);

  // QR modal state
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    const fetchReservation = async () => {
      setLoading(true);
      try {
        const data = await getReservationById(id);
        if (!data) {
          setError(t('reservations.notFound') || 'Reserva no encontrada');
        } else if (data.ownerId !== user.id && user.role !== 'admin') {
          setError('No tienes permiso para ver esta reserva');
        } else {
          setReservation(data);
          if (data.status === 'Confirmada') {
            setCheckInSuccess(true);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReservation();
  }, [id, user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCheckInForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setFormError('');
  };

  const handleCheckInSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!checkInForm.identityDocument.trim()) {
      setFormError('El documento de identidad es requerido');
      return;
    }
    if (!checkInForm.acceptTerms) {
      setFormError('Debes aceptar las políticas para realizar el check-in');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const updatedData = {
        status: 'Confirmada',
        checkInDetails: checkInForm
      };
      await updateReservation(id, updatedData);
      setReservation(prev => ({ ...prev, ...updatedData }));
      setCheckInSuccess(true);
    } catch (err) {
      setFormError(err.message || 'Error al procesar el check-in');
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadQR = () => {
    const svg = document.getElementById("reservation-qr");
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR-Reserva-${reservation.id}.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  if (loading) return <Loader text={t('common.loading')} />;
  
  if (error) {
    return (
      <main className="inner-page">
        <section className="section light-section">
          <div className="container" style={{ maxWidth: '600px' }}>
            <Link to="/mis-reservas" className="button light" style={{ marginBottom: '20px', display: 'inline-flex' }}>
              <FiArrowLeft /> Volver a Mis Reservas
            </Link>
            <ErrorMessage message={error} />
          </div>
        </section>
      </main>
    );
  }

  if (!reservation) return null;

  const hotel = reservation.serviceType === 'hotel';
  
  // Safe QR data payload (no highly sensitive info)
  const qrDataPayload = JSON.stringify({
    resId: reservation.id,
    guest: reservation.guestName,
    date: reservation.date,
    type: reservation.serviceType
  });

  return (
    <main className="inner-page">
      <section className="page-hero compact-hero">
        <div className="container page-title-row">
          <div>
            <span className="eyebrow"><FiCalendar /> Detalle de Reserva</span>
            <h1>Reserva #{reservation.id}</h1>
            <p>{hotel ? reservation.roomType : reservation.tableArea}</p>
          </div>
          <Link className="button light" to="/mis-reservas">
            <FiArrowLeft /> Volver
          </Link>
        </div>
      </section>

      <section className="section light-section">
        <div className="container" style={{ maxWidth: '800px' }}>
          
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div className="reservation-card-head" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <div>
                <span className="reservation-type">{hotel ? 'Alojamiento' : 'Restaurante'}</span>
                <h3>Detalles Generales</h3>
              </div>
              <StatusBadge status={reservation.status} />
            </div>

            <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label>Huésped / Titular</label>
                <div className="read-only-value" style={{ padding: '0.75rem 1rem', background: 'var(--bg-lighter)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>{reservation.guestName}</div>
              </div>
              <div className="form-group">
                <label>Fecha de {hotel ? 'Entrada' : 'Reserva'}</label>
                <div className="read-only-value" style={{ padding: '0.75rem 1rem', background: 'var(--bg-lighter)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}><FiCalendar style={{marginRight: '0.5rem', verticalAlign: 'middle'}}/> {reservation.date}</div>
              </div>
              <div className="form-group">
                <label>Hora</label>
                <div className="read-only-value" style={{ padding: '0.75rem 1rem', background: 'var(--bg-lighter)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}><FiClock style={{marginRight: '0.5rem', verticalAlign: 'middle'}}/> {reservation.time}</div>
              </div>
              <div className="form-group">
                <label>Cantidad de personas</label>
                <div className="read-only-value" style={{ padding: '0.75rem 1rem', background: 'var(--bg-lighter)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}><FiUsers style={{marginRight: '0.5rem', verticalAlign: 'middle'}}/> {reservation.guests}</div>
              </div>
              {hotel && (
                <div className="form-group">
                  <label>Noches</label>
                  <div className="read-only-value" style={{ padding: '0.75rem 1rem', background: 'var(--bg-lighter)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}><FiHome style={{marginRight: '0.5rem', verticalAlign: 'middle'}}/> {reservation.nights}</div>
                </div>
              )}
              {!hotel && (
                <div className="form-group">
                  <label>Área</label>
                  <div className="read-only-value" style={{ padding: '0.75rem 1rem', background: 'var(--bg-lighter)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}><FiMapPin style={{marginRight: '0.5rem', verticalAlign: 'middle'}}/> {reservation.tableArea}</div>
                </div>
              )}
            </div>
            
            {reservation.notes && (
              <div className="form-group">
                <label>Notas Adicionales</label>
                <div className="read-only-value" style={{ fontStyle: 'italic', padding: '0.75rem 1rem', background: 'var(--bg-lighter)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>"{reservation.notes}"</div>
              </div>
            )}
          </div>

          {/* Check-in Section */}
          {reservation.status === 'Pendiente' && (
            <div className="card">
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiCheckCircle style={{ color: 'var(--primary)' }}/> Realizar Check-in Online
              </h3>
              <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>
                Completa tus datos para agilizar tu ingreso y confirmar definitivamente tu reserva.
              </p>

              {formError && <ErrorMessage message={formError} />}

              <form onSubmit={handleCheckInSubmit}>
                <div className="form-group">
                  <label htmlFor="identityDocument">Documento de Identidad (DNI/Pasaporte) *</label>
                  <input
                    type="text"
                    id="identityDocument"
                    name="identityDocument"
                    value={checkInForm.identityDocument}
                    onChange={handleInputChange}
                    placeholder="Ej: 12345678"
                    className="input-field"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="estimatedArrivalTime">Hora estimada de llegada (Opcional)</label>
                  <input
                    type="time"
                    id="estimatedArrivalTime"
                    name="estimatedArrivalTime"
                    value={checkInForm.estimatedArrivalTime}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>

                <div className="checkbox-group" style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    name="acceptTerms"
                    checked={checkInForm.acceptTerms}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="acceptTerms" style={{ margin: 0, fontWeight: 'normal' }}>
                    Confirmo mi asistencia y acepto las políticas del establecimiento *
                  </label>
                </div>

                <button 
                  type="submit" 
                  className="button primary" 
                  disabled={isSubmitting}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {isSubmitting ? 'Procesando...' : 'Completar Check-in'}
                </button>
              </form>
            </div>
          )}

          {/* Cancelled State */}
          {reservation.status === 'Cancelada' && (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <FiAlertCircle style={{ color: 'var(--danger)', fontSize: '3rem', marginBottom: '1rem' }} />
              <h3>Reserva Cancelada</h3>
              <p>Esta reserva ha sido cancelada y no es posible realizar el check-in ni generar códigos de acceso.</p>
            </div>
          )}

          {/* Success & QR State */}
          {checkInSuccess && reservation.status === 'Confirmada' && (
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--success)', marginBottom: '1rem' }}>
                <FiCheckCircle size={48} style={{ margin: '0 auto' }} />
              </div>
              <h3 style={{ marginBottom: '0.5rem' }}>¡Check-in Completado!</h3>
              <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>
                Tu reserva está confirmada. Presenta el siguiente código QR al llegar al establecimiento.
              </p>

              <div 
                style={{ 
                  background: 'white', 
                  padding: '1.5rem', 
                  borderRadius: '1rem', 
                  display: 'inline-block',
                  marginBottom: '1.5rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                <QRCodeSVG 
                  id="reservation-qr"
                  value={qrDataPayload} 
                  size={200}
                  level={"H"}
                  includeMargin={true}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button 
                  type="button" 
                  className="button primary-outline"
                  onClick={() => setShowQRModal(true)}
                >
                  <FiMaximize2 style={{ marginRight: '0.5rem' }} /> Mostrar código QR
                </button>
                <button 
                  type="button" 
                  className="button primary"
                  onClick={downloadQR}
                >
                  <FiDownload style={{ marginRight: '0.5rem' }} /> Descargar código QR
                </button>
              </div>
            </div>
          )}
          
        </div>
      </section>

      {/* QR Modal */}
      {showQRModal && (
        <div className="confirm-modal-overlay" onClick={() => setShowQRModal(false)}>
          <div 
            className="confirm-modal" 
            onClick={e => e.stopPropagation()} 
            style={{ textAlign: 'center', maxWidth: '400px', borderTop: '1px solid #d5c8b6' }}
          >
            <button className="confirm-modal-close" onClick={() => setShowQRModal(false)}>
              <FiX />
            </button>
            <h3 style={{ marginBottom: '1.5rem', marginTop: '1rem' }}>Código de Acceso</h3>
            <div style={{ background: 'white', padding: '1rem', borderRadius: '0.5rem', display: 'inline-block', marginBottom: '1.5rem' }}>
              <QRCodeSVG 
                value={qrDataPayload} 
                size={280}
                level={"H"}
                includeMargin={true}
              />
            </div>
            <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>
              Reserva #{reservation.id} - {reservation.guestName}
            </p>
            <button className="button primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowQRModal(false)}>
              Cerrar
            </button>
          </div>
        </div>
      )}

    </main>
  );
}
