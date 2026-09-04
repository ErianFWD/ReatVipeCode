import { useEffect, useState, useMemo } from 'react';
import { FiCalendar, FiClock, FiHome, FiMapPin, FiUsers, FiFilter, FiCreditCard, FiDollarSign, FiList, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getUserReservations } from '../services/api.js';
import Loader from '../components/Loader.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function History() {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters and Sorting State
  const [filterStatus, setFilterStatus] = useState('Todas');
  const [filterType, setFilterType] = useState('Todas');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' = más reciente, 'asc' = más antiguo

  // Modal State
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const data = await getUserReservations(user.id);
        setHistory(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user.id]);

  // Derived state: Filtered and Sorted History
  const filteredAndSortedHistory = useMemo(() => {
    let result = [...history];

    if (filterStatus !== 'Todas') {
      result = result.filter(item => item.status === filterStatus);
    }
    
    if (filterType !== 'Todas') {
      result = result.filter(item => {
        if (filterType === 'Alojamiento') return item.serviceType === 'hotel';
        if (filterType === 'Restaurante') return item.serviceType === 'restaurant';
        return true;
      });
    }

    result.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [history, filterStatus, filterType, sortOrder]);

  const openDetail = (record) => setSelectedRecord(record);
  const closeDetail = () => setSelectedRecord(null);

  if (loading) return <Loader text={t('common.loading')} />;

  return (
    <main className="inner-page">
      <section className="page-hero compact-hero">
        <div className="container page-title-row">
          <div>
            <span className="eyebrow"><FiList /> Mi Cuenta</span>
            <h1>Historial de Visitas</h1>
            <p>Consulta tus estancias, reservas y consumos anteriores.</p>
          </div>
        </div>
      </section>

      <section className="section light-section">
        <div className="container">
          <ErrorMessage message={error} />

          {history.length > 0 ? (
            <>
              {/* Filters Area */}
              <div className="card" style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                  <FiFilter /> Filtros:
                </div>
                
                <select 
                  className="input-field" 
                  style={{ width: 'auto', minWidth: '150px', marginBottom: 0 }}
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                >
                  <option value="Todas">Todos los Estados</option>
                  <option value="Confirmada">Confirmada</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Cancelada">Cancelada</option>
                </select>

                <select 
                  className="input-field" 
                  style={{ width: 'auto', minWidth: '150px', marginBottom: 0 }}
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                >
                  <option value="Todas">Todos los Servicios</option>
                  <option value="Alojamiento">Alojamiento</option>
                  <option value="Restaurante">Restaurante</option>
                </select>

                <select 
                  className="input-field" 
                  style={{ width: 'auto', minWidth: '180px', marginBottom: 0, marginLeft: 'auto' }}
                  value={sortOrder}
                  onChange={e => setSortOrder(e.target.value)}
                >
                  <option value="desc">Más reciente a más antiguo</option>
                  <option value="asc">Más antiguo a más reciente</option>
                </select>
              </div>

              {filteredAndSortedHistory.length > 0 ? (
                <div className="reservations-grid">
                  {filteredAndSortedHistory.map(record => (
                    <article key={record.id} className="reservation-card" style={{ display: 'flex', flexDirection: 'column' }}>
                      <div className="reservation-card-head">
                        <div>
                          <span className="reservation-type">
                            {record.serviceType === 'hotel' ? 'Alojamiento' : 'Restaurante'}
                          </span>
                          <h3>{record.serviceType === 'hotel' ? record.roomType : record.tableArea}</h3>
                        </div>
                        <StatusBadge status={record.status} />
                      </div>

                      <div className="reservation-meta" style={{ flex: 1 }}>
                        <span><FiCalendar /> {record.date}</span>
                        <span><FiClock /> {record.time}</span>
                        <span>
                          <FiDollarSign /> {record.totalAmount ? `$${record.totalAmount}` : 'N/D'}
                        </span>
                      </div>
                      
                      <button 
                        className="button light" 
                        style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}
                        onClick={() => openDetail(record)}
                      >
                        Ver Detalle
                      </button>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FiFilter />
                  <h2>Sin resultados</h2>
                  <p>No se encontraron visitas que coincidan con los filtros aplicados.</p>
                  <button className="button light" onClick={() => { setFilterStatus('Todas'); setFilterType('Todas'); }}>
                    Limpiar Filtros
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <FiList />
              <h2>Aún no tienes historial</h2>
              <p>Tu historial de visitas y reservas aparecerá aquí.</p>
            </div>
          )}
        </div>
      </section>

      {/* Detail Modal */}
      {selectedRecord && (
        <div className="confirm-modal-overlay" onClick={closeDetail}>
          <div 
            className="confirm-modal" 
            onClick={e => e.stopPropagation()} 
            style={{ maxWidth: '600px', width: '90%', textAlign: 'left', borderTop: '1px solid #d5c8b6' }}
          >
            <button className="confirm-modal-close" onClick={closeDetail}>
              <FiX />
            </button>
            
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.5rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span className="eyebrow">
                    {selectedRecord.serviceType === 'hotel' ? 'Alojamiento' : 'Restaurante'}
                  </span>
                  <h2 style={{ fontSize: '1.5rem', margin: '0.25rem 0' }}>Reserva #{selectedRecord.id}</h2>
                </div>
                <StatusBadge status={selectedRecord.status} />
              </div>
            </div>

            <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label>Huésped / Titular</label>
                <div className="read-only-value" style={{ padding: '0.75rem', background: 'var(--bg-lighter)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  {selectedRecord.guestName}
                </div>
              </div>
              <div className="form-group">
                <label>Fecha de {selectedRecord.serviceType === 'hotel' ? 'Entrada' : 'Reserva'}</label>
                <div className="read-only-value" style={{ padding: '0.75rem', background: 'var(--bg-lighter)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <FiCalendar /> {selectedRecord.date}
                </div>
              </div>
              <div className="form-group">
                <label>Personas</label>
                <div className="read-only-value" style={{ padding: '0.75rem', background: 'var(--bg-lighter)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <FiUsers /> {selectedRecord.guests}
                </div>
              </div>
              
              {selectedRecord.serviceType === 'hotel' ? (
                <>
                  <div className="form-group">
                    <label>Tipo de Habitación</label>
                    <div className="read-only-value" style={{ padding: '0.75rem', background: 'var(--bg-lighter)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                      <FiHome /> {selectedRecord.roomType}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Noches</label>
                    <div className="read-only-value" style={{ padding: '0.75rem', background: 'var(--bg-lighter)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                      {selectedRecord.nights}
                    </div>
                  </div>
                </>
              ) : (
                <div className="form-group">
                  <label>Área</label>
                  <div className="read-only-value" style={{ padding: '0.75rem', background: 'var(--bg-lighter)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                    <FiMapPin /> {selectedRecord.tableArea}
                  </div>
                </div>
              )}
            </div>

            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>Detalles de Facturación</h3>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Importe Total</label>
                <div className="read-only-value" style={{ padding: '0.75rem', background: 'var(--bg-lighter)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontWeight: 'bold' }}>
                  {selectedRecord.totalAmount ? `$${selectedRecord.totalAmount}` : 'N/D'}
                </div>
              </div>
              <div className="form-group">
                <label>Método de Pago</label>
                <div className="read-only-value" style={{ padding: '0.75rem', background: 'var(--bg-lighter)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  {selectedRecord.paymentMethod ? <><FiCreditCard /> {selectedRecord.paymentMethod}</> : 'N/D'}
                </div>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Consumos Adicionales / Add-ons</label>
                <div className="read-only-value" style={{ padding: '0.75rem', background: 'var(--bg-lighter)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  {selectedRecord.addons && selectedRecord.addons.length > 0 
                    ? selectedRecord.addons.join(', ') 
                    : 'Sin consumos adicionales registrados'}
                </div>
              </div>
            </div>

            <button 
              className="button primary" 
              style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem' }} 
              onClick={closeDetail}
            >
              Cerrar Detalle
            </button>
          </div>
        </div>
      )}

    </main>
  );
}
