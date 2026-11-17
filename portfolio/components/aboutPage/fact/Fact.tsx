import { EditableItem, EditText } from "@/components/edit/Editable";
import MyIcon from "../../MyIcon";
import type { FactData } from "@/lib/siteTypes";

interface Props {
  fact: FactData;
  border: boolean;
  pos: number;
}

export default function Fact({ fact, border, pos }: Props) {
  return (
    <li
      className={`w-full h-fit flex flex-col items-center py-10 px-12 relative vCustomLine before:right-0 ${
        border ? `${pos === 1 ? "before:hidden sm:before:block" : "before:block"}` : "before:hidden"
      }`}
    >
      <EditableItem slug="facts" id={fact.id} className="w-full flex flex-col items-center">
        <MyIcon Icon={fact.icon} />
        <EditText
          as="p"
          target={{ kind: "collection", slug: "facts", id: fact.id }}
          field="description"
          value={fact.description}
          className="text-2xl text-gray-300 leading-relaxed tracking-wide text-center mt-4"
        />
      </EditableItem>
    </li>
  );
}
