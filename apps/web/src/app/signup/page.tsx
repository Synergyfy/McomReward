import { headers } from "next/headers";
import SignupClient from "./SignupClient";

interface SignupPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SignupPage(props: SignupPageProps) {
  const searchParams = await props.searchParams;
  const headersList = await headers();

  const rawCode = searchParams.provisionCode;
  let provisionCode: string | undefined;

  if (Array.isArray(rawCode)) {
    provisionCode = rawCode[0];
  } else {
    provisionCode = rawCode;
  }

  // If not found in query params, check headers
  if (!provisionCode) {
    const headerCode = headersList.get("provisionCode");
    if (headerCode) {
      provisionCode = headerCode;
    }
  }

  return <SignupClient provisionCode={provisionCode} />;
}
