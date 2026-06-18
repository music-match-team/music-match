export async function GET(
  request: Request
) {

  const { searchParams } =
    new URL(request.url);

  const query =
    searchParams.get("q");

  if (!query) {

    return Response.json([]);

  }

  const response =
    await fetch(
      `http://api.geonames.org/searchJSON?q=${query}&maxRows=10&country=IT&username=${process.env.GEONAMES_USERNAME}`
    );

  const data =
    await response.json();

  return Response.json(
    data.geonames || []
  );
}