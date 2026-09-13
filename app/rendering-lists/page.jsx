"use client" // needed: component uses useState (hooks require a Client Component)
import { useState } from 'react';
import PageHeader from '../../components/PageHeader';

let nextId = 1; // module-level counter, outside component so it isn't reset on re-render

export default function RenderingListsPage() {
  const [users, setUsers] = useState([]); // list state, starts empty

  const addUser = () => {
    setUsers([...users, { id: nextId, name: `User ${nextId}` }]); // spread = new array, never mutate state directly
    nextId += 1;
  };

  const removeUser = (id) => setUsers(users.filter((u) => u.id !== id)); // filter out by id = immutable remove
  return (
    <>
      <PageHeader
        title="Rendering Lists with map()"
        description="Every mapped element needs a unique, stable key — the item's id, never the array index."
      />
      <div className="demo">
        <button onClick={addUser}>Add User</button>
        <ul>
          {users.map((user) => (
            <li key={user.id}> {/* key = user.id, stable across re-renders */}
              {user.name}{' '}
              <button onClick={() => removeUser(user.id)}>Remove</button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}