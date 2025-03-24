// import FileUploaderConverter from "@/components/file-uploader-converter";

// export default function Home() {
//   return (
//     <main className="container mx-auto py-10 px-4">
//       <h1 className="text-3xl font-bold mb-8 text-center">File Uploader</h1>
//       <FileUploaderConverter />
//     </main>
//   );
// }

import ConversionForm from "@/app/components/ConversionForm";

export default function Home() {
  return (
    <main className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <ConversionForm />
      </div>
    </main>
  );
}
