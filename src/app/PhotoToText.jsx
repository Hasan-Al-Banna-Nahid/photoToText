"use client";
import { useState } from "react";
import Tesseract from "tesseract.js";
import { jsPDF } from "jspdf";

export default function TextToPDF() {
  const [images, setImages] = useState([]);
  const [extractedTexts, setExtractedTexts] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImages(files);
    }
  };

  const extractTextFromImages = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    setExtractedTexts([]);

    try {
      const texts = [];
      for (const image of images) {
        const result = await Tesseract.recognize(image, "eng", {
          logger: (info) => console.log(info), // Logs progress
        });
        texts.push(result.data.text);
      }
      setExtractedTexts(texts);
    } catch (error) {
      console.error("Error during text extraction:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateAndCombinePDFs = () => {
    if (extractedTexts.length === 0) return;

    const combinedPDF = new jsPDF();
    const pageWidth = combinedPDF.internal.pageSize.getWidth();
    const pageHeight = combinedPDF.internal.pageSize.getHeight();

    const margin = 10; // Margin for content
    const headerHeight = 20; // Space for header
    const footerHeight = 10; // Space for footer
    const contentHeight = pageHeight - headerHeight - footerHeight - margin * 2;

    extractedTexts.forEach((text, index) => {
      if (index > 0) combinedPDF.addPage();

      // Add header
      combinedPDF.setFont("Helvetica", "bold");
      combinedPDF.setFontSize(16);
      combinedPDF.text(`Document ${index + 1}`, pageWidth / 2, margin + 10, {
        align: "center",
      });

      // Split text into pages
      combinedPDF.setFont("Helvetica", "normal");
      combinedPDF.setFontSize(12);
      const lines = combinedPDF.splitTextToSize(text, pageWidth - margin * 2);
      let cursorY = headerHeight + margin;

      let pageCount = 1;
      for (let i = 0; i < lines.length; i++) {
        if (cursorY + 10 > contentHeight) {
          // Footer with page number
          combinedPDF.setFontSize(10);
          combinedPDF.text(
            `Page ${pageCount}`,
            pageWidth / 2,
            pageHeight - footerHeight,
            { align: "center" }
          );

          // Add new page
          combinedPDF.addPage();
          cursorY = headerHeight + margin;
          pageCount++;
        }

        combinedPDF.text(lines[i], margin, cursorY);
        cursorY += 10; // Line spacing
      }

      // Footer on the last page
      combinedPDF.setFontSize(10);
      combinedPDF.text(
        `Page ${pageCount}`,
        pageWidth / 2,
        pageHeight - footerHeight,
        { align: "center" }
      );
    });

    // Save the combined PDF
    combinedPDF.save("combined-documents.pdf");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Extract Text from Multiple Images & Combine PDFs
        </h1>

        <div className="flex flex-col items-center mb-6">
          <input
            type="file"
            accept="image/*"
            multiple
            className="w-full border border-gray-300 rounded p-2"
            onChange={handleImageUpload}
          />
        </div>

        {images.length > 0 && (
          <div className="flex justify-center mb-6">
            <button
              className={`px-6 py-2 rounded-lg font-semibold text-white ${
                isProcessing
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
              onClick={extractTextFromImages}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Extract Text"}
            </button>
          </div>
        )}

        {extractedTexts.length > 0 && (
          <div className="mb-6 max-h-60 overflow-y-auto">
            {extractedTexts.map((text, index) => (
              <iframe
                key={index}
                className="w-full h-60 border border-gray-300 rounded mb-4"
                srcDoc={text}
                title={`Extracted Text ${index + 1}`}
              />
            ))}
          </div>
        )}

        {extractedTexts.length > 0 && (
          <div className="flex justify-center">
            <button
              className="px-6 py-2 rounded-lg font-semibold bg-green-500 hover:bg-green-600 text-white"
              onClick={generateAndCombinePDFs}
            >
              Download Combined PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
