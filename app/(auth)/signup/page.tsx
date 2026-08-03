import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { SignupForm } from "./signup-form";

export default async function SignupPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return <SignupForm dict={dict.signup} locale={locale} />;
}
