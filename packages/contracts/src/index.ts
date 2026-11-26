import { z } from "zod";
export const projectIds = [
  "harbour-residences",
  "garden-district",
  "coastal-quarter",
] as const;
export const leadSchema = z
  .object({
    fullName: z.string().trim().min(2).max(100),
    phone: z
      .string()
      .trim()
      .regex(
        /^(?:\+[1-9]\d{7,14}|0\d{8,10})$/,
        "Use a valid international or local phone number.",
      ),
    consent: z.literal(true, { error: "Consent is required." }),
    projectId: z.enum(projectIds),
    variant: z.enum(["a", "b"]).default("a"),
  })
  .strict();
export type Lead = z.infer<typeof leadSchema>;
export const metaSchema = z.object({
  object: z.literal("page"),
  entry: z
    .array(
      z.object({
        id: z.string().min(1).max(100),
        changes: z
          .array(
            z.object({
              field: z.literal("leadgen"),
              value: z
                .object({
                  leadgen_id: z.string().min(1).max(100),
                  page_id: z.string().min(1).max(100),
                })
                .passthrough(),
            }),
          )
          .min(1)
          .max(100),
      }),
    )
    .min(1)
    .max(100),
});
export type MetaPayload = z.infer<typeof metaSchema>;
export function normalizedPhone(value: string): string {
  return value.trim().replace(/[\s().-]/g, "");
}
export function variantFrom(value: unknown): "a" | "b" {
  return value === "b" ? "b" : "a";
}
