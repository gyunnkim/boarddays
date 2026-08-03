import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return <LoginForm dict={dict.login} guestDict={dict.guest} locale={locale} />;
}
