import Link from 'next/link';
import PageHeader from '../../components/PageHeader';

export default function UseParamsIndexPage() {
  return (
    <>
      <PageHeader
        title="useParams — Read Dynamic URL Segments"
        description="Click a link below — the same page file reads a different id from the URL each time."
      />
      <div className="demo">
        {/* each link hits the same [id] page file below, only the id in the URL changes */}
        <ul>
          <li><Link href="/use-params/1">/use-params/1</Link></li>
          <li><Link href="/use-params/2">/use-params/2</Link></li>
          <li><Link href="/use-params/3">/use-params/3</Link></li>
        </ul>
      </div>
    </>
  );
}