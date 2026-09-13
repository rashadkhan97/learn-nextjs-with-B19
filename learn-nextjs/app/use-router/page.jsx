// app/use-router/page.jsx
'use client'; // needed: useRouter is a client-only hook
import { useRouter } from 'next/navigation';
import PageHeader from '../../components/PageHeader';

export default function UseRouterPage() {
  const router = useRouter(); // gives push/back/replace — navigate without a <Link>

  return (
    <>
      <PageHeader
        title="useRouter — Programmatic Navigation"
        description="Navigate from code instead of a clicked link — used for redirects after login, logout, and route guards."
      />
      <div className="demo">
        <button
          onClick={() =>
            window.open('https://www.google.com', '_blank') // plain browser API, nothing to do with router
          }
        >
          Visit Google in new tab
        </button>
        <button onClick={()=>router.push("https://google.com")}>Visit Google in same window</button> {/* router.push = navigate to new URL */}
        <button onClick={() => router.back()}>Go back()</button> {/* router.back = same as browser back button */}
      </div>
    </>
  );
}