"use client";
import { useState, useEffect } from "react";

export default function ManageRoles() {
  const [users, setUsers] = useState([]);

  const loadUsers = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setUsers(data.users);
  };

  const updateRole = async (id, role) => {
    const token = localStorage.getItem("token");
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}/role`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ role })
    });
    loadUsers();
  };

  useEffect(() => loadUsers(), []);

  return (
    <div className="p-6">
      <h1 className="font-bold text-xl mb-4">User Role Management</h1>

      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Name</th>
            <th className="p-2">Phone</th>
            <th className="p-2">Role</th>
            <th className="p-2">Change Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr className="border-t">
              <td className="p-2">{u.name}</td>
              <td className="p-2">{u.phone}</td>
              <td className="p-2 font-bold">{u.role}</td>
              <td className="p-2">
                <select
                  defaultValue={u.role}
                  className="border px-2 py-1"
                  onChange={(e) => updateRole(u._id, e.target.value)}
                >
                  <option value="superadmin">Super Admin</option>
                  <option value="dean">Dean</option>
                  <option value="principal">Principal</option>
                  <option value="admin">Admin</option>
                  <option value="accountant">Accountant</option>
                  <option value="staff">Staff</option>
                  <option value="hostel">Hostel</option>
                  <option value="student">Student</option>
                  <option value="parent">Parent</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
