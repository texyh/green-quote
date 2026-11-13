import SignInForm from "./signin-form";

export default async function SignInPage({
  searchParams,
}: PageProps<"/signin">) {
  const { error } = await searchParams;
  return <SignInForm keycloakFailed={error === "keycloak"} />;
}
