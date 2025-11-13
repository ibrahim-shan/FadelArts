import { Suspense } from "react";
import { SignInForm } from "@/components/signin/SignInForm";

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center">Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}
