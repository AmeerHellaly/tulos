


import { validatePreviewUrl } from "@sanity/preview-url-secret";


import { redirect } from "next/navigation";


import { draftMode } from "next/headers";
const token = process.env.SANITY_API_READ_TOKEN;
export async function GET(request: Request) {

}