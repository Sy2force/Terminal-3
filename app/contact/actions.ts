"use server";

import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/server";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Veuillez entrer votre nom.").max(200),
  email: z.string().trim().email("Veuillez entrer une adresse email valide."),
  subject: z.string().trim().min(1, "Veuillez indiquer un sujet.").max(200),
  message: z.string().trim().min(1, "Veuillez écrire un message.").max(5000),
});

export async function sendContactMessage(
  _prevState: { success: boolean; error?: string; message?: string },
  formData: FormData,
): Promise<{ success: boolean; error?: string; message?: string }> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { success: false, error: "Veuillez vérifier les champs du formulaire." };
  }

  try {
    const supabase = createServiceRoleClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- leads not yet in generated Database type
    const db = supabase as any;

    const { error } = await db.from("leads").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      source: "contact",
      interest: parsed.data.subject,
      notes: parsed.data.message,
      marketing_opt_in: false,
    });

    if (error) {
      return { success: false, error: "Impossible d'envoyer le message. Veuillez réessayer." };
    }

    return { success: true, message: "Votre message a bien été envoyé. Nous vous répondrons rapidement." };
  } catch {
    return { success: false, error: "Impossible d'envoyer le message. Veuillez réessayer." };
  }
}
