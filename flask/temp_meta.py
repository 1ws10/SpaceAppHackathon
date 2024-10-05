import requests
import itertools

def fetch_stac_server(query):
    '''
    Queries the stac-server (STAC) backend.
    This function handles pagination.
    query is a python dictionary to pass as json to the request.
    '''
    headers = {
        "Content-Type": "application/json",
        "Accept-Encoding": "gzip",
        "Accept": "application/geo+json",
    }

    url = f"https://landsatlook.usgs.gov/stac-server/search"
    data = requests.post(url, headers=headers, json=query).json()
    error = data.get("message", "")
    if error:
        raise Exception(f"STAC-Server failed and returned: {error}")

    context = data.get("context", {})
    if not context.get("matched"):
        return []
    print(context)

    features = data["features"]
    if data["links"]:
        query["page"] += 1
        query["limit"] = context["limit"]

        features = list(itertools.chain(features, fetch_stac_server(query)))

    return features

query = {"bbox":[-98.4375,38.82259097617712,-95.625,40.97989806962013],"collections":["landsat-c2l2-sr","landsat-c2l2-st"],"query":{"eo:cloud_cover":{"lte":50},"platform":{"in":["LANDSAT_9","LANDSAT_8"]},"landsat:collection_category":{"in":["T1","T2","RT"]}},"datetime":"2021-10-31T00:00:00.000Z/2024-09-28T23:59:59.999Z","page":1,"limit":100}

features = fetch_stac_server(query)

print(features)