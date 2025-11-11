import { NextResponse } from "next/server";
import { sendEmail } from "@/app/actions/sendEmail";

export type SendMailSuccess = { message: string };

export async function POST(request: Request): Promise<NextResponse<SendMailSuccess>> {
  const { name, phone, preferredDate, formType } = await request.json();

  try {
    await sendEmail({ name, phone, preferredDate, formType });
    return NextResponse.json({ message: "Заявка отправлена!" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw NextResponse.json({ error: error.message }, { status: 500 });
      // return NextResponse.json({ error: error.message }, { status: 500 });
    }
    throw NextResponse.json({ error }, { status: 500 });
  }
}
