import analytics from "@react-native-firebase/analytics";
import { usePathname } from "expo-router";
import { ReactNode, useEffect } from "react";

analytics().setAnalyticsCollectionEnabled(!__DEV__);

export default function Analytics({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const logScreenView = async () => {
      try {
        await analytics().logScreenView({
          screen_name: pathname,
          screen_class: pathname,
        });
      } catch (err: any) {
        console.error(err);
      }
    };
    logScreenView();
  }, [pathname]);

  return <>{children}</>;
}
