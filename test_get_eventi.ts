import { GET } from "./app/api/eventi/route";

async function test() {
  try {
    const res = await GET(new Request("http://localhost") as any);
    console.log(await res.json());
  } catch(e) {
    console.error("Error calling GET:", e);
  }
}
test();
