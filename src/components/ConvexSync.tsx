import { useEffect } from "react";
import { useConvexPatient } from "@/hooks/useConvexPatient";
import { useConvexConsultation } from "@/hooks/useConvexConsultation";
import { usePatientStore } from "@/store/patientStore";

export function ConvexSync() {
  const { loading: patientLoading } = useConvexPatient();
  const { loading: consultationLoading } = useConvexConsultation();
  const isAuthenticated = usePatientStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (patientLoading || consultationLoading) {
      // Still loading, show nothing
      return;
    }
    // Once both are loaded, we can optionally do any post-sync actions
    // For now, just log that sync is complete
    if (isAuthenticated) {
      console.log("[ConvexSync] Patient and consultation synced");
    }
  }, [patientLoading, consultationLoading, isAuthenticated]);

  // No UI rendered
  return null;
}