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
- The example screen follows the shared place-list runtime flag. It defaults on only for app-linked
  real development and can be overridden with `EXPO_PUBLIC_ENABLE_PLACE_LIST=true|false`.
