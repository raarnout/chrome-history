interface TitleProps {
  text: string;
}

export default function Title({ text }: TitleProps) {
  return <h1 className="text-2xl font-bold mb-4">{text}</h1>;
} 