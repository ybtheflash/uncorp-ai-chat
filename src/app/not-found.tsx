import * as React from "react";
import { FaviconSmirk } from "../components/favicon";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <div className="flex flex-col items-center">
        <div className="mb-8">
          <FaviconSmirk className="w-24 h-24 mx-auto opacity-80" />
        </div>
        <div className="text-5xl font-bold mb-2">404</div>
        <div className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <span className="text-blue-600">:(</span>
          <span>Not Found</span>
        </div>
        <div className="bg-blue-100 dark:bg-blue-900/40 rounded-lg px-6 py-4 text-blue-900 dark:text-blue-200 text-center max-w-md shadow">
          <div className="text-lg font-mono mb-2">
            Your AI has run into a problem and needs to restart.
          </div>
          <div className="text-sm opacity-80">
            If you think this is a mistake, try going back to the homepage.
          </div>
        </div>
        <a
          href="/"
          className="mt-8 px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
