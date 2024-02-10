import React, { ReactNode, useMemo, useState } from "react";
import { View, useWindowDimensions } from "react-native";

export default function FancyGrid<T>({
  data,
  renderItem,
  keyExtractor,
  spacing = 8,
  minWidth = 110,
  maxWidth = 180,
}: {
  data: T[];
  renderItem: (props: { item: T; index: number }) => ReactNode;
  keyExtractor?: (item: T) => string;
  spacing?: number;
  minWidth?: number;
  maxWidth?: number;
}) {
  const dimensions = useWindowDimensions();
  const [width, setWidth] = useState(dimensions.width);

  const widths = useMemo(() => {
    const widths: number[] = [];
    const minSplit = Math.floor(width / maxWidth);
    const maxSplit = Math.floor(width / minWidth);
    const totalSplitsInAGroup = minSplit + maxSplit;
    const totalGroups = Math.ceil(data.length / totalSplitsInAGroup);

    for (let i = 0; i < totalGroups; i++) {
      const minRowStartIndex = i * totalSplitsInAGroup;
      const minRowItemWidth = Math.max(
        0,
        Math.floor((width - (minSplit - 1) * spacing) / minSplit)
      );

      for (let j = minRowStartIndex; j < minRowStartIndex + minSplit; j++) {
        widths[j] = minRowItemWidth;
      }

      const maxRowStartIndex = minRowStartIndex + minSplit;
      const maxRowItemWidth = Math.max(
        0,
        Math.floor((width - (maxSplit - 1) * spacing) / maxSplit)
      );

      for (let j = maxRowStartIndex; j < maxRowStartIndex + maxSplit; j++) {
        widths[j] = maxRowItemWidth;
      }
    }
    return widths;
  }, [data, maxWidth, minWidth, spacing, width]);

  return (
    <View
      style={{ gap: spacing, flexDirection: "row", flexWrap: "wrap" }}
      onLayout={(event) => {
        setWidth(event.nativeEvent.layout.width);
      }}
    >
      {data.map((item, i) => (
        <View
          key={keyExtractor ? keyExtractor(item) : i}
          style={{ width: widths[i] }}
        >
          {renderItem({ item, index: i })}
        </View>
      ))}
    </View>
  );
}
