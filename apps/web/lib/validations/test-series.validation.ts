import { z } from "zod";

export const getTestSeriesBySeriesNameSchema = z.object({
  series_name: z.string().min(1, "series_name is required"),
});

export type GetTestSeriesBySeriesNameInput = z.infer<typeof getTestSeriesBySeriesNameSchema>;
