export default function ActivityTimeline({ activities }) {
  return (
    <div>
      <h3 className="font-semibold mb-3">Recent Activity</h3>
      <ul className="space-y-3">
        {activities.map((a, i) => (
          <li key={i} className="text-sm text-gray-600 dark:text-gray-300">
            • {a.action} — <span className="text-xs">{a.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
