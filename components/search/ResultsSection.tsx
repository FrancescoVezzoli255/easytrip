interface Props {
  loading: boolean;
  query: string | null;
}

export default function ResultsSection({ loading, query }: Props) {
  if (!query && !loading) return null;

  return (
    <section className="max-w-5xl mx-auto mt-16 px-4 mb-24">
      {loading && (
        <div className="text-center text-gray-600 text-lg">
          Generazione itinerario in corso...
        </div>
      )}

      {!loading && query && (
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h3 className="text-2xl font-semibold mb-4">
            Risultato della ricerca
          </h3>

          <pre className="bg-gray-50 p-4 rounded-xl text-sm overflow-auto">
            {query}
          </pre>

          <p className="text-gray-500 mt-4">
            👉 Qui andranno itinerario AI, hotel e suggerimenti personalizzati.
          </p>
        </div>
      )}
    </section>
  );
}
