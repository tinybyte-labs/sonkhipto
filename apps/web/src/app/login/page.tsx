import LogIn from "./log-in";

export default function LogInPage({
  searchParams: { redirect },
}: {
  searchParams: { redirect?: string };
}) {
  return <LogIn redirect={redirect} />;
}
