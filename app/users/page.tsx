"use client";
import { useEffect, useState } from "react";
import { Shell } from "@/components/shell";
import { AdminDialog } from "@/components/admin-dialog";
import { api } from "@/lib/api";

type User = { id: string; name: string; email: string; role: string; status: string };

export default function Page() {
  const [items, setItems] = useState<User[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [role, setRole] = useState("READER");

  const load = () => api<User[]>("/users").then(setItems);

  useEffect(() => {
    void load().catch(() => {});
  }, []);

  const openRoleDialog = (user: User) => {
    setSelectedUser(user);
    setRole(user.role);
    setDialogOpen(true);
  };

  const saveRole = async () => {
    if (!selectedUser) return;
    await api(`/users/${selectedUser.id}`, { method: "PATCH", body: JSON.stringify({ role }) });
    setDialogOpen(false);
    setSelectedUser(null);
    await load();
  };

  return (
    <>
      <Shell title="प्रयोगकर्ता व्यवस्थापन">
        <section className="panel resource">
          <div className="panel-head">
            <div>
              <h2>प्रयोगकर्ता र भूमिका</h2>
              <p>{items.length} सदस्य</p>
            </div>
          </div>
          <div className="resource-list">
            {items.map((x) => (
              <article key={x.id}>
                <div className="resource-icon">{x.name.slice(0, 1)}</div>
                <div>
                  <h3>{x.name}</h3>
                  <p>{x.email}</p>
                </div>
                <span>{x.role}</span>
                <button onClick={() => openRoleDialog(x)}>भूमिका बदल्नुहोस्</button>
              </article>
            ))}
          </div>
        </section>
      </Shell>

      <AdminDialog
        open={dialogOpen}
        title="भूमिका बदल्नुहोस्"
        submitLabel="सेभ गर्नुहोस्"
        onClose={() => {
          setDialogOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={() => { void saveRole(); }}
        fields={[
          { type: "select", label: "भूमिका", value: role, onChange: setRole, options: [
            { value: "READER", label: "READER" },
            { value: "REPORTER", label: "REPORTER" },
            { value: "EDITOR", label: "EDITOR" },
            { value: "ADMIN", label: "ADMIN" },
            { value: "AD_MANAGER", label: "AD_MANAGER" },
          ] },
        ]}
      />
    </>
  );
}

