export default function Loader({ text = 'Cargando...' }) {
  return (
    <div className="loader-wrap" role="status" aria-live="polite">
      <span className="loader-spinner" />
      <p>{text}</p>
    </div>
  );
}
