export default function ConnectedAccounts() {
  return (
    <div>
      <h3 className="font-semibold mb-3">Connected Accounts</h3>
      <div className="flex gap-4">
        <button className="border px-3 py-2 rounded">GitHub ✓</button>
        <button className="border px-3 py-2 rounded">Google ✕</button>
      </div>
    </div>
  );
}
