// app/use-effect/page.jsx
'use client'; // needed: useEffect + useState require a Client Component
import { useEffect, useState } from 'react';
import axios from 'axios'; // not in package.json yet — run `npm install axios` or swap to fetch() below
import PageHeader from '../../components/PageHeader';

export default function UseEffectPage() {
  const [users, setUsers] = useState([]);

  ////////////// using FETCH ////////////
//   useEffect(() => {
//     // Runs after the first render. [] is what makes it run only once.
//     fetch('https://jsonplaceholder.typicode.com/users')
//       .then((res) => res.json())
//       .then((data) => setUsers(data));
//   }, []);

  //////////// using AXIOS ////////////////////
  useEffect(() => {
    // [] dependency array = effect runs once, only after first render (not on every re-render)
    // Same call with axios. It parses JSON for us, so the body is in res.data.
    axios   //axios is the api call client 
      .get('https://jsonplaceholder.typicode.com/users')
      .then((res) => setUsers(res.data));
  }, []);

  return (
    <>
      <PageHeader
        title="useEffect — Fetching Data After Render"
        description="The effect calls a GET API once, after the first render, and stores the response in state."
      />
      <div className="demo">
        <ul>
                                  {/* .map turns array of user objects into array of <li> elements — JSX has no for-loop, this is how lists render */}
          {users.map((user) => ( // ( ) wraps multiline JSX for implicit return — without it, line break + no "return" gives undefined
            <li key={user.id}> {/* key = user.id from API, stable and unique */}
                {user.id}-{user.name}-{user.email}</li>
          ))}
        </ul>
      </div>
    </>
  );
}