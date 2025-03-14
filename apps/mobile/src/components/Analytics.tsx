import analytics from "@react-native-firebase/analytics";
import { usePathname } from "expo-router";
import type { ReactNode } from "react";
import { useEffect } from "react";

void analytics().setAnalyticsCollectionEnabled(!__DEV__);

export default function Analytics({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const logScreenView = async () => {
      try {
        await analytics().logScreenView({
          screen_name: pathname,
          screen_class: pathname,
        });
      } catch (error: unknown) {
        console.error(error);
      }
    };
    void logScreenView();
  }, [pathname]);

  return <>{children}</>;
}
