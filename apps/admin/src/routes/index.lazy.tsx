import { trpc } from "@/utils/trpc";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  const helloQuery = trpc.api.hello.useQuery({ username: "Hello" });
  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
      <pre>{JSON.stringify(helloQuery, null, 2)}</pre>
    </div>
  );
}
