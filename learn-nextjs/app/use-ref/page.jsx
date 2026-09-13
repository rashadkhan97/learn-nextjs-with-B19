'use client';
import { useRef, useState } from 'react';
import PageHeader from '../..//components/PageHeader';

export default function UseRefPage() {
  // The ref starts as null and React fills it with the real <input> DOM
  // node once the element is on screen.
  const emailRef = useRef(null);

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault(); // stops browser's default full page reload on form submit

    if (!email.trim()) {
      setMessage('Email is required');
      emailRef.current.focus(); // put the cursor back on the problem
      return;
    }

    setMessage(`Submitted: ${email}`);
  };

  return (
    <>
      <PageHeader
        title="useRef — Focusing an Input"
        description="Submit with the email box empty and the ref puts the cursor back in it."
      />
      <div className="demo">
        <form onSubmit={handleSubmit}>
          <input
            ref={emailRef} // links this DOM node to emailRef.current
            value={email} // controlled input: value always comes from React state
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <button type="submit">Submit</button>
        </form>
        {message && <p className="note">{message}</p>}
      </div>
    </>
  );
}