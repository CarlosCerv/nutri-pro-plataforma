import PropTypes from 'prop-types';
import { EmptyState, ErrorState, Skeleton } from './StateViews.jsx';

/**
 * Tabla de datos con sus tres estados resueltos.
 *
 * Las listas de la aplicación resolvían carga, vacío y error cada una por su
 * cuenta —cuando los resolvían—, así que una petición fallida se veía igual
 * que una lista sin resultados. Aquí los tres estados son parte del contrato.
 *
 * `columns` describe cada columna con `{ key, header, render, align, width }`.
 *
 * `mobileCard`, si se pasa, dibuja cada fila como tarjeta apilada por debajo
 * de `sm` en vez de la tabla con scroll horizontal — cuatro o más columnas no
 * caben en un teléfono sin deslizar el dedo, y eso deja de sentirse premium
 * muy rápido. Es opcional (no toda tabla angosta lo necesita) para no obligar
 * a cada pantalla que ya usa `DataTable` a escribir una tarjeta que no le hace
 * falta.
 */
export default function DataTable({
  columns,
  rows,
  rowKey = (row, i) => row.id ?? row._id ?? i,
  loading = false,
  error = null,
  onRetry,
  empty,
  onRowClick,
  mobileCard,
  className = '',
}) {
  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (loading) {
    return (
      <div className="space-y-2" aria-busy="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-[var(--radius-m)]" />
        ))}
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return empty || <EmptyState title="Sin resultados" description="No hay datos que mostrar todavía." />;
  }

  const tabla = (
    <div className={['table-wrapper', mobileCard ? 'hidden sm:block' : '', className].filter(Boolean).join(' ')}>
      <table className="table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={col.width ? { width: col.width } : undefined} align={col.align}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={rowKey(row, i)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={onRowClick ? 'cursor-pointer' : undefined}
            >
              {columns.map((col) => (
                <td key={col.key} align={col.align}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (!mobileCard) return tabla;

  return (
    <>
      {tabla}
      <div className="space-y-2.5 sm:hidden">
        {rows.map((row, i) => {
          const contenido = mobileCard(row);
          return onRowClick ? (
            <button
              key={rowKey(row, i)}
              type="button"
              onClick={() => onRowClick(row)}
              className="card block w-full p-3.5 text-left active:bg-[var(--surface-alt)]"
            >
              {contenido}
            </button>
          ) : (
            <div key={rowKey(row, i)} className="card p-3.5">
              {contenido}
            </div>
          );
        })}
      </div>
    </>
  );
}

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      header: PropTypes.node,
      render: PropTypes.func,
      align: PropTypes.oneOf(['left', 'center', 'right']),
      width: PropTypes.string,
    })
  ).isRequired,
  rows: PropTypes.array,
  rowKey: PropTypes.func,
  loading: PropTypes.bool,
  error: PropTypes.string,
  onRetry: PropTypes.func,
  empty: PropTypes.node,
  onRowClick: PropTypes.func,
  mobileCard: PropTypes.func,
  className: PropTypes.string,
};
