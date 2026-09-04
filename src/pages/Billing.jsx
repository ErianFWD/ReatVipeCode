import { useEffect, useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import {
  FiFileText, FiDownload, FiCreditCard, FiCheckCircle,
  FiAlertCircle, FiXCircle, FiX, FiDollarSign, FiCalendar,
  FiUsers, FiClock, FiInfo
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getUserReservations, updateReservation } from '../services/api.js';
import { generateInvoicePDF } from '../services/pdfService.js';
import Loader from '../components/Loader.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

// PayPal sandbox client ID (public — safe to include in frontend)
// Replace with your own sandbox client-id from developer.paypal.com
const PAYPAL_CLIENT_ID = 'AZDxjDScFpQtjWTOUtWKbyN_bDt4OgqaF4eYXlewfBP4-8aqX3PWSUIWTKx';

// Payment status constants
const PAY_IDLE       = 'idle';
const PAY_PROCESSING = 'processing';
const PAY_APPROVED   = 'approved';
const PAY_REJECTED   = 'rejected';
const PAY_CANCELLED  = 'cancelled';
const PAY_ERROR      = 'error';

// Compute totals from a reservation object
function computeTotals(reservation) {
  const isHotel = reservation.serviceType === 'hotel';
  const baseAmount = isHotel ? (reservation.nights || 1) * 150 : 0;
  const addonsGrandTotal = reservation.addonsRequest?.grandTotal || 0;
  const subtotal = baseAmount + addonsGrandTotal;
  const taxes = parseFloat((subtotal * 0.13).toFixed(2));
  const total = parseFloat((subtotal + taxes).toFixed(2));
  return { baseAmount, addonsGrandTotal, subtotal, taxes, total };
}

// ── Invoice card shown in the list ────────────────────────────────
function InvoiceRow({ reservation, onOpen }) {
  const { total } = computeTotals(reservation);
  const payStatus = reservation.paymentStatus || 'Pendiente';

  const statusStyle = {
    Aprobado:  { color: 'var(--green)',  bg: '#e6efe7', border: '#b9d0bd' },
    Rechazado: { color: 'var(--red)',    bg: '#f3e4e2', border: '#d8b2ad' },
    Cancelado: { color: 'var(--red)',    bg: '#f3e4e2', border: '#d8b2ad' },
    Pendiente: { color: '#8b5f25',       bg: '#f6ebd7', border: '#e4c596' },
  }[payStatus] || { color: '#8b5f25', bg: '#f6ebd7', border: '#e4c596' };

  return (
    <article className="reservation-card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="reservation-card-head">
        <div>
          <span className="reservation-type">
            {reservation.serviceType === 'hotel' ? 'Alojamiento' : 'Restaurante'}
          </span>
          <h3 style={{ fontSize: '1.25rem' }}>Factura #{String(reservation.id).padStart(6, '0')}</h3>
          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Reserva RES-{reservation.id}
          </p>
        </div>
        <StatusBadge status={reservation.status} />
      </div>

      <div className="reservation-meta" style={{ marginTop: '1rem', paddingTop: '1rem' }}>
        <span><FiCalendar /> {reservation.date}</span>
        <span><FiUsers /> {reservation.guests} persona(s)</span>
        <span><FiDollarSign /> ${computeTotals(reservation).total.toFixed(2)}</span>
        <span>
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              fontSize: '0.7rem', fontWeight: '800', padding: '2px 8px',
              background: statusStyle.bg, border: `1px solid ${statusStyle.border}`,
              color: statusStyle.color
            }}
          >
            {payStatus === 'Aprobado' && <FiCheckCircle />}
            {payStatus === 'Rechazado' && <FiXCircle />}
            {payStatus === 'Cancelado' && <FiXCircle />}
            {payStatus === 'Pendiente' && <FiClock />}
            {payStatus}
          </span>
        </span>
      </div>

      <button
        className="button light"
        style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}
        onClick={() => onOpen(reservation)}
      >
        <FiFileText /> Ver Factura
      </button>
    </article>
  );
}

// ── Payment status banner ──────────────────────────────────────────
function PaymentBanner({ status }) {
  if (status === PAY_IDLE || status === PAY_PROCESSING) return null;

  const map = {
    [PAY_APPROVED]:  { icon: <FiCheckCircle />, msg: '¡Pago aprobado! Tu reserva está confirmada.',          cls: 'success-message' },
    [PAY_REJECTED]:  { icon: <FiXCircle />,     msg: 'Pago rechazado. Intenta con otro método.',             cls: 'error-message' },
    [PAY_CANCELLED]: { icon: <FiAlertCircle />, msg: 'Pago cancelado. El proceso fue interrumpido.',         cls: 'error-message' },
    [PAY_ERROR]:     { icon: <FiAlertCircle />, msg: 'Error de conexión con PayPal. Intenta más tarde.',     cls: 'error-message' },
  };
  const { icon, msg, cls } = map[status] || {};
  return (
    <div className={`message ${cls}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      {icon} {msg}
    </div>
  );
}

// ── Invoice detail modal ───────────────────────────────────────────
function InvoiceModal({ reservation, onClose, onPaymentChange }) {
  const [payStatus, setPayStatus] = useState(PAY_IDLE);
  const [genPDF, setGenPDF] = useState(false);
  const [localRes, setLocalRes] = useState(reservation);

  const { baseAmount, addonsGrandTotal, subtotal, taxes, total } = computeTotals(localRes);
  const alreadyPaid = localRes.paymentStatus === 'Aprobado';

  const handleDownloadPDF = () => {
    setGenPDF(true);
    setTimeout(() => {
      generateInvoicePDF(localRes);
      setGenPDF(false);
    }, 300);
  };

  const handleApprove = async (data, actions) => {
    setPayStatus(PAY_PROCESSING);
    try {
      const details = await actions.order.capture();
      const updated = {
        ...localRes,
        paymentStatus: 'Aprobado',
        paymentMethod: 'PayPal',
        paypalOrderId: details.id,
        status: 'Confirmada',
      };
      await updateReservation(localRes.id, updated);
      setLocalRes(updated);
      setPayStatus(PAY_APPROVED);
      onPaymentChange(updated);
    } catch {
      setPayStatus(PAY_ERROR);
    }
  };

  const handleError = () => setPayStatus(PAY_ERROR);
  const handleCancel = () => setPayStatus(PAY_CANCELLED);

  return (
    <div className="confirm-modal-overlay" onClick={onClose}>
      <div
        className="confirm-modal"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '640px', width: '94%', textAlign: 'left', borderTop: '3px solid var(--gold)', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <button className="confirm-modal-close" onClick={onClose}><FiX /></button>

        {/* Header */}
        <div style={{ marginTop: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--line)', paddingBottom: '1rem' }}>
          <span className="eyebrow"><FiFileText /> Factura</span>
          <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: '1.8rem', margin: '0.25rem 0' }}>
            #{String(localRes.id).padStart(6, '0')}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>
            Reserva RES-{localRes.id} · {localRes.date} · {localRes.time}
          </p>
        </div>

        {/* Client + reservation info */}
        <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
          {[
            ['Cliente',   localRes.guestName],
            ['Email',     localRes.email],
            ['Personas',  `${localRes.guests}`],
            ['Servicio',  localRes.serviceType === 'hotel' ? localRes.roomType : `Área ${localRes.tableArea}`],
            localRes.serviceType === 'hotel' ? ['Noches', `${localRes.nights}`] : ['Hora', localRes.time],
          ].map(([label, value]) => (
            <div className="form-group" key={label}>
              <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</label>
              <div style={{ padding: '0.5rem 0.75rem', background: 'var(--cream)', border: '1px solid var(--line)', fontSize: '0.88rem' }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Breakdown */}
        <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
          Detalle de cargos
        </h4>
        <div style={{ border: '1px solid var(--line)', marginBottom: '1.5rem' }}>
          {[
            [`${localRes.serviceType === 'hotel' ? 'Alojamiento' : 'Servicio de Restaurante'}`, `$${baseAmount.toFixed(2)}`],
            addonsGrandTotal > 0 && ['Add-ons / Servicios adicionales', `$${addonsGrandTotal.toFixed(2)}`],
          ].filter(Boolean).map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 1rem', borderBottom: '1px solid var(--line)', fontSize: '0.85rem' }}>
              <span>{label}</span><span style={{ fontWeight: 700 }}>{value}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 1rem', borderBottom: '1px solid var(--line)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 1rem', borderBottom: '1px solid var(--line)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span>Impuesto (13%)</span><span>${taxes.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.85rem 1rem', background: 'var(--cream-2)', fontSize: '1rem', fontWeight: 800 }}>
            <span>TOTAL</span>
            <span style={{ color: 'var(--gold)' }}>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Add-ons detail if any */}
        {localRes.addonsRequest && (
          <div style={{ background: '#faf7f1', border: '1px dashed #d5c8b6', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              <FiInfo /> Add-ons contratados
            </div>
            {localRes.addonsRequest.wineQuantity > 0 && <div>🍷 Vino de Bienvenida × {localRes.addonsRequest.wineQuantity} — ${localRes.addonsRequest.wineTotal}</div>}
            {localRes.addonsRequest.lateCheckout && <div>🕓 Late Check-out — ${localRes.addonsRequest.lateCheckoutTotal}</div>}
            {localRes.addonsRequest.dietaryRequests && <div>🥗 Dietético: {localRes.addonsRequest.dietaryRequests}</div>}
            {localRes.addonsRequest.specialRequests && <div>📝 Especial: {localRes.addonsRequest.specialRequests}</div>}
          </div>
        )}

        {/* Payment status */}
        <PaymentBanner status={payStatus} />

        {/* PayPal section */}
        {!alreadyPaid && payStatus !== PAY_APPROVED && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
              Pagar con PayPal
            </h4>
            {payStatus === PAY_PROCESSING ? (
              <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>
                Procesando pago...
              </div>
            ) : (
              <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID, currency: 'USD' }}>
                <PayPalButtons
                  style={{ layout: 'vertical', shape: 'rect', label: 'pay', height: 44 }}
                  createOrder={(data, actions) =>
                    actions.order.create({
                      purchase_units: [{
                        description: `Reserva RES-${localRes.id} — ReservaPro`,
                        amount: { value: total.toFixed(2), currency_code: 'USD' },
                      }],
                    })
                  }
                  onApprove={handleApprove}
                  onError={handleError}
                  onCancel={handleCancel}
                />
              </PayPalScriptProvider>
            )}
          </div>
        )}

        {/* Already paid badge */}
        {(alreadyPaid || payStatus === PAY_APPROVED) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: '#e6efe7', border: '1px solid #b9d0bd', color: 'var(--green)', fontSize: '0.88rem', fontWeight: 700, marginBottom: '1.5rem' }}>
            <FiCheckCircle /> Pago aprobado · {localRes.paymentMethod || 'PayPal'}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            className="button primary"
            style={{ flex: 1, justifyContent: 'center', minWidth: '160px' }}
            onClick={handleDownloadPDF}
            disabled={genPDF}
          >
            {genPDF ? <><FiDownload /> Generando PDF...</> : <><FiDownload /> Descargar factura PDF</>}
          </button>
          <button
            className="button light"
            style={{ justifyContent: 'center', minWidth: '120px' }}
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Billing page ──────────────────────────────────────────────
export default function Billing() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getUserReservations(user.id);
        setReservations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user.id]);

  const handlePaymentChange = (updatedRes) => {
    setReservations(prev => prev.map(r => r.id === updatedRes.id ? updatedRes : r));
    if (selected?.id === updatedRes.id) setSelected(updatedRes);
  };

  if (loading) return <Loader text={t('common.loading')} />;

  return (
    <main className="inner-page">
      <section className="page-hero compact-hero">
        <div className="container page-title-row">
          <div>
            <span className="eyebrow"><FiCreditCard /> Mi Cuenta</span>
            <h1>Métodos de Pago &amp; Facturación</h1>
            <p>Consulta tus facturas, gestiona pagos y descarga comprobantes PDF.</p>
          </div>
        </div>
      </section>

      <section className="section light-section">
        <div className="container">
          <ErrorMessage message={error} />

          {reservations.length > 0 ? (
            <>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: '1.8rem', margin: '0 0 0.25rem' }}>
                  Mis Facturas
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                  {reservations.length} reserva(s) en tu historial
                </p>
              </div>
              <div className="reservations-grid">
                {reservations.map(res => (
                  <InvoiceRow key={res.id} reservation={res} onOpen={setSelected} />
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <FiFileText />
              <h2>Sin facturas</h2>
              <p>Aún no tienes reservas registradas. Cuando hagas una reserva, su factura aparecerá aquí.</p>
            </div>
          )}
        </div>
      </section>

      {selected && (
        <InvoiceModal
          reservation={selected}
          onClose={() => setSelected(null)}
          onPaymentChange={handlePaymentChange}
        />
      )}
    </main>
  );
}
