import Image from "next/image";
import TextToPDF from "./PhotoToText";

export default function Home() {
  return (
    <div className=" font-[family-name:var(--font-geist-sans)]">
      <TextToPDF />
    </div>
  );
}
