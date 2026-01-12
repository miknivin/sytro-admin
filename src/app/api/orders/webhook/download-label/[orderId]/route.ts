// app/api/orders/webhook/download-label/[orderId]/route.ts

import { NextResponse } from "next/server";
import axios from "axios";
import { isAuthenticatedUser, authorizeRoles } from "@/middlewares/auth";
import dbConnect from "@/lib/db/connection";
import Order from "@/models/Order";

const DELHIVERY_API_TOKEN = process.env.DELHIVERY_API_TOKEN;

export async function GET(
    request: Request,
    { params }: { params: { orderId: string } },
) {
    try {
        await dbConnect();

        const user = await isAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json(
                { success: false, message: "Need to login" },
                { status: 400 },
            );
        }
        authorizeRoles(user, "admin");

        const { orderId } = params;
        const { searchParams } = new URL(request.url);
        const isView = searchParams.get("view") === "true";

        const order = await Order.findById(orderId);
        if (!order || !order.waybill) {
            return NextResponse.json(
                { success: false, message: "Waybill not found" },
                { status: 404 },
            );
        }

        if (!DELHIVERY_API_TOKEN) {
            return NextResponse.json(
                { success: false, message: "API Token missing" },
                { status: 500 },
            );
        }

        // OFFICIAL DELHIERY PACKING SLIP API
        const response = await axios.get("https://track.delhivery.com/api/p/packing_slip", {
            params: {
                wbns: order.waybill,
                pdf: "true",
            },
            headers: {
                "Authorization": `Token ${DELHIVERY_API_TOKEN.trim()}`,
                "Content-Type": "application/json",
            },
            responseType: "arraybuffer",
        });

        // Convert response to Buffer
        const buffer = Buffer.from(response.data);
        let finalPdfBuffer: Buffer;

        // Check if it's a direct PDF binary
        if (buffer.toString('utf-8', 0, 5) === '%PDF-') {
            finalPdfBuffer = buffer;
        } else {
            // Try to parse as JSON in case Delhivery returned base64 in JSON
            try {
                const jsonStr = buffer.toString('utf-8');
                const jsonResponse = JSON.parse(jsonStr);

                // Delhivery returns label in different formats:
                // 1. { "pdf_encoding": "..." }
                // 2. { "packages": [{ "pdf_encoding": "..." }] }
                // 3. { "packing_slip": "..." }

                let base64Data = jsonResponse.pdf_encoding ||
                    jsonResponse.packing_slip ||
                    jsonResponse.packages?.[0]?.pdf_encoding ||
                    jsonResponse.packages?.[0]?.packing_slip;

                if (base64Data) {
                    finalPdfBuffer = Buffer.from(base64Data, 'base64');
                } else {
                    console.error("Delhivery JSON format unknown:", Object.keys(jsonResponse));
                    throw new Error("No PDF content found in response");
                }
            } catch (e: any) {
                console.error("Failed to parse label response:", e.message);
                return NextResponse.json(
                    { success: false, message: "Delhivery returned invalid label data format." },
                    { status: 400 }
                );
            }
        }

        const disposition = isView ? "inline" : `attachment; filename="delhivery-label-${order.waybill}.pdf"`;

        return new NextResponse(finalPdfBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": disposition,
                "Cache-Control": "no-store, max-age=0",
            },
        });

    } catch (error: any) {
        console.error("Label Download Error:", error.response?.status, error.message);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch official label from Delhivery.",
                status: error.response?.status
            },
            { status: error.response?.status || 500 },
        );
    }
}
