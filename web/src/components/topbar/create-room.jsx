import { PlusCircle } from "lucide-react";

export default function CreateRoom() {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-full bg-[#17171B] px-4 py-2 text-sm font-medium text-[#FFFAFA] hover:opacity-90"
    >
      <PlusCircle className="h-4 w-4" />
      방생성
    </button>
  );
}
