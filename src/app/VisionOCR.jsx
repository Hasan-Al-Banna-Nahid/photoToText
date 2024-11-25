import vision from "@google-cloud/vision";
import sharp from "sharp";

const client = new vision.ImageAnnotatorClient();

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { image } = req.body; // Base64 image from the client

      // Preprocess the image using Sharp
      const buffer = Buffer.from(image, "base64");
      const processedImage = await sharp(buffer)
        .grayscale() // Convert to grayscale
        .toBuffer();

      // Send the processed image to Google Cloud Vision for OCR
      const [result] = await client.textDetection({
        image: { content: processedImage.toString("base64") },
      });
      const extractedText = result.fullTextAnnotation
        ? result.fullTextAnnotation.text
        : "";

      res.status(200).json({ text: extractedText });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error processing image" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
