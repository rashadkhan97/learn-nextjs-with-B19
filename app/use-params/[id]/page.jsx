'use client'; // needed: useParams is a client-only hook
import { useParams } from 'next/navigation';
import Link from 'next/link';
import PageHeader from '../../../components/PageHeader';

// folder name [id] = dynamic route segment; matches /use-params/1, /2, /3, etc.
export default function UseParamsDetailPage() {
  const { id } = useParams(); // reads the [id] segment from the URL

  return (
    <>
      <PageHeader
        title={`useParams — Showing id: ${id}`}
        description="This same page file renders for /1, /2, and /3 — only the id changes."
      />
      <div className="demo">
        <p>URL param id: <strong>{id}</strong></p>
        <Link href="/use-params">← Back</Link>
      </div>
    </>
  );
}