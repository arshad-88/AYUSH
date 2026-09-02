import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePatientStore } from "@/store/patientStore";
import { useEffect, useState } from "react";
import { Id } from "@/convex/_generated/dataModel";

export function useConvexAYUSH(consultationId: Id<"consultations"> | null) {
  const [loading, setLoading] = useState(true);
  const [assessmentId, setAssessmentId] = useState<Id<"ayushAssessments"> | null>(null);

  const existingAssessment = useQuery(
    api.ayushAssessments.getAYUSHByConsultation,
    consultationId ? { consultationId } : "skip"
  );

  const createAYUSH = useMutation(api.ayushAssessments.createAYUSH);
  const updateAYUSH = useMutation(api.ayushAssessments.updateAYUSH);

  useEffect(() => {
    if (!consultationId) {
      setLoading(false);
      return;
    }
    if (existingAssessment === undefined) {
      setLoading(true);
      return;
    }
    if (existingAssessment) {
      setAssessmentId(existingAssessment._id);
      // Optionally hydrate store with existing data
      const { responses, aharaVihara } = existingAssessment;
      // We could update the store here, but we'll let the page handle that
    }
    setLoading(false);
  }, [consultationId, existingAssessment]);

  const saveAYUSH = async (responses: Record<string, string>, aharaVihara: Record<string, string>) => {
    if (!consultationId) return;
    const patientId = usePatientStore.getState().id as Id<"patients">;
    if (!patientId) return;
    if (assessmentId) {
      await updateAYUSH({ assessmentId, responses, aharaVihara });
    } else {
      const newId = await createAYUSH({ patientId, consultationId, responses, aharaVihara });
      setAssessmentId(newId);
    }
  };

  return { loading, assessmentId, existingAssessment, saveAYUSH };
}