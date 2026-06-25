import { useCallback, useState, type SetStateAction } from "react";
import type { MemoryEntity } from "../types";

const DEFAULT_MEMORY: MemoryEntity[] = [{
  id: "mem_1",
  type: "Name -> Email",
  key: "Sahil",
  value: "sahilsingh107433@gmail.com",
  timestamp: new Date().toISOString(),
}];

function loadEntityLedger(): MemoryEntity[] {
  try {
    const saved = localStorage.getItem("memoryMatrix");
    if (!saved) return DEFAULT_MEMORY;
    
    return JSON.parse(saved) as MemoryEntity[];
  } catch (error) {
    console.error("Entity Resolution Error: Failed to parse matrix from local storage.", error);
    return DEFAULT_MEMORY;
  }
}

export function useMemoryMatrix() {
  const [memoryMatrix, setInternalMemoryMatrix] = useState<MemoryEntity[]>(loadEntityLedger);

  const setMemoryMatrix = useCallback((action: SetStateAction<MemoryEntity[]>) => {
    setInternalMemoryMatrix((prevMatrix) => {
      const newMatrix = typeof action === 'function' ? action(prevMatrix) : action;
      
      try {
        localStorage.setItem("memoryMatrix", JSON.stringify(newMatrix));
      } catch (error) {
        console.error("Entity Resolution Error: Failed to commit matrix to local storage.", error);
      }
      
      return newMatrix;
    });
  }, []);
  const persistMemoryMatrix = useCallback((entries: MemoryEntity[]) => {
    setMemoryMatrix(entries);
  }, [setMemoryMatrix]);

  return { memoryMatrix, setMemoryMatrix, persistMemoryMatrix };
}