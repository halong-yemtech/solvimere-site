import ResetForm from "@/components/auth/ResetForm";

export const metadata = { title: "Reset password" };

type Props = { searchParams: Promise<{ token?: string }> };

export default async function ResetPasswordPage({ searchParams }: Props) {
  return <ResetForm token={(await searchParams).token ?? ""} />;
}
