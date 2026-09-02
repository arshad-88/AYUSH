import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePatientStore } from "@/store/patientStore";
import { useEffect, useState } from "react";
import { Id } from "@/convex/_generated/dataModel";

export function useConvexConsultation() {
  const { id: patientId, language, inputMode, clinicalState, socrates, ayush, aharaVihara, verification, interviewComplete, assessmentStatus, activeInterviewQuestion, activeInterviewTargetField } = usePatientStore();
  const [loading, setLoading] = useState(true);
  const [consultationId, setConsultationId] = useState<Id<"consultations"> | null>(null);

  // Query active consultation
  const activeConsultation = useQuery(
    api.consultations.getActiveConsultation,
    patientId ? { patientId: patientId as Id<"patients"> } : "skip"
  );

  // Mutations
  const createConsultation = useMutation(api.consultations.createConsultation);
  const updateConsultation = useMutation(api.consultations.updateConsultation);
  const completeConsultation = useMutation(api.consultations.completeConsultation);

  // Effect to load or create consultation
  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      return;
    }

    if (activeConsultation === undefined) {
      setLoading(true);
      return;
    }

    if (activeConsultation === null) {
      // Create new consultation
      createConsultation({
        patientId: patientId as Id<"patients">,
        language: language || "English",
        inputMode: inputMode || undefined,
        clinicalState: clinicalState,
        socrates: socrates,
        ayush: ayush,
        aharaVihara: aharaVihara,
        verification: verification,
        interviewComplete: interviewComplete || false,
        assessmentStatus: assessmentStatus || "idle",
        activeInterviewQuestion: activeInterviewQuestion || "",
        activeInterviewTargetField: activeInterviewTargetField || undefined,
      }).then((id) => {
        setConsultationId(id);
        setLoading(false);
      }).catch((err) => {
        console.error("Failed to create consultation:", err);
        setLoading(false);
      });
    } else {
      setConsultationId(activeConsultation._id);
      setLoading(false);
    }
  }, [patientId, activeConsultation, createConsultation, language, inputMode, clinicalState, socrates, ayush, aharaVihara, verification, interviewComplete, assessmentStatus, activeInterviewQuestion, activeInterviewTargetField]);

  // Function to persist consultation updates
  const persistConsultationUpdate = async (updates: {
    language?: string;
    inputMode?: "voice" | "touch";
    clinicalState?: any;
    socrates?: any;
    ayush?: any;
    aharaVihara?: any;
    triage?: any;
    caseSheet?: any;
    verification?: any;
    interviewComplete?: boolean;
    assessmentStatus?: "idle" | "in-progress" | "completed";
    activeInterviewQuestion?: string;
    activeInterviewTargetField?: string;
    completedAt?: number;
  }) => {
    if (!consultationId) {
      console.warn("No consultation ID to update");
      return;
    }

    try {
      await updateConsultation({
        consultationId: consultationId,
        ...updates,
      });
    } catch (error) {
      console.error("Failed to update consultation:", error);
    }
  };

  const markCompleted = async () => {
    if (!consultationId) return;
    try {
      await completeConsultation({ consultationId });
    } catch (error) {
      console.error("Failed to complete consultation:", error);
    }
  };

  return {
    loading,
    consultationId,
    persistConsultationUpdate,
    markCompleted,
  };
}