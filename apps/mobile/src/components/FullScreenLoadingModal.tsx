import { ActivityIndicator, Modal, StyleSheet,View } from "react-native";

import { useColors } from "@/hooks/useColors";

export default function FullScreenLoadingModal({
  visible,
}: {
  visible: boolean;
}) {
  const colors = useColors();
  return (
    <Modal transparent visible={visible}>
      <View style={styles.container}>
        <View style={[styles.boxContainer, { backgroundColor: colors.card }]}>
          <ActivityIndicator />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  boxContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
