import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "./use-auth";
import { usePatientStore } from "@/store/patientStore";
import { useEffect, useState } from "react";
import { PatientIdentity } from "@/types";

export function useConvexPatient() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { loginPatient, setPatient, isAuthenticated: storeAuthenticated, currentPatient } = usePatientStore();
  const [loading, setLoading] = useState(true);

  // Queries
  const patientData = useQuery(
    api.patients.getPatientByUserId,
    {}
  );

  // Mutations
  const createPatient = useMutation(api.patients.createPatient);
  const updatePatient = useMutation(api.patients.updatePatient);

  // Effect to load or create patient when user authenticates
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    async function syncPatient() {
      try {
        // If we already have a patient in store and it's the same user, skip
        if (storeAuthenticated && currentPatient) {
          setLoading(false);
          return;
        }

        // If patientData is loading, wait
        if (patientData === undefined) {
          setLoading(true);
          return;
        }

        if (patientData === null) {
          // No patient exists, create one
          // Use mock user data from auth
          const patientIdentity: PatientIdentity = {
            patientId: `patient-${Date.now()}`,
            displayName: user?.name || "Patient",
            identityProvider: "demo",
            verificationStatus: "demo",
            isGuardian: false,
            linkedPatientIds: [],
            createdAt: new Date().toISOString(),
          };

          const newPatientId = await createPatient({
            name: patientIdentity.displayName,
            language: "English",
            consentGiven: false,
            identity: patientIdentity,
            authenticationProvider: "demo",
            verificationStatus: "demo",
          });

          // Update store
          loginPatient(patientIdentity, {
            id: newPatientId,
            name: patientIdentity.displayName,
            isAuthenticated: true,
          });
        } else {
          // Patient exists, load into store
          const identity: PatientIdentity = {
            patientId: patientData._id,
            displayName: patientData.name,
            abhaId: patientData.abhaId,
            identityProvider: (patientData.authenticationProvider as any) || "demo",
            verificationStatus: (patientData.verificationStatus as any) || "pending",
            isGuardian: false,
            linkedPatientIds: [],
            createdAt: new Date().toISOString(),
          };

          loginPatient(identity, {
            id: patientData._id,
            name: patientData.name,
            age: patientData.age || 0,
            gender: patientData.gender || "",
            language: patientData.language || "English",
            abhaId: patientData.abhaId || "",
            mobileNumber: patientData.mobileNumber || "",
            consentGiven: patientData.consentGiven || false,
            isAuthenticated: true,
          });
        }
      } catch (error) {
        console.error("Failed to sync patient:", error);
      } finally {
        setLoading(false);
      }
    }

    syncPatient();
  }, [authLoading, isAuthenticated, user, patientData, createPatient, loginPatient, storeAuthenticated, currentPatient]);

  // Function to persist updates to Convex
  const persistPatientUpdate = async (updates: {
    name?: string;
    age?: number;
    gender?: string;
    language?: string;
    abhaId?: string;
    mobileNumber?: string;
    consentGiven?: boolean;
  }) => {
    const storeState = usePatientStore.getState();
    if (!storeState.id) {
      console.warn("No patient ID to update");
      return;
    }

    try {
      await updatePatient({
        patientId: storeState.id as any,
        ...updates,
      });
    } catch (error) {
      console.error("Failed to update patient:", error);
    }
  };

  return {
    loading,
    patient: patientData,
    persistPatientUpdate,
  };
}