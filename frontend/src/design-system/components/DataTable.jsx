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

  return (
    <div className={['table-wrapper', className].filter(Boolean).join(' ')}>
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
  className: PropTypes.string,
};
