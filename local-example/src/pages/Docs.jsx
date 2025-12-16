import { useTracker } from "@omni-analytics/react";

export default function Docs() {
  const tracker = useTracker();

  const handleCodeCopy = () => {
    tracker?.trackCustom("docs_copy_code", {
      section: "usage",
    });
  };

  return (
    <div className="page">
      <h1>Documentation 📚</h1>

      <section className="doc-section">
        <h2>How to Use Workspace Linking</h2>
        <p>
          This example uses <strong>pnpm workspaces</strong> with the{" "}
          <code>workspace:*</code> protocol.
        </p>

        <h3>Setup (Already Done!)</h3>
        <pre>
          {`// local-example/package.json
{
  "dependencies": {
    "@omni-analytics/sdk": "workspace:*",
    "@omni-analytics/react": "workspace:*"
  }
}
`}
        </pre>

        <h3>Run Local Development</h3>
        <pre>
          {`cd local-example
pnpm install    # Installs and links workspace packages
pnpm dev        # Starts dev server with hot reload
`}
        </pre>

        <h3>Using the SDK in Components</h3>
        <pre>
          {`import { useTracker } from '@omni-analytics/react'

export function MyComponent() {
  const tracker = useTracker()
  
  const handleClick = () => {
    // Clicks auto-tracked + custom event
    tracker?.trackCustom('my_action', {
      userId: '123',
      action: 'clicked'
    })
  }
  
  return <button onClick={handleClick}>Click me</button>
}
`}
        </pre>

        <button className="btn btn-secondary" onClick={handleCodeCopy}>
          📋 Copy Code
        </button>
      </section>

      <section className="doc-section">
        <h2>Publishing to npm</h2>
        <p>When you're ready to publish:</p>
        <pre>
          {`# Just run pnpm publish!
pnpm publish

# pnpm automatically converts workspace:* to actual versions
# No manual edits needed!
`}
        </pre>
      </section>

      <section className="doc-section">
        <h2>Key Features</h2>
        <ul>
          <li>
            🔗 <strong>Workspace Linking</strong>: Local development without npm
            installs
          </li>
          <li>
            ♻️ <strong>Auto-batching</strong>: Events batched before sending
          </li>
          <li>
            📱 <strong>Auto-tracking</strong>: Clicks, navigation, forms
            auto-tracked
          </li>
          <li>
            🎯 <strong>Custom Events</strong>: Track whatever you want
          </li>
          <li>
            🔌 <strong>React Integration</strong>: Context + Hooks pattern
          </li>
          <li>
            📦 <strong>No npm hassle</strong>: workspace:* handles everything
          </li>
        </ul>
      </section>
    </div>
  );
}
