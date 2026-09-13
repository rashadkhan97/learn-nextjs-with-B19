import PageHeader from '../..//components/PageHeader'; // reusable header

export default function JsxSyntaxPage() {
  const name = 'Alex';
  const isAdmin = true;

  return (
    <> {/* Fragment: groups elements, no extra DOM node, JSX allows only 1 root */}
      <PageHeader
        title="JSX Syntax Rules"
        description="JSX looks like HTML but compiles to JavaScript — a few attribute names and rules differ."
      />
      <div className="demo"> {/* className, not class (reserved word) */}
        <h3 style={{ color: 'teal' }}>{name}</h3> {/* style = object; {name} = JS value */}

        {/* && renders right side only when left side true */}
        {isAdmin && <span className="badge">Admin</span>}
        {!isAdmin && <span className="badge">User</span>}

        {isAdmin &&
          <> {/* htmlFor, not for (reserved word) */}
            <label htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="you@example.com" />
          </>
        }
      </div>
    </>
  );
}