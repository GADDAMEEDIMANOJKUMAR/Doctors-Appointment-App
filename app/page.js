import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-4">Welcome to Doctors Meet</h1>
      <p className="text-lg text-gray-600 mb-8">
        Your one-stop solution for managing doctor appointments and patient records.
      </p>
    </div>
  );
}
