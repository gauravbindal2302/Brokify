import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const url = process.env.NEXT_PUBLIC_URL;
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <a href={url} className="text-white hover:underline">Visit Instagram</a>
      <h1>Hey! This is our home page</h1>
       <ul>
        <li>
          <Link href="/dashboard">Go to Dashboard</Link>
        </li>
        <li>
          <Link href="/profile">Go to Profile</Link>
        </li>
        <li>
          <Link href="/fetchUniqueItems">Go to Fetch_Unique_Items</Link>
        </li>
      </ul>
    </div>
  );
}
