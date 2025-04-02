interface ErrorMessageProps {
  message: string | null;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;
  return <div className="text-red-500 mb-4">{message}</div>;
} 