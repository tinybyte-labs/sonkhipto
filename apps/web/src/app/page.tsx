import { APPSTORE_URL, GOOGLE_PLAY_URL } from "@acme/core/constants";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="prose mx-auto my-16">
      <h1>Welcome to Sonkhipto</h1>
      <h2>Your Daily Dose of Concise News. Stay Informed, Save Time!</h2>
      <p>
        Sonkhipto delivers concise news updates tailored for the modern reader.
        Stay ahead of the curve with quick, easy-to-digest news bites in both
        Bangla and English. Spend less time scrolling, more time knowing.
      </p>
      <ul>
        <li>
          <Link href={GOOGLE_PLAY_URL}>Get it on Google Play</Link>
        </li>
        <li>
          <Link href={APPSTORE_URL}>Download on the AppStore</Link>
        </li>
        <li>
          <Link href="/legal/privacy">Privacy Policy</Link>
        </li>
        <li>
          <Link href="/legal/terms">Terms of Service</Link>
        </li>
      </ul>
    </main>
  );
}
