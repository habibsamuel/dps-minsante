import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { colors, radius, shadow, space } from "@/theme";

type Props = {
  children: ReactNode;
  /** Largeur maximale de la carte (le formulaire reste centré). */
  maxWidth?: number;
};

export function AuthCard({ children, maxWidth = 560 }: Props) {
  return (
    <View style={styles.outer}>
      <View style={[styles.card, { maxWidth }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { width: "100%", alignItems: "center", paddingVertical: space.lg },
  card: {
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    padding: space.xl,
    ...shadow.card,
  },
});
