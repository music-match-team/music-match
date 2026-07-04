import { GET } from "./app/api/eventi/route";

async function test() {
  try {
    const res = await GET();
    console.log(await res.json());
  } catch(e) {
    console.error("Error calling GET:", e);
  }
}
test();
