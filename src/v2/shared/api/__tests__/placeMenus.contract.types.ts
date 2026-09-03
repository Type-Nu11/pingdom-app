import type {
  PlaceMenusOperationResponse,
  PlaceMenusSchema,
} from '../placeMenusContract';

type Equal<Left, Right> =
  (<T>() => T extends Left ? 1 : 2) extends (<T>() => T extends Right ? 1 : 2)
    ? true
    : false;
type Assert<T extends true> = T;

type Menu = PlaceMenusSchema<'PlaceMenuResponse'>;
type MenuList = PlaceMenusOperationResponse<'list_5', 200>;

export type MenuResponseUsesGeneratedSchema = Assert<Equal<MenuList[number], Menu>>;
export type OptionalIdRemainsOptional = Assert<Equal<Menu['id'], number | undefined>>;
export type OptionalNameRemainsOptional = Assert<Equal<Menu['name'], string | undefined>>;
export type NullableDescriptionRemainsNullable = Assert<
  Equal<Menu['description'], string | null | undefined>
>;
export type NullableImageRemainsNullable = Assert<
  Equal<Menu['imageUrl'], string | null | undefined>
>;
