const defaultImageIds = {
  dumplings: "photo-1534422298391-e4f8c172dddb",
  noodles: "photo-1634864572865-1cf8ff8bd23d",
  tea: "photo-1683533698664-12ee473e8c9d",
  dessert: "photo-1563805042-7684c019e1cb",
  drinks: "photo-1600271886742-f049cd451bba",
  grilled: "photo-1555939594-58d7cb561ad1",
  friedSnacks: "photo-1601050690597-df0568f70950",
  fries: "photo-1573080496219-bb080dd4f877",
  bread: "photo-1509440159596-0249088772ff",
  salad: "photo-1546069901-ba9599a7e63c",
  curry: "photo-1585937421612-70a008356fbe",
  rice: "photo-1680993032090-1ef7ea9b51e5",
} as const;

export const getDefaultMenuImage = (
  name: string,
  category = "",
): string => {
  const dish = `${name} ${category}`.toLowerCase();
  const imageId = /momo|dumpling/.test(dish)
    ? defaultImageIds.dumplings
    : /noodle|chow mein|thukpa|gundruk|soup/.test(dish)
      ? defaultImageIds.noodles
      : /tea|chiya|chai/.test(dish)
        ? defaultImageIds.tea
        : /drink|juice|lassi|soda|water/.test(dish)
          ? defaultImageIds.drinks
          : /dessert|sweet|yomari|gulab jamun|rasgulla|kheer|kulfi/.test(dish)
            ? defaultImageIds.dessert
            : /bread|naan|roti|paratha/.test(dish)
              ? defaultImageIds.bread
              : /fries|chips/.test(dish)
                ? defaultImageIds.fries
                : /snack|samosa|pakora|chop|puri|chatpate|chatamari|bara/.test(dish)
                  ? defaultImageIds.friedSnacks
                  : /grill|tikka|sekuwa|kebab|choila|wings|barbecue/.test(dish)
                    ? defaultImageIds.grilled
                    : /salad/.test(dish)
                      ? defaultImageIds.salad
                      : /rice|biryani|thali|khana|bhat|khaja|baji|thakali|dhido/.test(dish)
                        ? defaultImageIds.rice
                        : /curry|masala|paneer|dal|chana|gobi/.test(dish)
                          ? defaultImageIds.curry
                          : defaultImageIds.curry;

  return `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=900&q=80`;
};
