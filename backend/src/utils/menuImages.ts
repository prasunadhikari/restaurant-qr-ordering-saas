const generatedImageIds = [
  "photo-1534422298391-e4f8c172dddb",
  "photo-1634864572865-1cf8ff8bd23d",
  "photo-1683533698664-12ee473e8c9d",
  "photo-1563805042-7684c019e1cb",
  "photo-1600271886742-f049cd451bba",
  "photo-1555939594-58d7cb561ad1",
  "photo-1601050690597-df0568f70950",
  "photo-1573080496219-bb080dd4f877",
  "photo-1509440159596-0249088772ff",
  "photo-1546069901-ba9599a7e63c",
  "photo-1585937421612-70a008356fbe",
  "photo-1680993032090-1ef7ea9b51e5",
];

export const isGeneratedDishImage = (image: string): boolean =>
  generatedImageIds.some((id) => image.includes(id));
