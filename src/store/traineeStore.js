import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useTraineeStore = create(
  persist(
    (set) => ({
      cvFile: null,
      hasCvUploaded: false,
      extractedSkills: [],
      savedSkills: [],
      isExtracting: false,
      extractionError: null,
      setCvFile: (file) =>
        set({
          cvFile: file,
          hasCvUploaded: Boolean(file),
          extractionError: null,
        }),
      setHasCvUploaded: (hasCvUploaded) =>
        set({ hasCvUploaded: Boolean(hasCvUploaded) }),
      startExtraction: () => set({ isExtracting: true, extractionError: null }),
      finishExtraction: () => set({ isExtracting: false }),
      setExtractedSkills: (skills) =>
        set({
          extractedSkills: skills,
          isExtracting: false,
          extractionError: null,
        }),
      setExtractionError: (error) =>
        set({ extractionError: error, isExtracting: false }),
      removeSkill: (skill) =>
        set((state) => ({
          extractedSkills: state.extractedSkills.filter(
            (entry) => entry !== skill,
          ),
        })),
      addSkill: (skill) =>
        set((state) => ({
          extractedSkills: state.extractedSkills.includes(skill)
            ? state.extractedSkills
            : [...state.extractedSkills, skill],
        })),
      setSavedSkills: (skills) =>
        set({ savedSkills: Array.isArray(skills) ? skills : [] }),
    }),
    {
      name: "ims-trainee",
      version: 4,
      migrate: (persistedState) => ({
        hasCvUploaded: Boolean(persistedState?.hasCvUploaded),
        extractedSkills: [],
        savedSkills: [],
      }),
      partialize: (state) => ({
        hasCvUploaded: state.hasCvUploaded,
        extractedSkills: state.extractedSkills,
        savedSkills: state.savedSkills,
      }),
    },
  ),
);
