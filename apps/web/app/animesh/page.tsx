import type { Metadata } from "next";
import { AnimeshStory } from "@/components/animesh-story";

export const metadata: Metadata = {
  title: "The story · পৰীক্ষা অসম",
  description:
    "Why PorikhyaAxom exists, and the person building it. Honest mocks and analytics for Assam's competitive exams.",
};

export default function Animesh() {
  return <AnimeshStory />;
}
