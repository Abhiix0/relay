import { ArrowUpRight } from "lucide-react";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <div className="not-found-rule" />
      <p className="not-found-kicker">RELAY / 404</p>
      <h1>
        This route is
        <br />
        <em>out of context.</em>
      </h1>
      <p className="not-found-copy">
        The page you’re looking for doesn’t exist or has moved somewhere else.
      </p>
      <a className="button button-copper" href="/">
        Return to Relay <ArrowUpRight size={15} />
      </a>
    </main>
  );
}
