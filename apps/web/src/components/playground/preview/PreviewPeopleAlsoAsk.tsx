import { ChevronDown } from "lucide-react";

export function PreviewPeopleAlsoAsk({ questions }: { questions: string[] }) {
  if (questions.length === 0) return null;

  return (
    <section>
      <h3 className="mb-2 text-xl">People also ask</h3>
      <ul className="border-t border-[#dadce0]">
        {questions.map((question) => (
          <li
            key={question}
            className="flex items-center justify-between gap-4 border-b border-[#dadce0] py-3 text-base"
          >
            {question}
            <ChevronDown className="size-5 shrink-0 text-[#70757a]" />
          </li>
        ))}
      </ul>
    </section>
  );
}
