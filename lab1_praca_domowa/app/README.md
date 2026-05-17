# Hazelcast

## Uruchomienie

```bash
docker compose up -d
npm install
npm start
```

## Zmienne środowiskowe

- `HAZELCAST_MAP_NAME` - nazwa mapy, domyślnie `parents`
- `HAZELCAST_CLUSTER_NAME` - nazwa klastra, domyślnie `dev`
- `HAZELCAST_MEMBERS` - adresy Hazelcast po przecinku, domyślnie `127.0.0.1:5701`
- `RECORDS_COUNT` - liczba rekordów, domyślnie `1000`
- `CHILDREN_PER_PARENT` - liczba rekordów podrzędnych na jeden rekord nadrzędny, domyślnie `5`
- `RESULT_FILE_PATH` - plik wyników relatywnie do katalogu `app`, domyślnie `../Wyniki_Hazelcast.txt`
