import { Inbox } from "lucide-react";

/**
 * Shown when a list has nothing in it.
 *   <Empty icon={Mail} title="No messages" action={<button …>…</button>}>
 *     Messages from the site's contact forms appear here.
 *   </Empty>
 * `compact` is a smaller version for use inside a panel or a group.
 */
export function Empty({ icon: Icon = Inbox, title = "Empty", children, action, compact = false }) {
  return (
    <div className={`empty-state${compact ? " is-compact" : ""}`}>
      <span className="empty-icon" aria-hidden="true">
        <Icon />
      </span>
      <strong>{title}</strong>
      {children ? <p>{children}</p> : null}
      {action ? <div className="empty-action">{action}</div> : null}
    </div>
  );
}
