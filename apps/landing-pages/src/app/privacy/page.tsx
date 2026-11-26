export default function Privacy() {
  return (
    <main className="privacy">
      <p className="eyebrow">PILOT DATA POLICY</p>
      <h1>Use synthetic data only.</h1>
      <p>
        This public repository is an engineering pilot. All projects, prices and
        fixtures are fictional. Do not submit your real name, phone number or
        customer records.
      </p>
      <p>
        The local form forwards synthetic entries to an authenticated local
        router. Its bounded in-memory queue retains entries until eviction or
        process shutdown. The demo sink discards deliveries; no CRM, Google
        Sheets, Meta lead retrieval or Zalo message is connected.
      </p>
      <p>
        No advertising pixels, analytics services or third-party fonts are
        loaded. Browser storage is not used to persist form fields. Production
        retention, deletion, access controls and privacy review are sprint
        backlog items.
      </p>
      <a href="/">← Return to projects</a>
    </main>
  );
}
