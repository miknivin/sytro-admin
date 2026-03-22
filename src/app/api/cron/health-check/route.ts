export async function GET() {
  const res = await fetch("https://zzpsnc8uyf.ap-southeast-2.awsapprunner.com/health/db", {
    method: "GET",
    cache: "no-store"
  });

  return Response.json({
    ok: res.ok,
    status: res.status
  });
}
