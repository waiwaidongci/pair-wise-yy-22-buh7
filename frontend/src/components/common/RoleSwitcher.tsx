import { useSessionStore, EXPERT_ACCOUNTS } from "../../stores/SessionStore";
import type { SessionActor } from "../../api/request";

const ROLES: Array<{ value: SessionActor["role"]; label: string }> = [
  { value: "LIBRARIAN", label: "馆员" },
  { value: "RESTORER", label: "修复师" },
  { value: "EXPERT", label: "专家审批" },
  { value: "VIEWER", label: "访客" }
];

/** 顶栏身份切换：验证 RBAC 显隐与“两名不同专家” */
export function RoleSwitcher() {
  const role = useSessionStore((state) => state.role);
  const userId = useSessionStore((state) => state.userId);
  const setRole = useSessionStore((state) => state.setRole);
  const setExpert = useSessionStore((state) => state.setExpert);

  return (
    <div className="role-switcher">
      <span className="role-label">当前身份</span>
      <select value={role} onChange={(event) => setRole(event.target.value as SessionActor["role"])}>
        {ROLES.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      {role === "EXPERT" && (
        <select
          value={userId}
          onChange={(event) => {
            const account = EXPERT_ACCOUNTS.find((item) => item.id === Number(event.target.value));
            if (account) setExpert(account.id, account.name);
          }}
        >
          {EXPERT_ACCOUNTS.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}（#{account.id}）
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
