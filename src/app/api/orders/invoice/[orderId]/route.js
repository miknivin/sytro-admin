import { NextResponse } from "next/server";
import ejs from "ejs";
import path from "path";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { dbConnect } from "@/lib/db/connection";

import { Order } from "@/models/Order";
import { uploadToS3 } from "@/utlis/uploadToS3";

export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { orderId } = params;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 },
      );
    }

    // 1. Fetch order
    const order = await Order.findById(orderId).lean();
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 2. If invoice already exists → return it immediately
    if (order.invoiceURL) {
      return NextResponse.json({
        success: true,
        invoiceUrl: order.invoiceURL,
        message: "Using existing invoice PDF",
      });
    }

    // 3. Render EJS to HTML
    const templatePath = path.join(process.cwd(), "src/lib/others/invoice.ejs");
    const html = await ejs.renderFile(templatePath, { order }, { async: true });

    // 4. Launch browser (Vercel/serverless compatible only)
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrORS: true,
    });

    const page = await browser.newPage();

    // Wait for fonts, images, CSS to load
    await page.setContent(html, { waitUntil: "networkidle0" });

    // 5. Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", right: "15mm", bottom: "20mm", left: "15mm" },
    });

    await browser.close();

    // 6. Upload to S3
    const fileKey = `invoices-sytro/${orderId}-${Date.now()}.pdf`;
    const pdfUrl = await uploadToS3(pdfBuffer, fileKey);

    // 7. Save URL to order
    await Order.findByIdAndUpdate(orderId, { invoiceURL: pdfUrl });

    // 8. Return success
    return NextResponse.json({
      success: true,
      invoiceUrl: pdfUrl,
    });
  } catch (error) {
    console.error("Invoice PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate or fetch invoice PDF" },
      { status: 500 },
    );
  }
}
