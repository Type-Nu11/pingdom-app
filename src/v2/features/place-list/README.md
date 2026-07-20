# Place list example feature

This feature demonstrates the required V2 dependency flow:

```text
PlaceListExampleScreen
  -> usePlaceList
    -> placeListApi.getPlaceList
      -> shared/api/apiClient
        -> GET /places
```

- The screen owns rendering only.
- The hook owns React Query state and query keys.
- The API module owns endpoint and request parameter mapping.
- The shared client owns transport configuration and error normalization.
- The example screen is shown only when `EXPO_PUBLIC_ENABLE_PLACE_LIST=true`.
